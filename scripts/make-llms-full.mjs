/**
 * Builds `llms-full.txt` from the documentation that already exists.
 *
 * Generated rather than written: it is the same text as `docs/`, and a second copy maintained by
 * hand is a copy that drifts. `pnpm validate` regenerates it and fails if the committed file is
 * stale, so the two cannot disagree.
 *
 * English only. The French chapters say the same things, and doubling the file would spend a
 * reader's context on a translation rather than on the subject.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = name => readFileSync(resolve(root, name), 'utf8').trim()

/** In reading order: what it is, then how to use it, then how it works inside. */
const PARTS = [
  ['llms.txt', null],
  ['README.md', 'README'],
  ['docs/en/PANELS.md', 'Panels'],
  ['docs/en/LAYOUT.md', 'Layout'],
  ['docs/en/HOOKS.md', 'Hooks'],
  ['docs/en/THEMING.md', 'Theming'],
  ['docs/en/COMPONENTS.md', 'Components'],
  ['docs/en/DOCKVIEW.md', 'Document tabs'],
  ['docs/en/RECIPES.md', 'Recipes'],
  ['docs/ARCHITECTURE.md', 'Architecture'],
  ['THIRD-PARTY-NOTICES.md', 'Licences'],
]

/** Cross-language links and "back to index" arrows mean nothing in a flat file. */
function withoutNavigation(text) {
  return text
    .split('\n')
    .filter(line => !/^🇫🇷 \[|^🇬🇧 \[/.test(line.trim()))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const body = PARTS.map(([file, heading]) => {
  const text = withoutNavigation(read(file))
  if (heading === null) return text

  return `\n\n${'='.repeat(78)}\n${heading}\n${'='.repeat(78)}\n\n${text}`
}).join('')

const out = `${body}\n`
const target = resolve(root, 'llms-full.txt')

if (process.argv.includes('--check')) {
  let held = ''
  try {
    held = readFileSync(target, 'utf8')
  } catch {
    // Not written yet; the mismatch below reports it.
  }

  if (held !== out) {
    console.error('llms-full.txt is stale. Run `pnpm llms` and commit the result.')
    process.exit(1)
  }

  console.log('llms-full.txt is up to date.')
} else {
  writeFileSync(target, out)
  console.log(`llms-full.txt written — ${out.split('\n').length} lines from ${PARTS.length} files.`)
}
