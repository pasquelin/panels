import type { ComponentProps } from 'react'
import { cx } from '../core/cx'

/**
 * The rounded box a panel is drawn on, laid over the chassis gutter.
 *
 * Darker than the chassis it sits on in the default theme — that inversion is what reads as
 * "panels on a frame" rather than as a web page. A project that inverts it back only has to
 * repaint two tokens.
 */
export function Surface({ children, className, ...rest }: ComponentProps<'section'>) {
  return (
    <section className={cx('pnl-surface', className)} {...rest}>
      {children}
    </section>
  )
}
