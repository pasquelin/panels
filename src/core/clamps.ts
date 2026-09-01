import { isBottom, isHorizontal, ZONES, type Lengths, type OpenByZone, type Zone } from './types'

/** Smallest a zone may be dragged to before it is worth closing instead. */
export const MIN_SIZE = 140

/** Room the centre must keep, whatever the side zones ask for. */
export const MIN_CENTER = 240

/** Room a split keeps for the half it is taken from. */
export const MIN_SPLIT = 100

/** What a zone opens at when nothing has been dragged and no panel asks for more. */
export const DEFAULT_SIZES: Record<Zone, number> = {
  left: 320,
  right: 260,
  top: 180,
  bottomLeft: 240,
  bottomRight: 240,
}

/**
 * The half that carries the band's height, stored once: two halves lying at two heights would
 * leave the frame above them in a step.
 */
export const BAND_MAIN: Zone = 'bottomRight'

/** Where a zone's length is read and written — the band's halves share the one key. */
export function sizeKeyOf(zone: Zone): Zone {
  return isBottom(zone) ? BAND_MAIN : zone
}

/** The zone that takes room from the same axis, and therefore bounds this one. */
export const OPPOSITE: Record<Zone, Zone> = {
  left: 'right',
  right: 'left',
  // The band as a whole faces the top strip: either half of it takes the same height off.
  top: BAND_MAIN,
  bottomLeft: 'top',
  bottomRight: 'top',
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high)
}

/**
 * Clamps a zone size against what the opposite zone already takes. Capping each side at half
 * the container independently would let left and right add up to the full width, leaving the
 * centre at zero — and overflowing once the container shrinks.
 */
export function fitZoneSize(size: number, available: number, opposite: number): number {
  const ceiling = Math.max(MIN_SIZE, Math.round(available - opposite - MIN_CENTER))
  return clamp(Math.round(size), MIN_SIZE, ceiling)
}

/** Same idea one level down: neither half of a zone may swallow the other. */
export function fitSplit(size: number, available: number): number {
  const ceiling = Math.max(MIN_SPLIT, Math.round(available - MIN_SPLIT))
  return clamp(Math.round(size), MIN_SPLIT, ceiling)
}

/** True once either half holds something: an empty zone takes no room at all. */
export function isZoneOpen(open: OpenByZone, zone: Zone): boolean {
  const slots = open[zone]
  return slots !== undefined && (slots.primary !== undefined || slots.secondary !== undefined)
}

/** The band takes its height as soon as EITHER half holds something: the strip is one strip. */
export function isBandOpen(open: OpenByZone): boolean {
  return isZoneOpen(open, 'bottomLeft') || isZoneOpen(open, 'bottomRight')
}

/**
 * The room a zone currently takes, or zero when it draws nothing. Read while clamping the
 * opposite zone: under-report it and the other side may be dragged over room this one is
 * already drawing in, squeezing the centre past its floor.
 */
export function sizeOf(
  lengths: Lengths,
  open: OpenByZone,
  zone: Zone,
  undragged: (zone: Zone) => number,
): number {
  const drawn = isBottom(zone) ? isBandOpen(open) : isZoneOpen(open, zone)
  if (!drawn) return 0

  return lengths.sizes[sizeKeyOf(zone)] ?? undragged(zone)
}

/**
 * Every stored length, re-clamped to a container of this size. Sizes are persisted, so a layout
 * set on a wide screen would otherwise overflow a narrow one — pushing the panels under the
 * rails and squeezing the centre to nothing.
 */
export function fitted(
  lengths: Lengths,
  open: OpenByZone,
  width: number,
  height: number,
  undragged: (zone: Zone) => number,
): Lengths {
  const sizes = { ...lengths.sizes }
  const splits = { ...lengths.splits }

  for (const zone of ZONES) {
    const stored = sizes[zone]
    if (stored === undefined) continue

    const available = isHorizontal(zone) ? height : width
    sizes[zone] = fitZoneSize(stored, available, sizeOf(lengths, open, OPPOSITE[zone], undragged))

    // The divider lives inside the zone, along its other axis: left unclamped it ends up past
    // the bottom of a shrunken column, with no way to drag it back.
    const divider = splits[zone]
    if (divider === undefined) continue
    splits[zone] = fitSplit(divider, isHorizontal(zone) ? width : height)
  }

  // The band's own divider runs across the WHOLE width: it parts two zones rather than the two
  // halves of one, so it is clamped against the container and not against a zone's length.
  const bandSplit = lengths.bandSplit === undefined ? undefined : fitSplit(lengths.bandSplit, width)

  return { sizes, splits, bandSplit }
}

/**
 * The two side zones, bounded so the centre keeps its floor — whether or not either was ever
 * dragged.
 *
 * 🛑 `fitted` cannot do this job: it walks the STORED lengths, and a layout nobody has touched
 * has none. The zones then took the sizes they ask for and the centre took whatever was left,
 * which on a narrow container was nothing — measured at 104 px against a floor of 240, on a
 * 900 px window with two untouched columns.
 *
 * When the two do not fit, they give ground in PROPORTION to what they asked for: taking it all
 * from one would collapse the narrower of them while the wider kept its full width.
 */
export function sharedSizes(
  leading: number,
  trailing: number,
  available: number,
): [number, number] {
  const room = available - MIN_CENTER
  const asked = leading + trailing
  if (asked <= room) return [leading, trailing]

  // 🛑 A zone asking for NOTHING is closed, and a closed zone takes no room — floored to
  // `MIN_SIZE` it would reserve 140 px of nothing beside the panel that is actually open.
  const floorOf = (size: number): number => (size === 0 ? 0 : MIN_SIZE)
  const floors = floorOf(leading) + floorOf(trailing)

  // Nothing left to share: both fall to their own floor and the centre takes what it can, which
  // is the honest answer for a container too small for the arrangement.
  if (room <= floors) {
    return [Math.min(leading, floorOf(leading)), Math.min(trailing, floorOf(trailing))]
  }

  const scale = room / asked
  const first = Math.max(floorOf(leading), Math.round(leading * scale))
  return [first, Math.max(floorOf(trailing), Math.round(room - first))]
}
