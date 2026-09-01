import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { specOf, undraggedSizeOf } from '../store'
import { OPPOSITE, sharedSizes, sizeKeyOf } from '../clamps'
import { isHorizontal, type PanelSpec, type Slot, type Zone } from '../types'
import { useArrangement, useShownIn, useZoneTakesRoom } from './useArrangement'

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

/**
 * The length a zone WANTS: what was dragged for it, or what its leading panel asks for.
 *
 * Takes the stored size rather than reading it, so the caller subscribes to one number instead
 * of to the whole `lengths` object — which every resize replaces, waking all five zones.
 */
function wantedSize<Id extends string>(
  registry: PanelSpec<Id>[],
  leading: Id | undefined,
  stored: number | undefined,
  zone: Zone,
  draws: boolean,
): number {
  if (!draws) return 0

  // The zone's own size until the reader drags one, and the drag then serves the whole zone: a
  // length somebody chose is an answer about the COLUMN, not about the panel that was in it.
  return stored ?? undraggedSizeOf(registry, zone, leading)
}

/**
 * Everything one zone needs to draw itself.
 *
 * The size it answers is BOUNDED, not merely stored: two untouched columns asking for 320 and
 * 380 leave a 900 px container 104 px of centre, well under its floor, and nothing in the stored
 * lengths would have caught it — there is nothing stored at all. `sharedSizes` settles that,
 * against the opposite zone and the room actually measured.
 *
 * 🛑 The selectors are SCALAR on purpose. Subscribing to `lengths` or to `available` as objects
 * woke every mounted zone on each `pointermove` of a drag, because both are replaced wholesale
 * on every write — five re-renders a frame where two are owed.
 */
export function useZone<Id extends string = string>(zone: Zone): ZoneView<Id> {
  const arrangement = useArrangement<Id>()
  const shown = useShownIn<Id>(zone)
  const facing = useShownIn<Id>(OPPOSITE[zone])
  // What the OPPOSITE zone takes off the shared axis, which for the band is the whole strip:
  // asked per half, `top` believed nothing faced it whenever the other half was the open one.
  const facingTakesRoom = useZoneTakesRoom<Id>(OPPOSITE[zone])

  const stored = usePanelsState<Id, number | undefined>(
    state => state.lengths.sizes[sizeKeyOf(zone)],
  )
  const storedFacing = usePanelsState<Id, number | undefined>(
    state => state.lengths.sizes[sizeKeyOf(OPPOSITE[zone])],
  )
  const split = usePanelsState<Id, number | undefined>(state => state.lengths.splits[zone])
  const room = usePanelsState<Id, number>(state =>
    isHorizontal(zone) ? state.available.height : state.available.width,
  )
  const focused = usePanelsState<Id, boolean>(state => state.focusedZone === zone)

  return useMemo(() => {
    const { registry } = arrangement
    const primary = specOf(registry, shown.primary)
    const secondary = specOf(registry, shown.secondary)
    const draws = primary !== undefined || secondary !== undefined

    const wanted = wantedSize(registry, shown.primary, stored, zone, draws)
    const wantedFacing = wantedSize(
      registry,
      facing.primary,
      storedFacing,
      OPPOSITE[zone],
      facingTakesRoom,
    )

    return {
      primary,
      secondary,
      draws,
      // Zero until the container has been measured: bounding against nothing would collapse
      // every zone to its floor on the very first paint.
      size: room === 0 ? wanted : sharedSizes(wanted, wantedFacing, room)[0],
      split,
      focused,
    }
  }, [
    arrangement,
    shown,
    facing,
    facingTakesRoom,
    stored,
    storedFacing,
    room,
    split,
    focused,
    zone,
  ])
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
