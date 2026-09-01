import { createStore, type StoreApi } from 'zustand/vanilla'
import {
  BAND_MAIN,
  DEFAULT_SIZES,
  fitSplit,
  fitted,
  fitZoneSize,
  isZoneOpen,
  OPPOSITE,
  sizeKeyOf,
  sizeOf,
} from './clamps'
import {
  SLOTS,
  ZONES,
  type Lengths,
  type OpenByZone,
  type PanelSpec,
  type Slot,
  type Zone,
  type ZoneSlots,
} from './types'

export type PanelsState<Id extends string = string> = {
  /** Panels declared by the project, in the order they mounted. The rail reads this. */
  registry: PanelSpec<Id>[]
  open: OpenByZone<Id>
  lengths: Lengths
  /** Last clicked zone: the one whose rail icon gets accented. */
  focusedZone: Zone | null
  /**
   * What a zone held before a `solo` panel took it whole. Never persisted: a column reopening
   * by itself days later, on an arrangement nobody remembers making, is not a restoration.
   */
  stashed: Partial<Record<Zone, ZoneSlots<Id>>>
  /** Whether the opening arrangement has been settled — see `settle`. */
  settled: boolean

  register: (spec: PanelSpec<Id>) => void
  unregister: (id: Id) => void
  /** Opens each untouched half on the first panel declared for it. Runs once. */
  settle: (defaults?: OpenByZone<Id>) => void

  show: (id: Id) => void
  close: (zone: Zone, slot: Slot) => void
  toggle: (id: Id) => void
  focus: (zone: Zone | null) => void

  /** `available`: the container's dimension along the zone's axis. */
  resize: (zone: Zone, size: number, available: number) => void
  /** Moves the divider between a zone's two halves. */
  resplit: (zone: Zone, size: number, available: number) => void
  /** Moves the divider BETWEEN the band's two zones, which is a width. */
  resplitBand: (size: number, available: number) => void
  /** Re-clamps every length after the container changed size. */
  fit: (width: number, height: number) => void
  reset: () => void
}

export type PanelsStore<Id extends string = string> = StoreApi<PanelsState<Id>>

/** The panel a project declares first for that half — what an untouched half opens on. */
function firstIn<Id extends string>(
  registry: PanelSpec<Id>[],
  zone: Zone,
  slot: Slot,
): Id | undefined {
  return registry.find(spec => spec.zone === zone && spec.slot === slot)?.id
}

function specOf<Id extends string>(registry: PanelSpec<Id>[], id: Id): PanelSpec<Id> | undefined {
  return registry.find(spec => spec.id === id)
}

/**
 * Both halves at once, because one can silence the other: a `solo` panel takes the zone WHOLE.
 * Resolved here rather than in each reader, which would contradict it.
 */
export function shownIn<Id extends string>(
  state: Pick<PanelsState<Id>, 'registry' | 'open'>,
  zone: Zone,
): { primary?: Id; secondary?: Id } {
  const slots = state.open[zone]
  const primary = slots?.primary
  if (primary !== undefined && specOf(state.registry, primary)?.solo === true) return { primary }

  const secondary = slots?.secondary
  return {
    ...(primary === undefined ? {} : { primary }),
    ...(secondary === undefined ? {} : { secondary }),
  }
}

/** Whether the zone draws at all — an empty one takes neither room nor handle. */
export function zoneDraws<Id extends string>(
  state: Pick<PanelsState<Id>, 'registry' | 'open'>,
  zone: Zone,
): boolean {
  const shown = shownIn(state, zone)
  return shown.primary !== undefined || shown.secondary !== undefined
}

/**
 * The size a zone opens at, the panel it is leading with. A panel may ask for more than the
 * zone's own default — a conversation at 260 wraps every sentence onto three lines.
 */
export function undraggedSizeOf<Id extends string>(
  state: Pick<PanelsState<Id>, 'registry' | 'open'>,
  zone: Zone,
): number {
  const leading = shownIn(state, zone).primary
  const asked = leading === undefined ? undefined : specOf(state.registry, leading)?.opens
  return Math.max(DEFAULT_SIZES[zone], asked ?? 0)
}

/**
 * The zone's halves after a panel is brought up, and the remaining stash.
 *
 * A `solo` panel takes the zone whole and puts the rest AWAY rather than closing it: the other
 * half comes back untouched when the solo panel leaves.
 */
function slotsShowing<Id extends string>(
  state: PanelsState<Id>,
  zone: Zone,
  slot: Slot,
  id: Id,
): [ZoneSlots<Id>, Partial<Record<Zone, ZoneSlots<Id>>>] {
  const held = state.open[zone] ?? {}
  const stashed = { ...state.stashed }

  if (specOf(state.registry, id)?.solo === true) {
    stashed[zone] = held
    return [{ [slot]: id }, stashed]
  }

  const leading = held.primary
  const soloing = leading !== undefined && specOf(state.registry, leading)?.solo === true
  if (!soloing) return [{ ...held, [slot]: id }, state.stashed]

  // Around what the zone had BEFORE the solo panel, never instead of it: the other half was
  // silenced, not closed, and rebuilding from the solo panel alone would shut it for good.
  const back = stashed[zone] ?? {}
  delete stashed[zone]
  return [{ ...back, [slot]: id }, stashed]
}

/**
 * The zone's halves after one is closed, and the remaining stash.
 *
 * Closing the solo panel gives the zone back what it was holding; closing anything else empties
 * that half and nothing more.
 */
function slotsClosing<Id extends string>(
  state: PanelsState<Id>,
  zone: Zone,
  slot: Slot,
): [ZoneSlots<Id>, Partial<Record<Zone, ZoneSlots<Id>>>] {
  const held = state.open[zone] ?? {}
  const leaving = held[slot]
  const stash = state.stashed[zone]

  if (stash && leaving !== undefined && specOf(state.registry, leaving)?.solo === true) {
    const stashed = { ...state.stashed }
    delete stashed[zone]
    return [stash, stashed]
  }

  const next = { ...held }
  delete next[slot]
  return [next, state.stashed]
}

export const EMPTY_LENGTHS: Lengths = { sizes: {}, splits: {} }

export type CreatePanelsStoreOptions<Id extends string> = {
  /** Restored layout, if any. Halves it names are taken as chosen and `settle` leaves them be. */
  initial?: Partial<{ open: OpenByZone<Id>; lengths: Lengths }>
}

export function createPanelsStore<Id extends string = string>(
  options: CreatePanelsStoreOptions<Id> = {},
): PanelsStore<Id> {
  const restored = options.initial

  return createStore<PanelsState<Id>>()((set, get) => ({
    registry: [],
    open: restored?.open ?? {},
    lengths: restored?.lengths ?? EMPTY_LENGTHS,
    focusedZone: null,
    stashed: {},
    settled: restored?.open !== undefined,

    register: spec =>
      set(state => {
        const without = state.registry.filter(held => held.id !== spec.id)
        return { registry: [...without, spec] }
      }),

    unregister: id =>
      set(state => {
        // The half it occupied is emptied with it: a stored id naming a panel the project no
        // longer declares would leave a frame with nothing to draw in it.
        const open = { ...state.open }
        for (const zone of ZONES) {
          const slots = open[zone]
          if (!slots) continue
          for (const slot of SLOTS) {
            if (slots[slot] !== id) continue
            const next = { ...slots }
            delete next[slot]
            open[zone] = next
          }
        }
        return { registry: state.registry.filter(spec => spec.id !== id), open }
      }),

    settle: defaults =>
      set(state => {
        if (state.settled) return state

        const open: OpenByZone<Id> = { ...(defaults ?? {}) }
        for (const zone of ZONES) {
          for (const slot of SLOTS) {
            if (open[zone]?.[slot] !== undefined) continue
            const first = firstIn(state.registry, zone, slot)
            if (first === undefined) continue
            open[zone] = { ...(open[zone] ?? {}), [slot]: first }
          }
        }
        return { open, settled: true }
      }),

    show: id =>
      set(state => {
        const spec = specOf(state.registry, id)
        if (!spec) return state

        const { zone, slot } = spec
        if (state.open[zone]?.[slot] === id) return { focusedZone: zone }

        const [slots, stashed] = slotsShowing(state, zone, slot, id)
        return { open: { ...state.open, [zone]: slots }, stashed, focusedZone: zone }
      }),

    close: (zone, slot) =>
      set(state => {
        const [slots, stashed] = slotsClosing(state, zone, slot)
        const open = { ...state.open, [zone]: slots }

        return {
          open,
          stashed,
          focusedZone:
            !isZoneOpen(open, zone) && state.focusedZone === zone ? null : state.focusedZone,
        }
      }),

    toggle: id => {
      const state = get()
      const spec = specOf(state.registry, id)
      if (!spec) return

      const shown = shownIn(state, spec.zone)[spec.slot] === id
      if (shown) state.close(spec.zone, spec.slot)
      else state.show(id)
    },

    focus: zone => set(state => (state.focusedZone === zone ? state : { focusedZone: zone })),

    // Guarded: a drag past the ceiling clamps to the same number for as long as the pointer
    // keeps going, and every write notifies every subscriber.
    resize: (zone, size, available) =>
      set(state => {
        const opposite = sizeOf(state.lengths, state.open, OPPOSITE[zone], held =>
          undraggedSizeOf(state, held),
        )
        const next = fitZoneSize(size, available, opposite)
        const key = sizeKeyOf(zone)
        if (next === state.lengths.sizes[key]) return state

        return { lengths: { ...state.lengths, sizes: { ...state.lengths.sizes, [key]: next } } }
      }),

    resplit: (zone, size, available) =>
      set(state => {
        const next = fitSplit(size, available)
        if (next === state.lengths.splits[zone]) return state

        return { lengths: { ...state.lengths, splits: { ...state.lengths.splits, [zone]: next } } }
      }),

    resplitBand: (size, available) =>
      set(state => {
        const next = fitSplit(size, available)
        if (next === state.lengths.bandSplit) return state

        return { lengths: { ...state.lengths, bandSplit: next } }
      }),

    fit: (width, height) =>
      set(state => ({
        lengths: fitted(state.lengths, state.open, width, height, zone =>
          undraggedSizeOf(state, zone),
        ),
      })),

    reset: () =>
      set(state => ({
        open: {},
        lengths: EMPTY_LENGTHS,
        focusedZone: null,
        // Left behind, a solo panel closed after a reset would give back the zone the reset
        // had just cleared.
        stashed: {},
        settled: false,
        registry: state.registry,
      })),
  }))
}

export { BAND_MAIN }
