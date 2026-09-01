import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { shownIn, undraggedSizeOf } from '../store'
import { sizeKeyOf } from '../clamps'
import type { OpenByZone, PanelSpec, Slot, Zone } from '../types'

export type ZoneView<Id extends string> = {
  /** What each half actually DRAWS — not what it holds: a `solo` panel silences the other. */
  primary?: PanelSpec<Id>
  secondary?: PanelSpec<Id>
  /** Whether the zone draws at all. An empty one takes neither room nor handle. */
  draws: boolean
  /** The zone's length along its own axis: a width for a column, a height for a strip. */
  size: number
  /** Where the divider between the two halves stands. Undefined means CSS divides them evenly. */
  split: number | undefined
  focused: boolean
}

/**
 * Everything one zone needs to draw itself. A hook rather than each frame reading the store,
 * because the answer decides the whole arrangement — which halves exist, and how much room
 * the zone takes from the centre.
 */
export function useZone<Id extends string = string>(zone: Zone): ZoneView<Id> {
  const registry = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)
  const open = usePanelsState<Id, OpenByZone<Id>>(state => state.open)
  const stored = usePanelsState<Id, number | undefined>(
    state => state.lengths.sizes[sizeKeyOf(zone)],
  )
  const split = usePanelsState<Id, number | undefined>(state => state.lengths.splits[zone])
  const focused = usePanelsState<Id, boolean>(state => state.focusedZone === zone)

  return useMemo(() => {
    const state = { registry, open }
    const shown = shownIn(state, zone)
    const specOf = (id: Id | undefined): PanelSpec<Id> | undefined =>
      id === undefined ? undefined : registry.find(spec => spec.id === id)

    const primary = specOf(shown.primary)
    const secondary = specOf(shown.secondary)

    return {
      ...(primary === undefined ? {} : { primary }),
      ...(secondary === undefined ? {} : { secondary }),
      draws: primary !== undefined || secondary !== undefined,
      // The zone's own size until the reader drags one, and the drag then serves the whole
      // zone: a length somebody chose is an answer about the COLUMN, not about the panel in it.
      size: stored ?? undraggedSizeOf(state, zone),
      split,
      focused,
    }
  }, [registry, open, zone, stored, split, focused])
}

/** The panels a rail draws for that zone, cut the way the zone itself is cut. */
export function useZonePanels<Id extends string = string>(zone: Zone): [Slot, PanelSpec<Id>[]][] {
  const registry = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)

  return useMemo(() => {
    const slots: [Slot, PanelSpec<Id>[]][] = [
      ['primary', registry.filter(spec => spec.zone === zone && spec.slot === 'primary')],
      ['secondary', registry.filter(spec => spec.zone === zone && spec.slot === 'secondary')],
    ]
    // An empty flex child still eats one of the rail's gaps — a hole where icons never were.
    return slots.filter(([, panels]) => panels.length > 0)
  }, [registry, zone])
}
