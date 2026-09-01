import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { shownIn, undraggedSizeOf } from '../store'
import { OPPOSITE, sharedSizes, sizeKeyOf } from '../clamps'
import {
  isHorizontal,
  type Lengths,
  type OpenByZone,
  type PanelSpec,
  type Slot,
  type Zone,
} from '../types'

export type ZoneView<Id extends string> = {
  /** What each half actually DRAWS — not what it holds: a `solo` panel silences the other. */
  primary?: PanelSpec<Id>
  secondary?: PanelSpec<Id>
  /** Whether the zone draws at all. An empty one takes neither room nor handle. */
  draws: boolean
  /** The zone's length along its own axis, already bounded so the centre keeps its floor. */
  size: number
  /** Where the divider between the two halves stands. Undefined means CSS divides them evenly. */
  split: number | undefined
  focused: boolean
}

/** What a zone WANTS: what was dragged for it, or what its leading panel asks for. */
function wantedSize<Id extends string>(
  state: { registry: PanelSpec<Id>[]; open: OpenByZone<Id> },
  lengths: Lengths,
  zone: Zone,
): number {
  const shown = shownIn(state, zone)
  if (shown.primary === undefined && shown.secondary === undefined) return 0

  // The zone's own size until the reader drags one, and the drag then serves the whole zone: a
  // length somebody chose is an answer about the COLUMN, not about the panel that was in it.
  return lengths.sizes[sizeKeyOf(zone)] ?? undraggedSizeOf(state, zone)
}

/**
 * Everything one zone needs to draw itself.
 *
 * The size it answers is BOUNDED, not merely stored: two untouched columns asking for 320 and
 * 380 leave a 900 px container 104 px of centre, well under its floor, and nothing in the stored
 * lengths would have caught it — there is nothing stored at all. `sharedSizes` is where that is
 * settled, against the opposite zone and the room actually measured.
 */
export function useZone<Id extends string = string>(zone: Zone): ZoneView<Id> {
  const registry = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)
  const open = usePanelsState<Id, OpenByZone<Id>>(state => state.open)
  const lengths = usePanelsState<Id, Lengths>(state => state.lengths)
  const available = usePanelsState<Id, { width: number; height: number }>(state => state.available)
  const split = usePanelsState<Id, number | undefined>(state => state.lengths.splits[zone])
  const focused = usePanelsState<Id, boolean>(state => state.focusedZone === zone)

  return useMemo(() => {
    const state = { registry, open }
    const shown = shownIn(state, zone)
    const specOf = (id: Id | undefined): PanelSpec<Id> | undefined =>
      id === undefined ? undefined : registry.find(spec => spec.id === id)

    const primary = specOf(shown.primary)
    const secondary = specOf(shown.secondary)
    const draws = primary !== undefined || secondary !== undefined

    const wanted = wantedSize(state, lengths, zone)
    const room = isHorizontal(zone) ? available.height : available.width
    // Zero until the container has been measured: bounding against nothing would collapse every
    // zone to its floor on the very first paint.
    const size =
      room === 0 || !draws
        ? wanted
        : sharedSizes(wanted, wantedSize(state, lengths, OPPOSITE[zone]), room)[0]

    return {
      ...(primary === undefined ? {} : { primary }),
      ...(secondary === undefined ? {} : { secondary }),
      draws,
      size,
      split,
      focused,
    }
  }, [registry, open, lengths, available, zone, split, focused])
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
