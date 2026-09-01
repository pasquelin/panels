import { useEffect, useLayoutEffect } from 'react'

/**
 * `useLayoutEffect` in a browser, `useEffect` anywhere else.
 *
 * The chassis settles its arrangement and measures its container before the first paint — done
 * in a plain effect, the first frame shows every zone closed and the second shows them open.
 * On a server there is nothing to measure, and React warns about the layout variant, so it
 * falls back rather than shouting.
 */
export const useIsomorphicLayoutEffect =
  typeof globalThis.document === 'undefined' ? useEffect : useLayoutEffect
