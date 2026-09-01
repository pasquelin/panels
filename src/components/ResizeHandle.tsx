import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { cx } from '../core/cx'
import { usePointerDrag } from '../core/hooks/usePointerDrag'

export type ResizeHandleProps = {
  /** `vertical` moves up and down and sets a height; `horizontal` sets a width. */
  axis: 'vertical' | 'horizontal'
  /** The panel grows as the pointer moves backwards — true for a right, bottom or lower half. */
  invert?: boolean
  /** Where the cut stands. Absent means CSS is dividing the box, and the handle measures it. */
  size?: number
  onSize: (size: number, available: number) => void
  /**
   * Measures the panel this handle moves, for the case CSS is sizing it and `size` is unknown.
   * The PARENT supplies it because the parent holds the element: reading
   * `previousElementSibling` here would break the moment a consumer wraps a zone.
   */
  measure?: () => number
  /** Names the handle for assistive tech — "Resize the left column". Already translated. */
  label: string
  /** Bounds announced to assistive tech, and the step the keyboard moves by. */
  min?: number
  max?: number
  step?: number
  className?: string
}

type Drag = { position: number; size: number; available: number }

/**
 * Resize handle. Captures the pointer so the gesture survives a cursor leaving the handle —
 * without capture, a fast drag detaches.
 *
 * It measures the container when the gesture starts and passes that dimension along: it is the
 * one that knows what is available, the store knows nothing about the DOM.
 *
 * It measures the panel it moves through a ref its parent gives it, never through
 * `previousElementSibling`. Reading the sibling works in a tree one owns and breaks silently in
 * a library: a consumer wrapping a zone in a `<div>` would move the wrapper's neighbour instead.
 *
 * Focusable and driven by the arrow keys: a separator that only answers a pointer is a control
 * a keyboard user cannot operate at all (WCAG 2.1.1).
 */
export function ResizeHandle({
  axis,
  invert = false,
  size,
  onSize,
  measure,
  label,
  min,
  max,
  step = 16,
  className,
}: ResizeHandleProps) {
  const drag = usePointerDrag<Drag>()
  const self = useRef<HTMLDivElement>(null)
  const lying = axis === 'vertical'

  const roomOf = useCallback(
    (node: Element | null | undefined): number =>
      (lying ? node?.clientHeight : node?.clientWidth) ?? 0,
    [lying],
  )

  const onMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Only a drag that STARTED on this handle counts, or the panel would be resized from a
      // stale origin, or from zero, collapsing it to nothing.
      const current = drag.matching(event)
      if (!current) return

      const position = lying ? event.clientY : event.clientX
      const delta = position - current.position
      onSize(current.size + delta * (invert ? -1 : 1), current.available)
    },
    [drag, invert, lying, onSize],
  )

  const onKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const back = lying ? 'ArrowUp' : 'ArrowLeft'
      const forth = lying ? 'ArrowDown' : 'ArrowRight'
      if (event.key !== back && event.key !== forth) return

      const available = roomOf(self.current?.parentElement)
      const current = size ?? measure?.() ?? 0
      const direction = event.key === forth ? 1 : -1
      event.preventDefault()
      onSize(current + step * direction * (invert ? -1 : 1), available)
    },
    [invert, lying, measure, onSize, roomOf, size, step],
  )

  return (
    <div
      ref={self}
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={lying ? 'horizontal' : 'vertical'}
      aria-valuenow={size === undefined ? undefined : Math.round(size)}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={event => {
        // The main button of the main pointer, and nothing else: a right click captured the
        // pointer and dragged the column along with the context menu, and a second finger
        // restarted the gesture from wherever it landed.
        if (event.button !== 0 || !event.isPrimary) return

        drag.start(event, {
          position: lying ? event.clientY : event.clientX,
          size: size ?? measure?.() ?? 0,
          available: roomOf(event.currentTarget.parentElement),
        })
      }}
      onPointerMove={onMove}
      onPointerUp={drag.cancel}
      onPointerCancel={drag.cancel}
      onLostPointerCapture={drag.cancel}
      onKeyDown={onKey}
      className={cx('pnl-handle', lying ? 'pnl-handle--row' : 'pnl-handle--col', className)}
    />
  )
}
