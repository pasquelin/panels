import { Fragment } from 'react'
import { cx } from '../core/cx'
import { usePanelsActions, usePanelsState } from '../core/context'
import { useShownIn } from '../core/hooks/useArrangement'
import { useZonePanels } from '../core/hooks/useZone'
import { ZONES_BY_SIDE, type Side, type Zone } from '../core/types'
import { usePanelsComponents } from '../core/components'
import { Separator } from './Separator'

export type RailProps = {
  /** Edge the rail sticks to. Each rail also carries the band's half on its own side. */
  side: Side
  /** Rendered above the panel icons — a "new" button, a logo, anything the project pins there. */
  header?: React.ReactNode
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

  // An empty flex child still eats one of the rail's gaps — a hole where icons never were.
  if (halves.length === 0) return null

  return (
    <div className="pnl-rail__group">
      {halves.map(([slot, panels], index) => (
        <Fragment key={`${zone}:${slot}`}>
          {/* Only between two populated halves: a lone group has nothing to be cut from. */}
          {index > 0 && <Separator orientation="horizontal" />}

          {panels.map(panel => {
            // What the half DRAWS, not what it holds: a half silenced by a solo panel beside it
            // draws nothing, so none of its icons reads as up either.
            const shown = drawn[slot] === panel.id
            return (
              <IconButton
                key={panel.id}
                icon={panel.icon}
                label={panel.title}
                active={shown}
                accented={shown && focused}
                onClick={() => toggle(panel.id)}
                className="pnl-rail__button"
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
