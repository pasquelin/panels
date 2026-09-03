import {
  DEFAULT_VIEW,
  SLOTS,
  ZONES,
  type LayoutState,
  type OpenByZone,
  type SizesByZone,
  type PanelPlacement,
  type PlacementLayout,
  type PlacementsByScope,
} from './types'

/**
 * Where a layout is kept. `localStorage` by default, so the library works the moment it is
 * installed; a project that stores elsewhere — a file, an API, `electron-store` — passes its own.
 */
export type LayoutStorage = {
  read: (key: string) => string | null
  write: (key: string, value: string) => void
}

export const memoryStorage = (): LayoutStorage => {
  const held = new Map<string, string>()
  return {
    read: key => held.get(key) ?? null,
    write: (key, value) => void held.set(key, value),
  }
}

/**
 * The browser's own, guarded: a private window, a disabled store or a full quota all throw, and
 * a layout that cannot be saved is not a reason to take the application down.
 */
export const browserStorage = (): LayoutStorage => ({
  read: key => {
    try {
      return globalThis.localStorage?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  write: (key, value) => {
    try {
      globalThis.localStorage?.setItem(key, value)
    } catch {
      // A layout is a convenience; losing it must never surface as a failure.
    }
  },
})

/**
 * What is written down, and the version it was written in. Only the arrangements and the sizes:
 * focus and the solo stash are session state — see `PanelsState`.
 */
type Stored<Id extends string> = LayoutState<Id> & { version: number }

/**
 * Bumped when the stored shape stops being one this build can restore.
 *
 * 2 keeps the views apart. A version 1 file held one arrangement under `open`, which is read back
 * as the view in front — nobody loses a layout to the upgrade.
 *
 * 🛑 NOT bumped for the placements a reader drags. That key only ever GREW the file: a build
 * without it ignores it, and this one reads a file without it. Bumped, an older bundle — a second
 * tab, a rollback — would have found a version it does not know and dropped the whole layout,
 * sizes and arrangements included, to reject a key it never needed.
 */
export const LAYOUT_VERSION = 2

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Keeps only the zones and slots this build knows, and only string ids.
 *
 * Rebuilt rather than cast: this comes back from storage, where an entry written by an older
 * version — or by hand — may name a zone that no longer exists. Cast, it would reach the frame
 * as a key nothing draws; rebuilt, it is simply dropped.
 */
function openFrom<Id extends string>(stored: Record<string, unknown>): OpenByZone<Id> {
  const open: OpenByZone<Id> = {}

  for (const zone of ZONES) {
    const held: unknown = stored[zone]
    if (!isRecord(held)) continue

    for (const slot of SLOTS) {
      const id: unknown = held[slot]
      // `null` is a half open on no panel in particular, and it is the state most halves are
      // written in — dropped here, every untouched half would come back CLOSED.
      if (id !== null && typeof id !== 'string') continue
      open[zone] = { ...open[zone], [slot]: id as Id | null }
    }
  }
  return open
}

/** Same rule for the lengths: a number under a zone this build knows, or nothing. */
function sizesFrom(stored: Record<string, unknown>): SizesByZone {
  const sizes: SizesByZone = {}

  for (const zone of ZONES) {
    const size: unknown = stored[zone]
    if (typeof size === 'number' && Number.isFinite(size)) sizes[zone] = size
  }
  return sizes
}

/** Every view a stored file names, or `undefined` if it names none this build can read. */
function viewsFrom<Id extends string>(
  parsed: Record<string, unknown>,
  view: string,
): Record<string, OpenByZone<Id>> | undefined {
  // A version 1 file held ONE arrangement, under `open`, at a time when there was one view to
  // put it in — so it comes back as the view being asked for, which is the only one that would
  // ever see it. Nobody loses a layout to the upgrade.
  if (parsed.version === 1) {
    return isRecord(parsed.open) ? { [view]: openFrom<Id>(parsed.open) } : undefined
  }
  if (parsed.version !== LAYOUT_VERSION || !isRecord(parsed.views)) return undefined

  // 🛑 No prototype: `JSON.parse` makes `__proto__` an own property, and assigning to it on a
  // plain object fires the SETTER — the view was lost, and the map's prototype became data from
  // the file, so a view named `left` would have inherited an arrangement that is not its own.
  const views: Record<string, OpenByZone<Id>> = Object.create(null) as Record<
    string,
    OpenByZone<Id>
  >
  for (const [name, held] of Object.entries(parsed.views)) {
    if (isRecord(held)) views[name] = openFrom<Id>(held)
  }
  return views
}

/** One panel's saved position, or nothing if it names a zone or a half this build cannot draw. */
function placementFrom(stored: unknown): PanelPlacement | undefined {
  if (!isRecord(stored)) return undefined

  // Matched against what this build knows rather than cast into it, exactly as `openFrom` does:
  // a zone renamed since the file was written is dropped, not drawn as a key nothing draws.
  const zone = ZONES.find(known => known === stored.zone)
  const slot = SLOTS.find(known => known === stored.slot)
  return zone !== undefined && slot !== undefined ? { zone, slot } : undefined
}

/**
 * The arrangements the reader has dragged, scope by scope.
 *
 * 🛑 No prototype on EITHER map: both are keyed by strings straight out of the file — scope names
 * here, panel ids inside — and `__proto__` assigned to a plain object fires the setter. The same
 * hazard `viewsFrom` guards against, one level deeper.
 */
function placementsFrom<Id extends string>(stored: Record<string, unknown>): PlacementsByScope<Id> {
  const placements: PlacementsByScope<Id> = Object.create(null) as PlacementsByScope<Id>

  for (const [scope, layout] of Object.entries(stored)) {
    if (!isRecord(layout) || !isRecord(layout.byId) || !Array.isArray(layout.order)) continue

    const byId: PlacementLayout<Id>['byId'] = Object.create(null) as PlacementLayout<Id>['byId']
    for (const [id, held] of Object.entries(layout.byId)) {
      const placement = placementFrom(held)
      if (placement) byId[id as Id] = placement
    }
    placements[scope] = {
      byId,
      order: layout.order.filter((id): id is Id => typeof id === 'string'),
    }
  }
  return placements
}

/**
 * Reads a stored layout back, dropping anything this build cannot make sense of. Returns
 * `undefined` rather than a partial answer: a half-read layout is worse than none, since the
 * project's own defaults are a deliberate arrangement and a corrupted one is not.
 *
 * A view the file does not name is simply absent, which is what tells the store to settle it —
 * so arriving straight at a view nobody has arranged yet opens its halves.
 *
 * `view` is the one starting in front, and it only matters for a version 1 file: that one held a
 * single arrangement, and this says which view inherits it.
 */
export function readLayout<Id extends string>(
  storage: LayoutStorage,
  key: string,
  view: string = DEFAULT_VIEW,
): LayoutState<Id> | undefined {
  const raw = storage.read(key)
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }

  if (!isRecord(parsed) || !isRecord(parsed.lengths)) return undefined

  const views = viewsFrom<Id>(parsed, view)
  if (!views) return undefined

  const lengths = parsed.lengths
  if (!isRecord(lengths.sizes) || !isRecord(lengths.splits)) return undefined

  const bandSplit = lengths.bandSplit
  return {
    views,
    lengths: {
      sizes: sizesFrom(lengths.sizes),
      splits: sizesFrom(lengths.splits),
      // Spread rather than written as `undefined`: an optional key holding `undefined` is not
      // the same as an absent one under `exactOptionalPropertyTypes`, and it would not survive
      // the JSON round trip either.
      ...(typeof bandSplit === 'number' && Number.isFinite(bandSplit) ? { bandSplit } : {}),
    },
    ...(isRecord(parsed.placements) ? { placements: placementsFrom<Id>(parsed.placements) } : {}),
  }
}

export function writeLayout<Id extends string>(
  storage: LayoutStorage,
  key: string,
  layout: LayoutState<Id>,
): void {
  const stored: Stored<Id> = {
    version: LAYOUT_VERSION,
    views: layout.views,
    lengths: layout.lengths,
    placements: layout.placements,
  }
  storage.write(key, JSON.stringify(stored))
}
