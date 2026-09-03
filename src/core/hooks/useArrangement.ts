import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { shownIn, shownSpecsIn, zoneDraws, zoneTakesRoom, type Arranged } from '../store'
import {
  ZONES_BY_SIDE,
  type OpenByZone,
  type PanelSpec,
  type PlacementsByScope,
  type Zone,
} from '../types'

/**
 * What every reader of `shownIn` and `zoneDraws` needs: the declared panels, and the view whose
 * arrangement they are about.
 *
 * One hook because four of them had written the same selectors and rebuilt the same object by
 * hand — so the shape those functions expect could not change without touching four files.
 */
export function useArrangement<Id extends string = string>(): Arranged<Id> {
  const registry = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)
  const view = usePanelsState<Id, string>(state => state.view)
  // The view in front alone: subscribed to the whole map, every zone would wake on a write to
  // an arrangement that is not even on screen.
  const open = usePanelsState<Id, OpenByZone<Id> | undefined>(state => state.views[state.view])
  const placements = usePanelsState<Id, PlacementsByScope<Id>>(state => state.placements)
  const placementScope = usePanelsState<Id, string | null>(state => state.placementScope)

  return useMemo(
    () => ({
      registry,
      view,
      views: open === undefined ? {} : { [view]: open },
      placements,
      placementScope,
    }),
    [registry, view, open, placements, placementScope],
  )
}

/** What a zone's two halves actually draw — a `solo` panel silences the other. */
export function useShownIn<Id extends string = string>(
  zone: Zone,
): { primary?: Id; secondary?: Id } {
  const arrangement = useArrangement<Id>()
  return useMemo(() => shownIn(arrangement, zone), [arrangement, zone])
}

/** The same answer as specs, for a caller that needs more of the panel than its name. */
export function useShownSpecsIn<Id extends string = string>(
  zone: Zone,
): { primary?: PanelSpec<Id>; secondary?: PanelSpec<Id> } {
  const arrangement = useArrangement<Id>()
  return useMemo(() => shownSpecsIn(arrangement, zone), [arrangement, zone])
}

/** Whether a zone draws at all. An empty one takes neither room nor handle. */
export function useZoneDraws<Id extends string = string>(zone: Zone): boolean {
  const arrangement = useArrangement<Id>()
  return useMemo(() => zoneDraws(arrangement, zone), [arrangement, zone])
}

/**
 * Whether a zone takes room off the axis it shares with its opposite — the band counting as one
 * strip. See `zoneTakesRoom`: this is not the same question as whether it draws.
 */
export function useZoneTakesRoom<Id extends string = string>(zone: Zone): boolean {
  const arrangement = useArrangement<Id>()
  return useMemo(() => zoneTakesRoom(arrangement, zone), [arrangement, zone])
}

/**
 * Whether each half of the band draws anything — what the frame asks before it arranges itself:
 * a column runs to the FOOT unless the band's half on its side is drawing.
 *
 * Headless, so it lives here rather than beside `<Band>`: a project replacing the band must be
 * able to ask this without importing from a component file.
 */
export function useBandHalves<Id extends string = string>(): { left: boolean; right: boolean } {
  return {
    left: useZoneDraws<Id>(ZONES_BY_SIDE.left.band),
    right: useZoneDraws<Id>(ZONES_BY_SIDE.right.band),
  }
}
