import { useCallback, useMemo } from 'react'
import { usePanelsActions, usePanelsState, usePanelsStore } from '../context'
import { arrangedRegistry, shownIn, specOf } from '../store'
import { useArrangement } from './useArrangement'
import type { PanelSpec, Zone } from '../types'

export type PanelsApi<Id extends string> = {
  /**
   * Every panel the project has declared, as the reader has arranged them: their order, and each
   * one carrying the `zone` and `slot` it stands in rather than the ones it was declared with.
   *
   * 🛑 Arranged, like `isShown` and `close` beside it. Handed the declaration instead, a header
   * or a rail of your own placed an icon in the zone a panel USED to be in while `isShown`
   * answered about the one it had been moved to — three neighbouring answers, two of them true.
   */
  panels: PanelSpec<Id>[]
  /** Brings a panel up in the half it declared, and focuses its zone. */
  reveal: (id: Id) => void
  /** Closes THIS panel, or nothing — never whatever happens to stand in its half. */
  close: (id: Id) => void
  /** Reveals it if hidden, closes it if shown. What a rail icon does. */
  toggle: (id: Id) => void
  /**
   * Whether that panel is on screen right now.
   *
   * 🛑 Subscribed, and that is the whole point of reading `open` above: written as a plain
   * `getState()` read it answered correctly on the render it was called in and never ran again,
   * so a header built on it kept showing the arrangement as it stood when it last mounted.
   */
  isShown: (id: Id) => boolean
  focusedZone: Zone | null
  reset: () => void
}

/**
 * The chassis, as a project drives it. Everything a header, a shortcut or a menu needs to act
 * on the panels without knowing anything about how they are laid out.
 */
export function usePanels<Id extends string = string>(): PanelsApi<Id> {
  const store = usePanelsStore<Id>()
  // Subscribed rather than read on demand: this hook's whole job is to let a component OUTSIDE
  // the chassis follow it, and a component that does not re-render follows nothing.
  const arrangement = useArrangement<Id>()
  const focusedZone = usePanelsState<Id, Zone | null>(state => state.focusedZone)
  const actions = usePanelsActions<Id>()

  const isShown = useCallback(
    (id: Id) => {
      // Arranged: a panel the reader has dragged elsewhere is on screen in the half they put it
      // in, and the declared spec still names the one the project chose.
      const spec = specOf(arrangedRegistry(arrangement), id)
      return spec !== undefined && shownIn(arrangement, spec.zone)[spec.slot] === id
    },
    [arrangement],
  )

  const close = useCallback(
    (id: Id) => {
      const spec = specOf(arrangedRegistry(arrangement), id)
      // Asked about THIS panel: `close(zone, slot)` empties the half whatever stands in it, and
      // two panels share a half — closing the wrong one and reporting success.
      if (!spec || shownIn(arrangement, spec.zone)[spec.slot] !== id) return

      store.getState().close(spec.zone, spec.slot)
    },
    [arrangement, store],
  )

  return useMemo(
    () => ({
      panels: arrangedRegistry(arrangement),
      reveal: actions.show,
      close,
      toggle: actions.toggle,
      isShown,
      focusedZone,
      reset: actions.reset,
    }),
    [arrangement, actions.show, actions.toggle, actions.reset, close, isShown, focusedZone],
  )
}
