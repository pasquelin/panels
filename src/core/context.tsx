import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { createPanelsStore, type PanelsState, type PanelsStore } from './store'
import { browserStorage, readLayout, writeLayout, type LayoutStorage } from './persistence'
import { useIsomorphicLayoutEffect } from './layoutEffect'
import type { OpenByZone } from './types'

const PanelsContext = createContext<PanelsStore<string> | null>(null)

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
  /** Which halves start open, overriding "the first panel declared for that half". */
  defaultOpen?: OpenByZone<Id>
  children: ReactNode
}

export function PanelsProvider<Id extends string = string>({
  store,
  storageKey = 'panels:layout',
  storage,
  defaultOpen,
  children,
}: PanelsProviderProps<Id>) {
  // Settled on the first render and never again: swapping the storage under a live chassis would
  // read one key and write another, and the layout on screen would belong to neither.
  const [kept] = useState<LayoutStorage | null>(() =>
    storage === null ? null : (storage ?? browserStorage()),
  )

  const [made] = useState<PanelsStore<Id>>(
    () =>
      store ??
      createPanelsStore<Id>({
        initial: kept ? readLayout<Id>(kept, storageKey) : undefined,
      }),
  )

  // Before the paint, and after the panels have registered — a child's effect runs before its
  // parent's, and `<Frame>` registers in an effect of the same kind.
  useIsomorphicLayoutEffect(() => {
    // `defaultOpen` is deliberately read once: `settle` refuses to run twice, so a later change
    // would be silently ignored rather than half-applied.
    made.getState().settle(defaultOpen)
  }, [made, defaultOpen])

  useEffect(() => {
    if (!kept) return

    return made.subscribe(state => {
      // Never before the arrangement is settled: the empty state of the very first render would
      // be written over a layout the reader spent time arranging.
      if (!state.settled) return
      writeLayout(kept, storageKey, { open: state.open, lengths: state.lengths })
    })
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
