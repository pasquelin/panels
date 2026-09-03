import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'

export type Dragging<T> = T & { pointerId: number }

export type PointerDrag<T> = {
  /**
   * Opens a gesture on the pointer that began it, capturing it so the gesture survives the cursor
   * leaving the element — unless `capture` says otherwise, for a press that is not yet a drag.
   */
  start: (event: ReactPointerEvent<Element>, held: T, options?: { capture?: boolean }) => void
  /**
   * Claims the pointer for a press that has become a drag. For a gesture opened with
   * `{ capture: false }`; calling it twice is harmless.
   *
   * 🛑 Why a press may NOT capture at once: a captured pointer retargets `pointerup` to the
   * capturing element, and the browser then fires `click` at the common ancestor of the two
   * targets — the capturing element, never the button inside it. Captured on `pointerdown`, an
   * element wrapping a button silently swallows every click on it.
   */
  capture: (event: { pointerId: number; currentTarget: Element }) => void
  /**
   * The drag this event belongs to, or `null`. A mouse has no implicit capture, so a move with
   * the button held from elsewhere reaches us too, and would be read from a stale origin.
   */
  matching: (event: { pointerId: number }) => Dragging<T> | null
  /** Ends it whatever the pointer, releasing nothing — for a capture the platform took back. */
  cancel: () => void
}

/**
 * One drag, held against the pointer that opened it. What a gesture MEANS stays with its caller;
 * this holds the pointer, the identity guard and the capture. Stable across renders, so a caller
 * may put it in the deps of a memoised handler.
 */
export function usePointerDrag<T extends object>(): PointerDrag<T> {
  const drag = useRef<Dragging<T> | null>(null)

  return useMemo(() => {
    // Takes the pointer id alone, so a NATIVE listener can ask the same question as a React one:
    // a press that has not yet been captured stops sending moves the moment the cursor leaves the
    // element, and a caller watching the window has only a native event to ask with.
    const matching = (event: { pointerId: number }): Dragging<T> | null =>
      drag.current?.pointerId === event.pointerId ? drag.current : null

    return {
      start: (event, held, options) => {
        if (options?.capture !== false) event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { ...held, pointerId: event.pointerId }
      },
      capture: event => {
        if (matching(event)) event.currentTarget.setPointerCapture(event.pointerId)
      },
      matching,
      cancel: () => {
        drag.current = null
      },
    }
  }, [])
}
