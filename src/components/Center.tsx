import type { ReactNode } from 'react'

export type CenterProps = {
  children: ReactNode
  className?: string
}

/**
 * Declares what the middle holds — a router outlet, a canvas, a map, document tabs.
 *
 * A descriptor like `<Panel>`, and read by `<Panels>` for the same reason: the centre sits
 * between the zones in the DOM, not where it is written.
 *
 * It stays at ONE place in the tree through every arrangement of the zones around it. Moved,
 * React would unmount it — tearing down whatever engine, canvas or editor it holds.
 */
export function Center(_props: CenterProps): null {
  return null
}

Center.displayName = 'Panels.Center'
