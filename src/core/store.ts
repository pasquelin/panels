import { createStore } from 'zustand/vanilla'
import { DEFAULT_SIZES, fitSplit, fitted, fitZoneSize, OPPOSITE, sizeKeyOf, sizeOf } from './clamps'
import {
  BOTTOM_ZONES,
  isBottom,
  SLOTS,
  ZONES,
  type Lengths,
  type OpenByZone,
  type PanelSpec,
  type LayoutState,
  type Slot,
  type Zone,
  type ZoneSlots,
  DEFAULT_VIEW,
} from './types'

export type PanelsState<Id extends string = string> = {
  /** Panels declared by the project, in the order it declares them. The rail reads this. */
  registry: PanelSpec<Id>[]
  /** Name of the view in front. One view is all a project needs until it has two. */
  view: string
  /**
   * Every view's arrangement — which half of which zone holds what — the one in front included.
   * A view is settled once it has an entry here, which is what `settle` writes and `reset`
   * clears: no second field can then disagree about which views have been opened.
   */
  views: Record<string, OpenByZone<Id>>
  lengths: Lengths
  /**
   * Halves the project wants open whatever the panels say, as last passed to `settle`. Held so
   * that a view arriving later — or a `reset` — is settled the same way the first one was,
   * without waiting for React to hand them over again.
   */
  defaults?: OpenByZone<Id>
  /** Last clicked zone: the one whose rail icon gets accented. */
  focusedZone: Zone | null
  /**
   * What a zone held before a `solo` panel took it whole. Never persisted: a column reopening
   * by itself days later, on an arrangement nobody remembers making, is not a restoration.
   */
  stashed: Partial<Record<Zone, ZoneSlots<Id>>>
  /**
   * The room the zones and the centre share, as last measured. Held in the store rather than
   * read per component: every zone has to be bounded against the SAME number, and against what
   * the opposite zone is taking out of it.
   */
  available: { width: number; height: number }

  /**
   * The panels the project declares, in the order the rail stacks them. Posted whole rather
   * than one at a time: the list IS the order, so a panel that goes and comes back — behind a
   * right, a route, a connection — returns to its place instead of to the end.
   */
  declare: (specs: PanelSpec<Id>[]) => void
  /**
   * Opens each untouched half of the view in front, naming no panel. Runs once per view — and
   * remembers `defaults`, so the views that come later open the same way.
   */
  settle: (defaults?: OpenByZone<Id>) => void
  /**
   * Brings another view forward, putting the one in front away as it stands. Its panels come
   * back untouched when it returns; the lengths are shared, so no column changes width.
   */
  setView: (view: string) => void

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

/**
 * The store, as consumers see it.
 *
 * 🛑 Declared here rather than re-exported from zustand. zustand is BUNDLED into `dist/`, so a
 * consumer has no such package installed — a declaration naming `zustand/vanilla` failed their
 * typecheck with TS2307, on a package that advertises no dependencies. Four methods is the whole
 * surface, and writing them out is what "the consumer never sees zustand" actually means.
 */
export type PanelsStore<Id extends string = string> = {
  getState: () => PanelsState<Id>
  getInitialState: () => PanelsState<Id>
  setState: (
    partial: Partial<PanelsState<Id>> | ((state: PanelsState<Id>) => Partial<PanelsState<Id>>),
    replace?: false,
  ) => void
  subscribe: (listener: (state: PanelsState<Id>, previous: PanelsState<Id>) => void) => () => void
}

/**
 * What the readers below need of the state: the declared panels, and the arrangement of the view
 * in front. Named because five exported functions take it, and `Pick` written out five times was
 * five places to edit the day the shape moved.
 */
export type Arranged<Id extends string = string> = {
  registry: PanelSpec<Id>[]
  view: string
  /**
   * 🛑 Only the entry named by `view` is ever read. Written out rather than `Pick`ed off
   * `PanelsState`, whose own `views` promises EVERY arrangement: a caller handed this one — the
   * hooks build it from the view on screen alone — would have read that promise and believed it.
   */
  views: Record<string, OpenByZone<Id>>
}

/** The arrangement of the view in front. Empty until that view has been settled. */
export function openOf<Id extends string>(state: Arranged<Id>): OpenByZone<Id> {
  return state.views[state.view] ?? {}
}

/**
 * The arrangement a view opens on: every half something is declared for, naming no panel, plus
 * whatever the project asked for by name.
 *
 * Pulled out of `settle` because three actions need it — settling, arriving at a view nobody has
 * opened yet, and resetting. Reachable only through `set`, a view arrived at from OUTSIDE React
 * stayed unsettled until some ancestor happened to re-render, which is to say: a blank chassis
 * for an indeterminate time.
 */
function opening<Id extends string>(
  registry: PanelSpec<Id>[],
  defaults: OpenByZone<Id> | undefined,
): OpenByZone<Id> {
  const open: OpenByZone<Id> = { ...(defaults ?? {}) }

  for (const zone of ZONES) {
    for (const slot of SLOTS) {
      // `!== undefined` and not `in`: a JSON round trip drops a key written as `undefined`, so
      // honouring it here would draw a half on the first launch and not on the next.
      if (open[zone]?.[slot] !== undefined) continue
      // A half with nothing declared for it stays closed: an open one drawing nothing would
      // still hold a size and a handle.
      if (firstIn(registry, zone, slot) === undefined) continue
      // `null`, never an id: WHICH panel a half opens on is a question every view answers for
      // itself, and writing one view's answer down imposes it on all of them.
      open[zone] = { ...open[zone], [slot]: null }
    }
  }
  return open
}

/**
 * Whether that view has been opened before. 🛑 `hasOwn`, never `in`: `'constructor' in {}` is
 * TRUE, so a view named after anything on `Object.prototype` was taken for settled and its
 * chassis drew nothing at all.
 */
export function isSettled<Id extends string>(state: Arranged<Id>, view: string): boolean {
  return Object.hasOwn(state.views, view)
}

/** The panel a project declares first for that half — what an untouched half opens on. */
function firstIn<Id extends string>(
  registry: PanelSpec<Id>[],
  zone: Zone,
  slot: Slot,
): PanelSpec<Id> | undefined {
  return registry.find(spec => spec.zone === zone && spec.slot === slot)
}

/**
 * A panel by its id. Exported because four sites had written this same lookup for want of it,
 * and one of them had already drifted on how it treated `undefined`. It is also the single place
 * to change the day the registry stops being a list and becomes a `Map`.
 *
 * Takes `null` as well, which is a half open on no panel in particular — see `ZoneSlots`.
 */
export function specOf<Id extends string>(
  registry: PanelSpec<Id>[],
  id: Id | null | undefined,
): PanelSpec<Id> | undefined {
  return id === null || id === undefined ? undefined : registry.find(spec => spec.id === id)
}

/**
 * What ONE half draws. 🛑 Private: it cannot see the other half, so it does not know a `solo`
 * panel is silencing this one. Every reader goes through `shownIn`.
 *
 * The stored id is a preference, not an answer. A half falls back to the panel declared first
 * for it whenever what it names is not on offer — the project stopped declaring it, or moved it
 * to another half. Resolved here rather than written into the state, so the choice survives the
 * panel's absence and is honoured again the moment it comes back.
 */
function resolve<Id extends string>(
  state: Arranged<Id>,
  zone: Zone,
  slot: Slot,
): PanelSpec<Id> | undefined {
  const slots = openOf(state)[zone]
  // `in`, not a truthiness test: a half open on no panel holds `null`, and a closed one holds
  // no key at all. The two look alike to every other operator.
  if (!slots || !(slot in slots)) return undefined

  const named = specOf(state.registry, slots[slot])
  return named?.zone === zone && named.slot === slot ? named : firstIn(state.registry, zone, slot)
}

/**
 * The SPECS both halves draw, because one can silence the other: a `solo` panel takes the zone
 * WHOLE. Resolved here rather than in each reader, which would contradict it.
 *
 * Rendering it as specs and not as ids is what stops the lookup happening twice: every caller
 * wanted the panel, and each was finding it again from the id this used to hand back.
 */
export function shownSpecsIn<Id extends string>(
  state: Arranged<Id>,
  zone: Zone,
): { primary?: PanelSpec<Id>; secondary?: PanelSpec<Id> } {
  const primary = resolve(state, zone, 'primary')
  if (primary?.solo === true) return { primary }

  return { primary, secondary: resolve(state, zone, 'secondary') }
}

/** The same answer as ids, for the callers that only name a panel. */
export function shownIn<Id extends string>(
  state: Arranged<Id>,
  zone: Zone,
): { primary?: Id; secondary?: Id } {
  const { primary, secondary } = shownSpecsIn(state, zone)
  return { primary: primary?.id, secondary: secondary?.id }
}

/**
 * Whether the zone takes room off the axis it shares with its opposite.
 *
 * 🛑 NOT the same question as `zoneDraws`, and the band is the whole difference: its two halves
 * share ONE height, so either of them drawing means the strip is taking that height. Asked per
 * half, the top zone was told nothing faced it whenever `bottomRight` happened to be the closed
 * one — and it could then be dragged over the height `bottomLeft` was already drawing in.
 */
export function zoneTakesRoom<Id extends string>(state: Arranged<Id>, zone: Zone): boolean {
  if (!isBottom(zone)) return zoneDraws(state, zone)

  return BOTTOM_ZONES.some(half => zoneDraws(state, half))
}

/** Whether the zone draws at all — an empty one takes neither room nor handle. */
export function zoneDraws<Id extends string>(state: Arranged<Id>, zone: Zone): boolean {
  const shown = shownIn(state, zone)
  return shown.primary !== undefined || shown.secondary !== undefined
}

/**
 * The size a zone opens at, given the panel leading it. A panel may ask for more than the zone's
 * own default — a conversation at 260 wraps every sentence onto three lines.
 *
 * Takes the leading SPEC rather than its id: every caller has already asked `shownSpecsIn`, and
 * finding the panel again here was a second pass over the registry per zone, per drag frame.
 */
export function undraggedSizeOf<Id extends string>(
  zone: Zone,
  leading: PanelSpec<Id> | undefined,
): number {
  return Math.max(DEFAULT_SIZES[zone], leading?.opens ?? 0)
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
  spec: PanelSpec<Id>,
  leading: PanelSpec<Id> | undefined,
): [ZoneSlots<Id>, Partial<Record<Zone, ZoneSlots<Id>>>] {
  const { slot, id } = spec
  const held = openOf(state)[zone] ?? {}
  const stashed = { ...state.stashed }

  // `primary` only, as `PanelSpec.solo` says: `shownSpecsIn` asks the same of the same half, and
  // one of the two honouring it in `secondary` gave the value two meanings.
  if (spec.solo === true && slot === 'primary') {
    stashed[zone] = held
    return [{ [slot]: id }, stashed]
  }

  // What the zone SHOWS, not what it holds: a half that named nobody can be falling back on a
  // solo panel, and writing beside it would silence the very panel just asked for.
  if (leading?.solo !== true) return [{ ...held, [slot]: id }, state.stashed]

  // Around what the zone had BEFORE the solo panel, never instead of it: the other half was
  // silenced, not closed, and rebuilding from the solo panel alone would shut it for good.
  const stash = stashed[zone]
  delete stashed[zone]
  if (stash) return [{ ...stash, [slot]: id }, stashed]

  // 🛑 No stash: the solo panel was a FALLBACK, not a choice — nobody ever put the zone away.
  // Taking the solo panel's own half back therefore leaves every other half exactly as it was;
  // rebuilding from `{}` closed a half nobody asked to close, and the rail read it as gone.
  // Only a half the solo panel is still silencing has to go, and there is at most one.
  const next = { ...held, [slot]: id }
  if (slot !== leading.slot) delete next[leading.slot]
  return [next, stashed]
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
  const held = openOf(state)[zone] ?? {}
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

/** Whether two sets of lengths hold the same numbers — by value, since `fitted` always rebuilds. */
function sameLengths(held: Lengths, next: Lengths): boolean {
  if (held.bandSplit !== next.bandSplit) return false

  return ZONES.every(
    zone => held.sizes[zone] === next.sizes[zone] && held.splits[zone] === next.splits[zone],
  )
}

export type CreatePanelsStoreOptions<Id extends string> = {
  /** The view that starts in front. A project with one view never has to name it. */
  view?: string
  /**
   * Restored layout, if any. A view it carries is taken as settled and `settle` leaves it be — a
   * view it does NOT carry is settled on first sight, so arriving straight at one nobody has
   * arranged yet opens its halves rather than drawing an empty frame.
   */
  initial?: Partial<LayoutState<Id>>
}

export function createPanelsStore<Id extends string = string>(
  options: CreatePanelsStoreOptions<Id> = {},
): PanelsStore<Id> {
  const restored = options.initial

  /** The view in front, patched. The others are left exactly as they were. */
  const arranged = (state: PanelsState<Id>, open: OpenByZone<Id>) => ({
    ...state.views,
    [state.view]: open,
  })

  return createStore<PanelsState<Id>>()((set, get) => ({
    registry: [],
    view: options.view ?? DEFAULT_VIEW,
    views: restored?.views ?? {},
    lengths: restored?.lengths ?? EMPTY_LENGTHS,
    focusedZone: null,
    stashed: {},
    available: { width: 0, height: 0 },

    // The arrangement is left ALONE by a panel leaving the list: the half naming it falls back
    // to what is still declared — see `resolve` — and names it again the day it comes back.
    declare: specs => set({ registry: specs }),

    // Having an entry in `views` IS the record of having been settled. No second field can then
    // disagree about which views have been opened, or fall out of step when a reset clears them.
    settle: defaults =>
      set(state => {
        const held = defaults ?? state.defaults
        if (isSettled(state, state.view)) {
          return held === state.defaults ? state : { defaults: held }
        }

        return { views: arranged(state, opening(state.registry, held)), defaults: held }
      }),

    // Settles the view it arrives at, rather than leaving that to the next render: a project
    // driving the chassis from outside React would otherwise land on an empty frame.
    setView: view =>
      set(state => {
        if (state.view === view) return state

        return {
          view,
          views: isSettled(state, view)
            ? state.views
            : { ...state.views, [view]: opening(state.registry, state.defaults) },
          // Session state, and it belongs to the view being left: a zone accented on arrival is
          // a zone nobody clicked, and a stash given back in another view would reopen a half
          // there.
          focusedZone: null,
          stashed: {},
        }
      }),

    show: id =>
      set(state => {
        const spec = specOf(state.registry, id)
        if (!spec) return state

        const { zone } = spec
        const shown = shownSpecsIn(state, zone)
        // Already on screen is only focused, never written down: the half may be showing this
        // panel because it is the one declared first, and naming it would settle for every
        // other view a question this click never asked.
        if (shown[spec.slot]?.id === id) return { focusedZone: zone }

        const [slots, stashed] = slotsShowing(state, zone, spec, shown.primary)
        return {
          views: arranged(state, { ...openOf(state), [zone]: slots }),
          stashed,
          focusedZone: zone,
        }
      }),

    close: (zone, slot) =>
      set(state => {
        const [slots, stashed] = slotsClosing(state, zone, slot)
        const views = arranged(state, { ...openOf(state), [zone]: slots })
        const drawn = zoneDraws({ registry: state.registry, view: state.view, views }, zone)

        return {
          views,
          stashed,
          focusedZone: !drawn && state.focusedZone === zone ? null : state.focusedZone,
        }
      }),

    toggle: id => {
      const state = get()
      const spec = specOf(state.registry, id)
      if (!spec) return

      if (shownIn(state, spec.zone)[spec.slot] === id) state.close(spec.zone, spec.slot)
      else state.show(id)
    },

    focus: zone => set(state => (state.focusedZone === zone ? state : { focusedZone: zone })),

    // Guarded: a drag past the ceiling clamps to the same number for as long as the pointer
    // keeps going, and every write notifies every subscriber.
    resize: (zone, size, available) =>
      set(state => {
        const opposite = sizeOf(
          state.lengths,
          OPPOSITE[zone],
          held => zoneTakesRoom(state, held),
          held => undraggedSizeOf(held, shownSpecsIn(state, held).primary),
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

    // Guarded like `resize`, and for a heavier reason: the observer fires on every frame of a
    // window resize, and the persistence subscriber compares `lengths` by reference. A fresh
    // object carrying the same numbers had each of those frames re-serialising the whole file.
    fit: (width, height) =>
      set(state => {
        const next = fitted(
          state.lengths,
          width,
          height,
          zone => zoneTakesRoom(state, zone),
          zone => undraggedSizeOf(zone, shownSpecsIn(state, zone).primary),
        )
        const lengths = sameLengths(state.lengths, next) ? state.lengths : next
        const { available } = state
        if (lengths === state.lengths && available.width === width && available.height === height)
          return state

        return { available: { width, height }, lengths }
      }),

    // Every view, not just the one in front: a reset the reader asked for must not leave the
    // arrangement they were escaping waiting for them one click away.
    reset: () =>
      set(state => ({
        // The view in front is settled on the spot, not left for the next render: nothing
        // re-renders the provider when a button inside the chassis is what asked for the reset,
        // so the frame stayed blank — and the arrangement being escaped stayed on disk.
        //
        // 🛑 Unless nothing is declared yet, and then it is left UNSETTLED: settled against an
        // empty registry it would be settled EMPTY, and having an entry is what stops anything
        // reopening it. Every half would stay shut for good.
        views:
          state.registry.length === 0
            ? {}
            : { [state.view]: opening(state.registry, state.defaults) },
        lengths: EMPTY_LENGTHS,
        focusedZone: null,
        // Left behind, a solo panel closed after a reset would give back the zone the reset
        // had just cleared.
        stashed: {},
        registry: state.registry,
      })),
  }))
}
