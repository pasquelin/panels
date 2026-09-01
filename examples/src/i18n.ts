import { useCallback, useSyncExternalStore } from 'react'

export type Lang =
  | 'en'
  | 'zh'
  | 'hi'
  | 'es'
  | 'ar'
  | 'pt'
  | 'fr'
  | 'ru'
  | 'id'
  | 'de'
  | 'ja'
  | 'tr'
  | 'ko'
  | 'vi'
  | 'it'

/**
 * In the order the switcher lists them: English first because it is the fallback, then by how
 * much developer traffic each actually carries.
 */
const LANGS: readonly Lang[] = [
  'en',
  'zh',
  'hi',
  'es',
  'ar',
  'pt',
  'fr',
  'ru',
  'id',
  'de',
  'ja',
  'tr',
  'ko',
  'vi',
  'it',
]

/** What each calls itself. A reader looking for their language does not read it in English. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  zh: '简体中文',
  hi: 'हिन्दी',
  es: 'Español',
  ar: 'العربية',
  pt: 'Português',
  fr: 'Français',
  ru: 'Русский',
  id: 'Indonesia',
  de: 'Deutsch',
  ja: '日本語',
  tr: 'Türkçe',
  ko: '한국어',
  vi: 'Tiếng Việt',
  it: 'Italiano',
}

/** Two letters for the button, where the full name would not fit. */
export const LANG_SHORT: Record<Lang, string> = {
  en: 'EN',
  zh: 'ZH',
  hi: 'HI',
  es: 'ES',
  ar: 'AR',
  pt: 'PT',
  fr: 'FR',
  ru: 'RU',
  id: 'ID',
  de: 'DE',
  ja: 'JA',
  tr: 'TR',
  ko: 'KO',
  vi: 'VI',
  it: 'IT',
}

/** The tag that goes in `<html lang>` and in `hreflang`. */
export const LANG_TAGS: Record<Lang, string> = {
  en: 'en',
  zh: 'zh-Hans',
  hi: 'hi',
  es: 'es',
  ar: 'ar',
  pt: 'pt-BR',
  fr: 'fr',
  ru: 'ru',
  id: 'id',
  de: 'de',
  ja: 'ja',
  tr: 'tr',
  ko: 'ko',
  vi: 'vi',
  it: 'it',
}

/**
 * Languages written right to left. Arabic is the only one here, but the set is what the code
 * reads — a second one must not require finding every `=== 'ar'` in the tree.
 */
const RTL: readonly Lang[] = ['ar']

export function isRtl(lang: Lang): boolean {
  return RTL.includes(lang)
}
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
  // 🛑 The PATH first. The build writes one page per language — `/fr/`, `/ar/`, … — and each is
  // what a search engine indexes and what a reader lands on. Read only the query string, those
  // pages would all come up in English while their own markup announced another language.
  const segment = window.location.pathname.split('/').filter(Boolean).pop()
  if (isLang(segment)) return segment

  const asked = new URLSearchParams(window.location.search).get('lang')
  if (isLang(asked)) return asked

  try {
    const kept = window.localStorage.getItem(KEY)
    if (isLang(kept)) return kept
  } catch {
    // A private window refuses storage. A language is not worth failing over.
  }

  // The browser's list, in its own order of preference, matched on the primary subtag.
  for (const asked of window.navigator.languages ?? [window.navigator.language]) {
    const primary = asked.toLowerCase().split('-')[0]
    const found = LANGS.find(one => one === primary)
    if (found) return found
  }
  return 'en'
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
  document.documentElement.lang = LANG_TAGS[next]
  // Arabic reads the other way, and the whole page turns with it — the logical properties in the
  // stylesheet do the rest.
  document.documentElement.dir = isRtl(next) ? 'rtl' : 'ltr'

  try {
    window.localStorage.setItem(KEY, next)
  } catch {
    // See `initial`.
  }

  // Replaced rather than pushed: switching language is not a place in history to go back to.
  //
  // The query string, not the path: rewriting the path would point at a document that only
  // exists after a build, and the reader is already on a page that works. The localised paths
  // are for crawlers and for anyone arriving from one.
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

// The first paint must already be in the right language, and facing the right way.
document.documentElement.lang = LANG_TAGS[current]
document.documentElement.dir = isRtl(current) ? 'rtl' : 'ltr'
