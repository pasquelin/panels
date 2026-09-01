import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { shownIn, zoneDraws, zoneTakesRoom } from '../store'
import { ZONES_BY_SIDE, type OpenByZone, type PanelSpec, type Zone } from '../types'

/**
 * What every reader of `shownIn` and `zoneDraws` needs: the declared panels, and which half of
 * each zone holds which.
 *
 * One hook because four of them had written the same pair of selectors and rebuilt the same
 * object by hand — so the shape those two functions expect could not change without touching
 * four files.
 */
export function useArrangement<Id extends string = string>(): {
  registry: PanelSpec<Id>[]
  open: OpenByZone<Id>
} {
  const registry = usePanelsState<Id, PanelSpec<Id>[]>(state => state.registry)
  const open = usePanelsState<Id, OpenByZone<Id>>(state => state.open)

  return useMemo(() => ({ registry, open }), [registry, open])
}

/** What a zone's two halves actually draw — a `solo` panel silences the other. */
export function useShownIn<Id extends string = string>(
  zone: Zone,
): { primary?: Id; secondary?: Id } {
  const arrangement = useArrangement<Id>()
  return useMemo(() => shownIn(arrangement, zone), [arrangement, zone])
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
