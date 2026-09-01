import { useCallback, useMemo } from 'react'
import { usePanelsActions, usePanelsState, usePanelsStore } from '../context'
import { shownIn } from '../store'
import type { OpenByZone, PanelSpec, Zone } from '../types'

export type PanelsApi<Id extends string> = {
  /** Every panel the project has declared, in declaration order. */
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
  const panels = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)
  // Subscribed rather than read on demand: this hook's whole job is to let a component OUTSIDE
  // the chassis follow it, and a component that does not re-render follows nothing.
  const open = usePanelsState<Id, OpenByZone<Id>>(state => state.open)
  const focusedZone = usePanelsState<Id, Zone | null>(state => state.focusedZone)
  const actions = usePanelsActions<Id>()

  const isShown = useCallback(
    (id: Id) => {
      const spec = panels.find(held => held.id === id)
      return spec !== undefined && shownIn({ registry: panels, open }, spec.zone)[spec.slot] === id
    },
    [panels, open],
  )

  const close = useCallback(
    (id: Id) => {
      const spec = panels.find(held => held.id === id)
      // Asked about THIS panel: `close(zone, slot)` empties the half whatever stands in it, and
      // two panels share a half — closing the wrong one and reporting success.
      if (!spec || shownIn({ registry: panels, open }, spec.zone)[spec.slot] !== id) return

      store.getState().close(spec.zone, spec.slot)
    },
    [panels, open, store],
  )

  return useMemo(
    () => ({
      panels,
      reveal: actions.show,
      close,
      toggle: actions.toggle,
      isShown,
      focusedZone,
      reset: actions.reset,
    }),
    [panels, actions.show, actions.toggle, actions.reset, close, isShown, focusedZone],
  )
}
