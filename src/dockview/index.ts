/*
 * 🛑 Dockview's OWN stylesheet is not imported here, and the consumer imports it:
 *
 *   import 'dockview-react/dist/styles/dockview.css'
 *
 * Pulled in from this entry point, Rollup merged its 134 kB into the single stylesheet the
 * library emits — so every project paid for Dockview, including the ones that never import this
 * file. It also belongs to Dockview: the consumer installs that package, and it is theirs to
 * load and to version.
 *
 * What IS ours is the theme below, which dresses Dockview in the chassis' tokens.
 */
import './dockview-theme.css'

export { DockviewCenter, type DockviewCenterProps, type DocumentTabs } from './DockviewCenter'
export type { DockviewApi } from 'dockview-react'
