import { memo } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions } from '../core/context'
import { isHorizontal, type PanelSpec } from '../core/types'
import { usePanelContent } from './content'
import { PanelHeader } from './PanelHeader'
import { Separator } from './Separator'
import { Surface } from './Surface'
import { usePanelsComponents } from '../core/components'

export type PanelFrameProps<Id extends string> = {
  panel: PanelSpec<Id>
  /** Length of its own along the zone's inner axis. Absent takes whatever the other half left. */
  length?: number
  /** Text of the close button, already translated. */
  closeLabel: string
  onFocus: () => void
}

/**
 * One panel on screen: its surface, its title row, its content.
 *
 * Closing is the only way out, on purpose. A collapsed panel is a third state between open and
 * closed that looks like neither, and the rail already reopens a panel in one click.
 */
function PanelFrameInner<Id extends string>({
  panel,
  length,
  closeLabel,
  onFocus,
}: PanelFrameProps<Id>) {
  const { close } = usePanelsActions<Id>()
  const { IconButton } = usePanelsComponents()
  const held = usePanelContent(panel.id)

  return (
    // The zone owns its length: a half given one keeps it, the other takes what is left. Both
    // sized here would make the pair overflow the zone the user dragged.
    <Surface
      aria-label={panel.title}
      onPointerDownCapture={onFocus}
      // `pnl-surface--give` overrides the surface's own `shrink: 0`: a half given a length must
      // still give ground when the zone is shorter than the two halves ask for.
      className={length === undefined ? 'pnl-surface--fill' : 'pnl-surface--give'}
      style={length === undefined ? undefined : { flexBasis: length }}
    >
      <PanelHeader
        title={panel.title}
        fillActions={panel.fillActions ?? (held?.actions !== undefined && isHorizontal(panel.zone))}
        trailing={
          <>
            {held?.actions !== undefined && <Separator />}
            <IconButton
              label={closeLabel}
              acts
              onClick={() => close(panel.zone, panel.slot)}
              className="pnl-icon-button--header"
              icon={<CloseGlyph />}
            />
          </>
        }
      >
        {held?.actions}
      </PanelHeader>

      {/* A COLUMN, not a plain box: a panel that scrolls its own body sizes it with `flex: 1`,
          and that does nothing against a non-flex parent — the body would take the height of
          its CONTENT, so the scroller stops short and the space below belongs to nobody. */}
      <div className={cx('pnl-body')}>{held?.content}</div>
    </Surface>
  )
}

/**
 * Memoised: a zone drag writes a new size on every `pointermove`, and without this each frame
 * re-renders both halves and everything the project put in them. `onFocus` must stay stable for
 * that to bite — see `ZoneEdge`.
 */
export const PanelFrame = memo(PanelFrameInner) as typeof PanelFrameInner

/** The one glyph the library draws itself: a panel with no way out is a panel one loses. */
function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      />
    </svg>
  )
}
