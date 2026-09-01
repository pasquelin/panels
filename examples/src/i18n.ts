import { useCallback, useSyncExternalStore } from 'react'

export type Lang = 'en' | 'fr'

const LANGS: readonly Lang[] = ['en', 'fr']
const KEY = 'panels-showcase:lang'

function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && LANGS.some(one => one === value)
}

/**
 * The language to open in, in the order a reader would expect to be obeyed.
 *
 * The URL comes first so a link can carry a language — someone sharing the page in French must
 * not have it read in English on the other end. Then what this reader chose here before, then
 * what their browser asks for, and English as the last resort.
 */
function initial(): Lang {
  const asked = new URLSearchParams(window.location.search).get('lang')
  if (isLang(asked)) return asked

  try {
    const kept = window.localStorage.getItem(KEY)
    if (isLang(kept)) return kept
  } catch {
    // A private window refuses storage. A language is not worth failing over.
  }

  return window.navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

let current: Lang = initial()
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

export function setLang(next: Lang): void {
  if (next === current) return
  current = next

  // The document's own language, not only the words: a screen reader picks its voice from it,
  // and a page that says `lang="en"` while reading French is read with an English accent.
  document.documentElement.lang = next

  try {
    window.localStorage.setItem(KEY, next)
  } catch {
    // See `initial`.
  }

  // Replaced rather than pushed: switching language is not a place in history to go back to.
  const url = new URL(window.location.href)
  url.searchParams.set('lang', next)
  window.history.replaceState(null, '', url)

  for (const listener of listeners) listener()
}

export function useLang(): [Lang, (next: Lang) => void] {
  const lang = useSyncExternalStore<Lang>(
    subscribe,
    () => current,
    // On a server there is no reader to ask; English is what the markup is written in.
    () => 'en',
  )

  // `setLang` is a module function and already stable — wrapped only to satisfy the rule that a
  // hook returns the same reference across renders.
  const set = useCallback((next: Lang) => setLang(next), [])
  return [lang, set]
}

/** Picks the reader's side of a pair. Both are always written — there is no fallback to miss. */
export function pick<T>(lang: Lang, both: Record<Lang, T>): T {
  return both[lang]
}

export { LANGS }

// The first paint must already be in the right language.
document.documentElement.lang = current
