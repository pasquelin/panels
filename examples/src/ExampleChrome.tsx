import type { ReactNode } from 'react'
import './example.css'

export type ExampleChromeProps = {
  title: string
  /** One line saying what this example demonstrates, and nothing else. */
  lead: string
  children: ReactNode
}

/**
 * The strip above every example: what it shows, and the way back to the showcase.
 *
 * Deliberately NOT built with the library — an example that only reads because of a chassis it
 * is meant to be demonstrating proves nothing.
 */
export function ExampleChrome({ title, lead, children }: ExampleChromeProps) {
  return (
    <div className="example">
      <header className="example__bar">
        <a className="example__back" href="../index.html">
          <span aria-hidden="true">←</span> All examples
        </a>
        <h1 className="example__title">{title}</h1>
        <p className="example__lead">{lead}</p>
      </header>
      <div className="example__stage">{children}</div>
    </div>
  )
}
