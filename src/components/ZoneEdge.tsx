import { useCallback, useRef } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions } from '../core/context'
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
export function ZoneEdge<Id extends string = string>({ zone, labels }: ZoneEdgeProps) {
  const view = useZone<Id>(zone)
  const { focus, resize, resplit } = usePanelsActions<Id>()
  const box = useRef<HTMLDivElement>(null)

  // Stable across the whole drag, so the memoised frames skip a size change entirely.
  const focusZone = useCallback(() => focus(zone), [focus, zone])
  const lying = isHorizontal(zone)

  const measureBox = useCallback(
    () => (lying ? (box.current?.clientHeight ?? 0) : (box.current?.clientWidth ?? 0)),
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
          label={labels.resizeSplit}
          onSize={(value, available) => resplit(zone, value, available)}
        />
      )}

      {secondary && (
        <PanelFrame
          panel={secondary}
          // The second half keeps a length of its own only while the first is there to take
          // the rest; alone, it fills the zone.
          {...(primary && split !== undefined ? { length: split } : {})}
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
      onSize={(value, available) => resize(zone, value, available)}
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
