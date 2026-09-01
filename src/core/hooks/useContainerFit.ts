import { useEffect, type RefObject } from 'react'
import { usePanelsStore } from '../context'

/**
 * Re-clamps the zones when the CONTAINER changes size — not the window.
 *
 * The difference is what lets the chassis live inside an existing page: measured against
 * `window`, a chassis sitting under a navigation bar or beside a sidebar believes it has room
 * it does not have, and the zones can be dragged over the centre until it disappears.
 */
export function useContainerFit(ref: RefObject<HTMLElement | null>): void {
  const store = usePanelsStore()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const fit = (): void => {
      const { clientWidth, clientHeight } = node
      // A container not laid out yet reports zero, and clamping against zero collapses every
      // zone to its floor — with nothing to drag them back from.
      if (clientWidth === 0 || clientHeight === 0) return
      store.getState().fit(clientWidth, clientHeight)
    }

    fit()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, store])
}
