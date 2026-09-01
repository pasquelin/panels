import type { ReactNode } from 'react'
import type { Slot, Zone } from '../core/types'

export type PanelProps<Id extends string = string> = {
  id: Id
  zone: Zone
  slot?: Slot
  /** Accessible name and header title. Already translated — the library carries no i18n. */
  title: string
  /** Free-form: an icon component, an SVG, an image. No icon set is imposed. */
  icon?: ReactNode
  /** Actions on the panel's own title row, beside its name. */
  actions?: ReactNode
  /** What the zone opens at while this panel leads it. A dragged size always wins. */
  opens?: number
  /** Takes the zone WHOLE: shown, the other half draws nothing. `primary` only. */
  solo?: boolean
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
