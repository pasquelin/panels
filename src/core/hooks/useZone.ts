import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { arrangedRegistry, shownSpecsIn, undraggedSizeOf, zoneTakesRoom } from '../store'
import { OPPOSITE, sharedSizes, sizeKeyOf } from '../clamps'
import { isHorizontal, SLOTS, type PanelSpec, type Slot, type Zone } from '../types'
import { useArrangement } from './useArrangement'

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
  leading: PanelSpec<Id> | undefined,
  stored: number | undefined,
  zone: Zone,
  draws: boolean,
): number {
  if (!draws) return 0

  // The zone's own size until the reader drags one, and the drag then serves the whole zone: a
  // length somebody chose is an answer about the COLUMN, not about the panel that was in it.
  return stored ?? undraggedSizeOf(zone, leading)
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
  // ONE subscription to the arrangement, read three ways below. Three hooks each subscribed to
  // it on their own put fourteen selectors on every zone, rerun on every write to the store.
  const arrangement = useArrangement<Id>()

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
    const { primary, secondary } = shownSpecsIn(arrangement, zone)
    const draws = primary !== undefined || secondary !== undefined

    // What the OPPOSITE zone takes off the shared axis, which for the band is the whole strip:
    // asked per half, `top` believed nothing faced it whenever the other half was the open one.
    const facing = shownSpecsIn(arrangement, OPPOSITE[zone])
    const facingTakesRoom = zoneTakesRoom(arrangement, OPPOSITE[zone])

    const wanted = wantedSize(primary, stored, zone, draws)
    const wantedFacing = wantedSize(facing.primary, storedFacing, OPPOSITE[zone], facingTakesRoom)

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
  }, [arrangement, stored, storedFacing, room, split, focused, zone])
}

/**
 * The panels of that zone, half by half, cut the way the zone itself is cut.
 *
 * BOTH halves, empty ones included: what a rail draws for an empty half is the rail's own
 * question — nothing while it is at rest, a place to land while a panel is being carried — and
 * answering it here left the caller rebuilding the half this had just dropped.
 *
 * 🛑 Keyed on the ARRANGED registry, not on the arrangement. That object is replaced by every
 * show, close and focus, and which panels a rail holds depends on none of them: keyed on it, five
 * rails filtered the whole registry twice over on every panel a reader opened.
 */
export function useZonePanels<Id extends string = string>(zone: Zone): [Slot, PanelSpec<Id>[]][] {
  const registry = arrangedRegistry(useArrangement<Id>())

  return useMemo(
    () =>
      SLOTS.map(slot => [slot, registry.filter(spec => spec.zone === zone && spec.slot === slot)]),
    [registry, zone],
  )
}
