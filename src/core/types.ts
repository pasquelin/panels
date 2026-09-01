import type { ReactNode } from 'react'

/**
 * The vocabulary of the chassis, and nothing else. No domain, no surfaces, no capabilities:
 * a project declares the panels it wants and this describes only WHERE they hang.
 */

/**
 * Where a panel hangs. The bottom band is TWO zones sharing one height: whichever of them is
 * alone runs under the opposite column, and together they split the width between them.
 */
export type Zone = 'left' | 'right' | 'top' | 'bottomLeft' | 'bottomRight'

export const ZONES: readonly Zone[] = ['left', 'right', 'top', 'bottomLeft', 'bottomRight']

/**
 * A zone is cut in two, and each half shows one panel at a time. The rail draws the same cut as
 * a separator: icons above it open in the first half, icons below in the second.
 *
 * `primary` is the half nearest the window edge the zone hangs from — the top of a side column,
 * the left of the bottom strip.
 */
export type Slot = 'primary' | 'secondary'

export const SLOTS: readonly Slot[] = ['primary', 'secondary']

/**
 * The view a project that never names one lands in. A view is a named arrangement: two parts of
 * one application each keeping their own open panels, sharing the lengths.
 */
export const DEFAULT_VIEW = 'default'

/** The band's two halves, in the order they are drawn. */
export const BOTTOM_ZONES: readonly Zone[] = ['bottomLeft', 'bottomRight']

/** Whether the zone is one of the band's halves, which share a height and a resize handle. */
export function isBottom(zone: Zone): boolean {
  return zone === 'bottomLeft' || zone === 'bottomRight'
}

/** Horizontal zones: their size is set as a height, not a width. */
export function isHorizontal(zone: Zone): boolean {
  return zone === 'top' || isBottom(zone)
}

/** Which edge a zone hangs from. The band's two halves take the side their name gives. */
export type Side = 'left' | 'right'

/**
 * The zones each rail carries, in the order it stacks them: the column's own at the top, its
 * half of the bottom band at the foot.
 *
 * Stated here rather than inside the rail, because the frame lays itself out on the same
 * knowledge — which column runs to the foot, which half of the band sits under it. Written in
 * both places, the two could disagree about who is on the left with nothing to catch it.
 */
export const ZONES_BY_SIDE: Record<Side, { column: Zone[]; band: Zone }> = {
  left: { column: ['left', 'top'], band: 'bottomLeft' },
  right: { column: ['right'], band: 'bottomRight' },
}

/**
 * Zones whose panel sits before its resize handle. The opposite zones grow backwards, which
 * is also why their drag direction is inverted.
 */
export function isLeading(zone: Zone): boolean {
  return zone === 'left' || zone === 'top'
}

/**
 * What a project registers for one panel. The content itself never passes through here — it is
 * rendered by `<Panel>` where it was declared, and this is only what the rail and the frame
 * need to know before the panel is on screen.
 */
export type PanelSpec<Id extends string = string> = {
  id: Id
  zone: Zone
  slot: Slot
  /** Accessible name and header title. Already translated — the library carries no i18n. */
  title: string
  /** Free-form: an icon component, an SVG, an image. The library imposes no icon set. */
  icon?: ReactNode
  /**
   * What the zone opens at while this panel leads it, where the zone's own size does not suit
   * it. A size the reader dragged always wins over this.
   */
  opens?: number
  /** Takes the zone WHOLE: shown, the other half draws nothing. `primary` only. */
  solo?: boolean
}

/**
 * Which panel each half of each zone currently shows. Three states, not two: the key absent is
 * a CLOSED half, `null` an open one that has named no panel, an id the panel someone chose.
 *
 * That middle state is what lets a project change the panels it declares without the halves
 * following: an unnamed half draws whatever is declared first for it, resolved at render — see
 * `shownIn`. Stored, it also keeps the arrangement honest, since only a real choice is written.
 */
export type ZoneSlots<Id extends string = string> = Partial<Record<Slot, Id | null>>

export type OpenByZone<Id extends string = string> = Partial<Record<Zone, ZoneSlots<Id>>>

export type SizesByZone = Partial<Record<Zone, number>>

/**
 * How wide and how tall the frame is. `sizes` is the zone's own length — a width for the side
 * columns, a height for the strips; `splits` is what the second half takes inside its zone.
 */
export type Lengths = {
  sizes: SizesByZone
  splits: SizesByZone
  /**
   * Width the band's LEFT zone takes while both halves draw. Unset means half each — a fraction
   * would have to be re-read on every resize, where a length is what the handle drags.
   */
  bandSplit?: number
}

/**
 * The layout as it is stored and restored. This is the whole of what persistence carries: one
 * arrangement per view, and the lengths, which every view shares.
 */
export type LayoutState<Id extends string = string> = {
  views: Record<string, OpenByZone<Id>>
  lengths: Lengths
}
