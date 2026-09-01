import type { ReactNode } from 'react'
import type { PanelSpec, Slot } from '../core/types'

/**
 * Everything the chassis knows about a panel, plus what only JSX can carry.
 *
 * Derived from `PanelSpec` rather than restated: the two had been written out field by field,
 * with the documentation copied word for word, so adding one meant remembering to add it twice
 * — and nothing would have failed if you had not.
 *
 * `slot` is the one field that changes shape: it is required in the registry and optional here,
 * because a panel that does not say lands in the half nearest the edge.
 */
export type PanelProps<Id extends string = string> = Omit<PanelSpec<Id>, 'slot'> & {
  slot?: Slot
  /** Actions on the panel's own title row, beside its name. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Declares one panel. It is a DESCRIPTOR, never rendered where it is written: `<Panels>` reads
 * its props to build the rail and hands its children to whichever zone it named.
 *
 * The same shape as `<Route>` in React Router — the element describes, the parent arranges. The
 * alternative was a portal per panel, which puts the panel's content in a different React tree
 * from the one it was declared in: context, error boundaries and suspense would all stop at the
 * boundary, and a panel could not read a provider its own file sits under.
 */
export function Panel<Id extends string = string>(_props: PanelProps<Id>): null {
  return null
}

Panel.displayName = 'Panels.Panel'
