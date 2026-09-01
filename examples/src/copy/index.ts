import type { Lang } from '../i18n'
import type { Copy } from './shape'
import { ar } from './ar'
import { de } from './de'
import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import { hi } from './hi'
import { id } from './id'
import { it } from './it'
import { ja } from './ja'
import { ko } from './ko'
import { pt } from './pt'
import { ru } from './ru'
import { tr } from './tr'
import { vi } from './vi'
import { zh } from './zh'

/**
 * Every language, keyed. The `Record<Lang, Copy>` is the guard: adding a language to `Lang`
 * without translating it does not compile, and a translation short of a string does not either.
 */
export const COPY: Record<Lang, Copy> = {
  en,
  zh,
  hi,
  es,
  ar,
  pt,
  fr,
  ru,
  id,
  de,
  ja,
  tr,
  ko,
  vi,
  it,
}

export type { Copy }
