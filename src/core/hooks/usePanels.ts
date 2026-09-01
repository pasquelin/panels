import { useCallback, useMemo } from 'react'
import { usePanelsActions, usePanelsState, usePanelsStore } from '../context'
import { shownIn } from '../store'
import type { PanelSpec, Zone } from '../types'

export type PanelsApi<Id extends string> = {
  /** Every panel the project has declared, in declaration order. */
  panels: PanelSpec<Id>[]
  /** Brings a panel up in the half it declared, and focuses its zone. */
  reveal: (id: Id) => void
  /** Closes THIS panel, or nothing — never whatever happens to stand in its half. */
  close: (id: Id) => void
  /** Reveals it if hidden, closes it if shown. What a rail icon does. */
  toggle: (id: Id) => void
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
  const focusedZone = usePanelsState<Id, Zone | null>(state => state.focusedZone)
  const actions = usePanelsActions<Id>()

  const isShown = useCallback(
    (id: Id) => {
      const state = store.getState()
      const spec = state.registry.find(held => held.id === id)
      return spec !== undefined && shownIn(state, spec.zone)[spec.slot] === id
    },
    [store],
  )

  const close = useCallback(
    (id: Id) => {
      const state = store.getState()
      const spec = state.registry.find(held => held.id === id)
      // Asked about THIS panel: `close(zone, slot)` empties the half whatever stands in it, and
      // two panels share a half — closing the wrong one and reporting success.
      if (!spec || shownIn(state, spec.zone)[spec.slot] !== id) return

      state.close(spec.zone, spec.slot)
    },
    [store],
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
