import { Fragment, type ReactNode } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions, usePanelsState } from '../core/context'
import { useShownIn } from '../core/hooks/useArrangement'
import { useZonePanels } from '../core/hooks/useZone'
import { ZONES_BY_SIDE, type Side, type Zone } from '../core/types'
import { usePanelsComponents } from '../core/components'
import { Separator } from './Separator'
import { usePanelDrag } from './PanelDrag'

export type RailProps = {
  /** Edge the rail sticks to. Each rail also carries the band's half on its own side. */
  side: Side
  /** Rendered above the panel icons — a "new" button, a logo, anything the project pins there. */
  header?: ReactNode
  className?: string
}

/**
 * An edge's icon rail, IDE-style: it stays in place when the zone is closed, so a closed panel
 * is always one click away.
 *
 * Each rail is split into groups — its column's panels at the top, its half of the bottom band
 * at the foot — so that an icon's position tells where the panel will open.
 */
export function Rail({ side, header, className }: RailProps) {
  const { column, band } = ZONES_BY_SIDE[side]

  return (
    <div
      role="toolbar"
      aria-orientation="vertical"
      className={cx('pnl-rail', `pnl-rail--${side}`, className)}
    >
      <div className="pnl-rail__group">
        {header !== undefined && (
          <>
            {header}
            <Separator orientation="horizontal" />
          </>
        )}
        {/* A list, though every side names one zone today: which zones a rail carries is
            `ZONES_BY_SIDE`'s answer to give, not this component's to assume. */}
        {column.map(zone => (
          <RailZone key={zone} zone={zone} />
        ))}
      </div>
      <RailZone zone={band} />
    </div>
  )
}

/**
 * One zone's icons, cut the way the zone itself is cut: the icons above the separator open in
 * its first half, the ones below in its second. The rail is the legend of the column.
 */
export function RailZone<Id extends string = string>({ zone }: { zone: Zone }) {
  const halves = useZonePanels<Id>(zone)
  const drawn = useShownIn<Id>(zone)
  const focused = usePanelsState<Id, boolean>(state => state.focusedZone === zone)
  const { toggle } = usePanelsActions<Id>()
  const { IconButton } = usePanelsComponents()
  const drag = usePanelDrag()

  const carrying = drag?.carrying ?? null
  const held = halves.filter(([, panels]) => panels.length > 0)

  /**
   * The halves this rail draws.
   *
   * At rest, only the ones holding something: an empty flex child still eats one of the rail's
   * gaps — a hole where icons never were. While a panel is carried they all open, to be places
   * it can land in.
   *
   * 🛑 A zone holding NOTHING offers one place, not two. `primary` and `secondary` are only two
   * destinations once something stands in the zone to be above or below — empty, they are the
   * same landing, and offering both drew two identical squares for one place, under a separator
   * cutting a zone that has nothing to cut.
   */
  const groups = !carrying ? held : held.length > 0 ? halves : halves.slice(0, 1)

  if (groups.length === 0) return null

  return (
    <div className="pnl-rail__group">
      {groups.map(([slot, panels], index) => {
        const target = drag?.target?.zone === zone && drag.target.slot === slot ? drag.target : null
        // The carried panel is out of the flow, and out of the COUNT with it: the drag and
        // `movePanel` both number the drop positions among the panels that stay put. Counted
        // with it, every indicator at or past its own place stood one slot too high.
        const carried = panels.findIndex(panel => panel.id === carrying)
        const counted = (at: number) => (carried >= 0 && at > carried ? at - 1 : at)

        /**
         * What stands before the panel at `at`: the indicator for a drop that would land there,
         * or the carried panel's own place.
         *
         * 🛑 A drop back onto its own place moves nothing, and is drawn as a PLACE rather than as
         * an insertion. An accented bar promising a move that will not happen is a lie the reader
         * acts on — plainest where a panel is alone in its half, and every drop is that drop.
         *
         * That place has two boundaries — just before the carried panel and just after — and they
         * are the same spot on screen, so the second draws nothing rather than doubling the first.
         */
        const mark = (at: number) => {
          // 🛑 Only these two boundaries, never everything up to them: a drop BEFORE the carried
          // panel is a move like any other, and swallowing those left half a rail unable to say
          // where a panel would land.
          if (at === carried) return <span className="pnl-rail-drag__empty" />
          if (carried >= 0 && at === carried + 1) return null

          return target?.index === counted(at) ? (
            <span className="pnl-rail-drag__placeholder" />
          ) : null
        }

        return (
          <Fragment key={`${zone}:${slot}`}>
            {/* Only between two populated halves: a lone group has nothing to be cut from. */}
            {index > 0 && <Separator orientation="horizontal" />}

            <div
              className="pnl-rail__drop"
              data-pnl-drop=""
              data-pnl-zone={zone}
              data-pnl-slot={slot}
            >
              {panels.map((panel, at) => {
                // What the half DRAWS, not what it holds: a half silenced by a solo panel beside it
                // draws nothing, so none of its icons reads as up either.
                const shown = drawn[slot] === panel.id
                const button = (
                  <IconButton
                    icon={panel.icon}
                    label={panel.title}
                    active={shown}
                    accented={shown && focused}
                    onClick={() => toggle(panel.id)}
                    className="pnl-rail__button"
                  />
                )

                return (
                  <Fragment key={panel.id}>
                    {mark(at)}
                    {drag ? (
                      <div
                        data-pnl-panel={panel.id}
                        className={cx(
                          'pnl-rail__button-wrap',
                          carrying === panel.id && 'pnl-rail__button-wrap--carried',
                        )}
                        {...drag.bind(panel)}
                      >
                        {button}
                      </div>
                    ) : (
                      button
                    )}
                  </Fragment>
                )
              })}
              {mark(panels.length)}
              {/* Open to a drop and not the one being aimed at: it still has to read as a place,
                  or a reader sees nowhere to put the panel down. Only reachable while a panel is
                  carried — at rest an empty half is not drawn at all. */}
              {panels.length === 0 && !target && <span className="pnl-rail-drag__empty" />}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
