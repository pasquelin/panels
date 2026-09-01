import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Read from disk rather than imported: the point is what the SHEET says, and a bundler would
// hand back a transformed copy — or, under jsdom, an injected style element.
const SHEET = readFileSync(resolve(process.cwd(), 'src/styles/panels.css'), 'utf8')

/** Comments carry braces of their own, and this file is mostly comments. */
const CODE = SHEET.replace(/\/\*[\s\S]*?\*\//g, '')

/** Every selector that declares a `--pnl-*` default, with the block it opens. */
function tokenSelectors(): string[] {
  const found: string[] = []
  const blocks = /([^{}]+)\{([^{}]*)\}/g

  for (const [, selector = '', body = ''] of CODE.matchAll(blocks)) {
    // A block that DECLARES a token, not one that merely reads one through `var()`.
    if (/^\s*--pnl-|\n\s*--pnl-/.test(body)) found.push(selector.trim())
  }
  return found
}

describe('the default palette', () => {
  /**
   * 🛑 The rule a project depends on, and it is invisible from inside the library: a consumer
   * writes `.my-theme { --pnl-panel: … }` on the chassis, and that must win.
   *
   * It did not. `.pnl-root:not([data-pnl-theme='dark'])` outscores any single class, so a
   * project's palette applied in the dark and vanished the moment the reader's system asked for
   * the light one. `:where()` carries no specificity, which puts every default at zero and lets
   * anything a project writes take precedence, whatever order the stylesheets load in.
   */
  it('declares every default token at zero specificity', () => {
    const offenders = tokenSelectors().filter(selector => !selector.startsWith(':where('))

    expect(offenders).toEqual([])
  })

  it('ships a dark default and a light palette, both overridable', () => {
    const selectors = tokenSelectors()

    // Dark is the DEFAULT rather than a palette of its own — `data-pnl-theme="dark"` only has
    // to defeat the light media query, which it does by opting out of it.
    expect(selectors).toContain(':where(.pnl-root)')
    expect(selectors.filter(one => one.includes("data-pnl-theme='light'"))).toHaveLength(1)
    expect(SHEET).toContain('prefers-color-scheme: light')
  })

  it('keeps the layout out of the token blocks, where a repaint must not reach it', () => {
    // `display` and `height` are not something a project overrides by choosing a palette.
    expect(SHEET).toMatch(/\n\.pnl-root \{\n\s*display: flex;/)
  })
})
