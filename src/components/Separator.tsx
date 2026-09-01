import { cx } from '../core/cx'

export type SeparatorProps = {
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

/** Hairline between groups of controls. Decorative, hence hidden from assistive tech. */
export function Separator({ orientation = 'vertical', className }: SeparatorProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('pnl-separator', `pnl-separator--${orientation}`, className)}
    />
  )
}
