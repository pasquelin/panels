import { useCallback } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions, usePanelsState } from '../core/context'
import { MIN_SPLIT } from '../core/clamps'
import { ResizeHandle } from './ResizeHandle'
import { ZoneEdge } from './ZoneEdge'
import type { PanelsLabels } from './labels'

export type BandProps = {
  left: boolean
  right: boolean
  labels: PanelsLabels
}

/**
 * The bottom band: one strip, one height, and up to two zones side by side.
 *
 * Alone, a half takes the whole strip — and the frame has already run it under the opposite
 * column. Together they share the width, parted by a handle that starts at the middle.
 */
export function Band<Id extends string = string>({ left, right, labels }: BandProps) {
  const split = usePanelsState<Id, number | undefined>(state => state.lengths.bandSplit)
  const { resplitBand } = usePanelsActions<Id>()

  const resplit = useCallback(
    (size: number, available: number) => resplitBand(size, available),
    [resplitBand],
  )

  if (!left && !right) return null
  if (!left || !right) {
    return <ZoneEdge<Id> zone={left ? 'bottomLeft' : 'bottomRight'} labels={labels} />
  }

  return (
    <div className="pnl-band">
      {/* Undefined until dragged: both halves are then flex and the strip parts in the middle. */}
      <div
        className={cx('pnl-band__half', split === undefined && 'pnl-band__half--even')}
        style={split === undefined ? undefined : { width: split }}
      >
        <ZoneEdge<Id> zone="bottomLeft" labels={labels} />
      </div>

      <ResizeHandle
        axis="horizontal"
        size={split}
        min={MIN_SPLIT}
        label={labels.resizeBand}
        onSize={resplit}
      />

      <div className="pnl-band__half pnl-band__half--rest">
        <ZoneEdge<Id> zone="bottomRight" labels={labels} />
      </div>
    </div>
  )
}
