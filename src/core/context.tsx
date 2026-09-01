import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { createPanelsStore, isSettled, type PanelsState, type PanelsStore } from './store'
import { browserStorage, readLayout, writeLayout, type LayoutStorage } from './persistence'
import { useIsomorphicLayoutEffect } from './layoutEffect'
import { DEFAULT_VIEW, type OpenByZone } from './types'

const PanelsContext = createContext<PanelsStore<string> | null>(null)

/**
 * How long a change may wait before it is on disk. Short enough that a crash loses one gesture
 * at most, long enough that a drag pays for one write rather than for one per frame.
 */
const WRITE_EVERY = 250

export type PanelsProviderProps<Id extends string> = {
  /**
   * A store built by the project. Pass one to drive the chassis from OUTSIDE React — a socket
   * message, a native menu, a keyboard shortcut all call `store.getState().show(id)`. Left out,
   * the provider makes its own.
   */
  store?: PanelsStore<Id>
  /** Key the layout is stored under. Two chassis in one application need two keys. */
  storageKey?: string
  /** Where the layout is kept. `localStorage` by default; `null` disables persistence. */
  storage?: LayoutStorage | null
  /** Which halves start open, overriding "every half something is declared for". */
  defaultOpen?: OpenByZone<Id>
  /**
   * The view in front. Each view keeps its OWN open panels, so two parts of one application can
   * arrange their columns differently — and find them as they left them on the way back.
   *
   * The lengths are shared on purpose: a column that changed width on the way to another view
   * reads as another window.
   *
   * Left out, everything lands in one view and nothing about this is visible.
   */
  view?: string
  children: ReactNode
}

export function PanelsProvider<Id extends string = string>({
  store,
  storageKey = 'panels:layout',
  storage,
  defaultOpen,
  view,
  children,
}: PanelsProviderProps<Id>) {
  // Settled on the first render and never again: swapping the storage under a live chassis would
  // read one key and write another, and the layout on screen would belong to neither.
  const [kept] = useState<LayoutStorage | null>(() =>
    storage === null ? null : (storage ?? browserStorage()),
  )

  const [made] = useState<PanelsStore<Id>>(() => {
    const opening = view ?? DEFAULT_VIEW
    const initial = kept ? readLayout<Id>(kept, storageKey, opening) : undefined
    if (!store) return createPanelsStore<Id>({ view: opening, initial })

    // A store the project built is filled rather than replaced: it was never handed the stored
    // layout, so the chassis opened on nothing and then OVERWROTE the file on the first write —
    // a project lost its arrangement on every launch for having brought its own store.
    if (initial) store.setState(initial)
    return store
  })

  // Before the paint, and after the panels have registered — a child's effect runs before its
  // parent's, and `<Frame>` declares in an effect of the same kind. So the view is brought
  // forward once the panels it offers are known, and settled against them.
  //
  // 🛑 No dependency array, and that is what makes `view` a CONTROLLED prop: with one, the
  // reconciliation only ran when a dep changed identity — so a `setView` made behind the prop's
  // back stuck, unless an unrelated `defaultOpen` written inline happened to rerun the effect.
  // Two projects writing the same code got opposite contracts. Both calls below return early
  // when there is nothing to do, so running every render writes nothing.
  useIsomorphicLayoutEffect(() => {
    const state = made.getState()
    // Only when the project names one. Defaulted, this claimed the view on every render — so a
    // `setView` made from a native menu or a socket was undone at the next unrelated render of
    // some ancestor, which is the worst way to fail: correct, then silently not.
    if (view !== undefined) state.setView(view)
    // `defaultOpen` is deliberately read per view: `settle` refuses to run twice for the same
    // one, so a later change is ignored rather than half-applied.
    state.settle(defaultOpen)
  })

  useEffect(() => {
    if (!kept) return

    // What was last written, and what is waiting to be, by reference. The store notifies on
    // EVERY write — a focus, a measure, a view brought forward — and comparing the two
    // references is what keeps those from re-serialising the whole file for a change it does
    // not carry.
    //
    // The two references alone: holding the whole state would pin the registry, and with it
    // every panel's content, for as long as the chassis lives.
    type Written = Pick<PanelsState<Id>, 'views' | 'lengths'>
    let written: Written | undefined
    let pending: Written | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    const flush = (): void => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
      if (!pending) return

      written = pending
      pending = undefined
      writeLayout(kept, storageKey, written)
    }

    const unsubscribe = made.subscribe(state => {
      // Never before the view in front is settled: the empty state of the very first render
      // would be written over a layout the reader spent time arranging.
      if (!isSettled(state, state.view)) return
      const last = pending ?? written
      if (last?.views === state.views && last.lengths === state.lengths) return

      // 🛑 Held, not written: a drag writes on every `pointermove`, and `localStorage` is
      // synchronous — sixty serialisations a second, on the thread that draws the drag. One
      // write per `WRITE_EVERY` carries the latest state, and the pointer never waits on disk.
      pending = { views: state.views, lengths: state.lengths }
      timer ??= setTimeout(flush, WRITE_EVERY)
    })

    // The window may go before the timer fires: what is pending is written on the way out.
    globalThis.addEventListener?.('pagehide', flush)
    return () => {
      unsubscribe()
      globalThis.removeEventListener?.('pagehide', flush)
      flush()
    }
  }, [kept, made, storageKey])

  return (
    <PanelsContext.Provider value={made as unknown as PanelsStore<string>}>
      {children}
    </PanelsContext.Provider>
  )
}

/** The store this chassis runs on. Throws outside a provider rather than answering nothing. */
export function usePanelsStore<Id extends string = string>(): PanelsStore<Id> {
  const store = useContext(PanelsContext)
  if (!store) throw new Error('usePanelsStore must be used inside a <Panels> or <PanelsProvider>')

  return store as unknown as PanelsStore<Id>
}

/** A slice of the chassis state, subscribed. */
export function usePanelsState<Id extends string, T>(selector: (state: PanelsState<Id>) => T): T {
  const store = usePanelsStore<Id>()
  return useStore(store, selector)
}

/**
 * The actions, which are stable for the store's lifetime — subscribing to them would only add
 * selectors re-run on every write.
 */
export function usePanelsActions<Id extends string = string>() {
  const store = usePanelsStore<Id>()

  return useMemo(() => {
    const { show, close, toggle, focus, resize, resplit, resplitBand, fit, reset } =
      store.getState()
    return { show, close, toggle, focus, resize, resplit, resplitBand, fit, reset }
  }, [store])
}
