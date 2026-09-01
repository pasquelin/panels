import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
} from 'dockview-react'
import { useCallback, useRef, type FunctionComponent } from 'react'
import { cx } from '../core/cx'

/**
 * What each kind of document renders, keyed by the component name a panel asks for.
 *
 * Dockview's own prop shape rather than a narrowed one: it hands a panel its api and its
 * params, and a project that wants either would otherwise have to cast to reach them.
 */
export type DocumentTabs = Record<string, FunctionComponent<IDockviewPanelProps>>

export type DockviewCenterProps = {
  documents: DocumentTabs
  /**
   * A layout to restore, as `api.toJSON()` gave it. Dockview throws on a layout naming a
   * component this build cannot find, so a refused one is dropped rather than kept — it would
   * fail again at every launch.
   */
  layout?: unknown
  /** Called whenever the arrangement changes, with what to store. */
  onLayout?: (layout: unknown) => void
  /** The api, once Dockview is ready — for opening documents from outside. */
  onReady?: (api: DockviewApi) => void
  /** Drawn while no document is open. Without one, Dockview shows a bare watermark. */
  empty?: FunctionComponent
  className?: string
}

/**
 * Document tabs for the centre, on Dockview.
 *
 * A SEPARATE entry point (`@pasquelin/panels/dockview`) on purpose: Dockview is a large
 * dependency, and the centre is a free slot for every project that only wants to put a router
 * outlet or a canvas there. Importing this is how a project opts into paying for it.
 *
 * 🛑 Tool panels never enter here. The centre takes documents — things with a name, that a
 * person opens and closes. Panels live on the edges and are switched from the rail, which is why
 * they wear an icon and not a tab.
 */
export function DockviewCenter({
  documents,
  layout,
  onLayout,
  onReady,
  empty,
  className,
}: DockviewCenterProps) {
  const restored = useRef(false)

  const ready = useCallback(
    (event: DockviewReadyEvent) => {
      if (layout !== undefined && !restored.current) {
        restored.current = true
        try {
          event.api.fromJSON(layout as Parameters<DockviewApi['fromJSON']>[0])
        } catch {
          // Dockview rethrows a layout it refuses from inside its own mount effect, where an
          // uncaught throw takes the window down on every launch. Dropped, not kept.
          onLayout?.(undefined)
        }
      }

      // AFTER the stored layout is restored: `fromJSON` clears the panels it did not name, so a
      // document opened by the project on `onReady` would be added and then thrown away.
      onReady?.(event.api)

      if (onLayout) {
        event.api.onDidLayoutChange(() => onLayout(event.api.toJSON()))
      }
    },
    [layout, onLayout, onReady],
  )

  return (
    <DockviewReact
      className={cx('pnl-dockview', className)}
      components={documents}
      watermarkComponent={empty}
      onReady={ready}
    />
  )
}
