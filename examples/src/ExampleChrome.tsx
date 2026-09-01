import type { ReactNode } from 'react'
import { useLang, type Lang } from './i18n'
import './example.css'

export type ExampleChromeProps = {
  /** Both languages, always — see `copy.ts` for why there is no fallback to miss. */
  title: Record<Lang, string>
  /** One line saying what this example demonstrates, and nothing else. */
  lead: Record<Lang, string>
  children: ReactNode
}

const BACK: Record<Lang, string> = { en: 'All examples', fr: 'Tous les exemples' }

/**
 * The strip above every example: what it shows, and the way back to the showcase.
 *
 * Deliberately NOT built with the library — an example that only reads because of a chassis it
 * is meant to be demonstrating proves nothing.
 */
export function ExampleChrome({ title, lead, children }: ExampleChromeProps) {
  const [lang] = useLang()

  return (
    <div className="example">
      <header className="example__bar">
        {/* The language rides back with the reader, as it rode in. */}
        <a className="example__back" href={`../index.html?lang=${lang}`}>
          <span aria-hidden="true">←</span> {BACK[lang]}
        </a>
        <h1 className="example__title">{title[lang]}</h1>
        <p className="example__lead">{lead[lang]}</p>
      </header>
      <div className="example__stage">{children}</div>
    </div>
  )
}
