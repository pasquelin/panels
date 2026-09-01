import { SLOTS, ZONES, type Lengths, type OpenByZone, type SizesByZone } from './types'

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
 * What is written down, and the version it was written in. Only the arrangement and the sizes:
 * focus and the solo stash are session state — see `PanelsState`.
 */
type Stored<Id extends string> = {
  version: number
  open: OpenByZone<Id>
  lengths: Lengths
}

/** Bumped when the stored shape stops being one this build can restore. */
export const LAYOUT_VERSION = 1

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
      if (typeof id !== 'string') continue
      open[zone] = { ...open[zone], [slot]: id as Id }
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

/**
 * Reads a stored layout back, dropping anything this build cannot make sense of. Returns
 * `undefined` rather than a partial answer: a half-read layout is worse than none, since the
 * project's own defaults are a deliberate arrangement and a corrupted one is not.
 */
export function readLayout<Id extends string>(
  storage: LayoutStorage,
  key: string,
): { open: OpenByZone<Id>; lengths: Lengths } | undefined {
  const raw = storage.read(key)
  if (raw === null) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }

  if (!isRecord(parsed) || parsed.version !== LAYOUT_VERSION) return undefined
  if (!isRecord(parsed.open) || !isRecord(parsed.lengths)) return undefined

  const lengths = parsed.lengths
  if (!isRecord(lengths.sizes) || !isRecord(lengths.splits)) return undefined

  const bandSplit = lengths.bandSplit
  return {
    open: openFrom<Id>(parsed.open),
    lengths: {
      sizes: sizesFrom(lengths.sizes),
      splits: sizesFrom(lengths.splits),
      bandSplit:
        typeof bandSplit === 'number' && Number.isFinite(bandSplit) ? bandSplit : undefined,
    },
  }
}

export function writeLayout<Id extends string>(
  storage: LayoutStorage,
  key: string,
  layout: { open: OpenByZone<Id>; lengths: Lengths },
): void {
  const stored: Stored<Id> = { version: LAYOUT_VERSION, ...layout }
  storage.write(key, JSON.stringify(stored))
}
