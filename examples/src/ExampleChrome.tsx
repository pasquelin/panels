import type { ReactNode } from 'react'
import { COPY } from './copy'
import { EXAMPLE_IDS } from './examples'
import { useLang, type Lang } from './i18n'
import './example.css'

const BACK: Record<Lang, string> = {
  en: 'All examples',
  zh: '全部示例',
  hi: 'सभी उदाहरण',
  es: 'Todos los ejemplos',
  ar: 'كل الأمثلة',
  pt: 'Todos os exemplos',
  fr: 'Tous les exemples',
  ru: 'Все примеры',
  id: 'Semua contoh',
  de: 'Alle Beispiele',
  ja: 'すべてのサンプル',
  tr: 'Tüm örnekler',
  ko: '모든 예제',
  vi: 'Tất cả ví dụ',
  it: 'Tutti gli esempi',
}

export type ExampleChromeProps = {
  /**
   * Which example this is. Its title and its one-line description are read from the same
   * translation the showcase card uses — written twice, the two would drift, and in fifteen
   * languages they would drift silently.
   */
  example: (typeof EXAMPLE_IDS)[number]
  children: ReactNode
}

/**
 * The strip above every example: what it shows, and the way back to the showcase.
 *
 * Deliberately NOT built with the library — an example that only reads because of a chassis it
 * is meant to be demonstrating proves nothing.
 */
export function ExampleChrome({ example, children }: ExampleChromeProps) {
  const [lang] = useLang()
  const card = COPY[lang].cards[EXAMPLE_IDS.indexOf(example)]!

  return (
    <div className="example">
      <header className="example__bar">
        {/* The language rides back with the reader, as it rode in. */}
        <a className="example__back" href={`../index.html?lang=${lang}`}>
          <span aria-hidden="true">←</span> {BACK[lang]}
        </a>
        <h1 className="example__title">{card.title}</h1>
        <p className="example__lead">{card.what}</p>
      </header>
      <div className="example__stage">{children}</div>
    </div>
  )
}
