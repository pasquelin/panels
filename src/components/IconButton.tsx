import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from '../core/cx'

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  // `aria-pressed` among them: it is spread AFTER the one this computes, so a caller passing it
  // raw would silently win — and `active` would stop describing what is announced.
  'aria-label' | 'aria-pressed' | 'children'
> & {
  /** Free-form. The library imposes no icon set. */
  icon?: ReactNode
  /** Accessible name. Already translated. */
  label: string
  /** Panel currently shown: neutral background, and `aria-pressed`. */
  active?: boolean
  /** Shown AND in the focused zone: accented background. */
  accented?: boolean
  /** Acts rather than toggles: no `aria-pressed`. */
  acts?: boolean
  children?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

/**
 * The rail's button, and the panel header's. One place for the active and accented states, the
 * accessible name and the geometry — copied at each site, a missing `aria-label` goes unnoticed.
 */
export function IconButton({
  icon,
  label,
  active,
  accented,
  acts,
  className,
  children,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      ref={ref}
      aria-label={label}
      aria-pressed={acts ? undefined : active}
      className={cx(
        'pnl-icon-button',
        active && 'pnl-icon-button--active',
        accented && 'pnl-icon-button--accented',
        className,
      )}
      {...rest}
    >
      {icon !== undefined && <span className="pnl-icon-button__glyph">{icon}</span>}
      {children}
    </button>
  )
}
