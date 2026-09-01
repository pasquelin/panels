import type { ReactNode } from 'react'
import { cx } from '../core/cx'

export type PanelHeaderProps = {
  title: string
  /** The panel's own actions, on the same line as its name. */
  children?: ReactNode
  /**
   * Lets the actions take the free width rather than hug the trailing edge — for a panel whose
   * row is wide and mostly empty, and which carries a whole bar there rather than a button.
   */
  fillActions?: boolean
  /** Pinned past the actions: whatever crowds the row, the way out of the panel stays reachable. */
  trailing?: ReactNode
  className?: string
}

export function PanelHeader({
  title,
  children,
  fillActions,
  trailing,
  className,
}: PanelHeaderProps) {
  return (
    <header className={cx('pnl-header', className)}>
      {/* A basis of zero weighs nothing when the row runs short: all of it would be taken from
          the title, which truncation lets crush to invisible. The name of the panel is not what
          a crowded row should spend first. */}
      <span className={cx('pnl-header__title', fillActions && 'pnl-header__title--fixed')}>
        {title}
      </span>
      {/* The half that gives ground: a panel crowding its row loses its own actions first, and
          never the close button, which would leave the panel with no way out. */}
      <span className={cx('pnl-header__actions', fillActions && 'pnl-header__actions--fill')}>
        {children}
      </span>
      <span className="pnl-header__trailing">{trailing}</span>
    </header>
  )
}
