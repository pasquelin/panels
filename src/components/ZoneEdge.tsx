import { memo, useCallback, useRef } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions, usePanelsState } from '../core/context'
import { useZone } from '../core/hooks/useZone'
import { MIN_SIZE, MIN_SPLIT } from '../core/clamps'
import { isHorizontal, isLeading, type Zone } from '../core/types'
import { PanelFrame } from './PanelFrame'
import { ResizeHandle } from './ResizeHandle'
import type { PanelsLabels } from './labels'

export type ZoneEdgeProps = {
  zone: Zone
  labels: PanelsLabels
}

/**
 * A zone's two halves and its resize handle, ordered by the zone. `left` and `top` put the
 * panels first; the opposite zones put the handle first, because they grow backwards.
 */
function ZoneEdgeInner<Id extends string = string>({ zone, labels }: ZoneEdgeProps) {
  const view = useZone<Id>(zone)
  const { focus, resize, resplit } = usePanelsActions<Id>()
  const box = useRef<HTMLDivElement>(null)
  const second = useRef<HTMLElement>(null)
  const lying = isHorizontal(zone)

  // 🛑 The columns box the store measured, never the row this zone happens to be laid in. With
  // one half of the band drawing, the opposite column runs to the foot and this zone sits in the
  // inner row — which already lacks that column, and `resize` takes it off a second time. The
  // right column then stopped at 418 px with the centre still 554 wide. Zero until the first
  // measure, and the handle's own reading serves until then.
  const room = usePanelsState<Id, number>(state =>
    lying ? state.available.height : state.available.width,
  )

  // Stable across the whole drag, so the memoised frames skip a size change entirely.
  const focusZone = useCallback(() => focus(zone), [focus, zone])

  const measureBox = useCallback(
    () => (lying ? (box.current?.clientHeight ?? 0) : (box.current?.clientWidth ?? 0)),
    [lying],
  )
  // The second half along the zone's INNER axis — what the divider moves while CSS is still
  // parting the zone in two. Without it the drag started from zero, and the clamp floored a
  // half of 400 px to `MIN_SPLIT` on the first pixel.
  const measureSecond = useCallback(
    () => (lying ? (second.current?.clientWidth ?? 0) : (second.current?.clientHeight ?? 0)),
    [lying],
  )

  if (!view.draws) return null

  const { primary, secondary, size, split } = view

  const panel = (
    <div
      ref={box}
      // No gap: the handle between the two halves already occupies the gutter, exactly as the
      // zone handles do outside. Adding one here spaces them by three gutters.
      className={cx('pnl-zone', lying ? 'pnl-zone--row' : 'pnl-zone--col')}
      style={{ [lying ? 'height' : 'width']: size }}
    >
      {primary && <PanelFrame panel={primary} closeLabel={labels.closePanel} onFocus={focusZone} />}

      {/* Only between two open halves: a lone panel has nothing to be dragged against. */}
      {primary && secondary && (
        <ResizeHandle
          axis={lying ? 'horizontal' : 'vertical'}
          invert
          size={split}
          min={MIN_SPLIT}
          measure={measureSecond}
          label={labels.resizeSplit}
          onSize={(value, available) => resplit(zone, value, available)}
        />
      )}

      {secondary && (
        <PanelFrame
          ref={second}
          panel={secondary}
          // The second half keeps a length of its own only while the first is there to take
          // the rest; alone, it fills the zone.
          length={primary && split !== undefined ? split : undefined}
          closeLabel={labels.closePanel}
          onFocus={focusZone}
        />
      )}
    </div>
  )

  const handle = (
    <ResizeHandle
      axis={lying ? 'vertical' : 'horizontal'}
      invert={!isLeading(zone)}
      size={size}
      min={MIN_SIZE}
      measure={measureBox}
      label={labels.resizeZone}
      onSize={(value, available) => resize(zone, value, room || available)}
    />
  )

  return isLeading(zone) ? (
    <>
      {panel}
      {handle}
    </>
  ) : (
    <>
      {handle}
      {panel}
    </>
  )
}

/**
 * Memoised for the reason `PanelFrame` is: with five zones on screen, one frame of a drag used
 * to re-render all five and every panel under them, where two are owed.
 */
export const ZoneEdge = memo(ZoneEdgeInner) as typeof ZoneEdgeInner
