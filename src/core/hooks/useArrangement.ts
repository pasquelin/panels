import { useMemo } from 'react'
import { usePanelsState } from '../context'
import { shownIn, zoneDraws } from '../store'
import type { OpenByZone, PanelSpec, Zone } from '../types'

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
