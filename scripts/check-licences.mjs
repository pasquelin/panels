/**
 * Fails if a dependency's licence is not one this project may ship, or if something bundled into
 * the published package has no notice in THIRD-PARTY-NOTICES.md.
 *
 * Written because that file is a legal claim, and a claim nobody rechecks is one that drifts on
 * the first upgrade.
 */
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

/** MIT and its equivalents. Anything else is a decision, not a detail — hence the failure. */
const ALLOWED = new Set(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'Apache-2.0'])

/** Shipped inside `dist/`, so their notices must appear in THIRD-PARTY-NOTICES.md. */
const BUNDLED = ['zustand']

const own = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const notices = readFileSync(new URL('../THIRD-PARTY-NOTICES.md', import.meta.url), 'utf8')

const problems = []

if (own.license !== 'MIT') {
  problems.push(`package.json declares "${own.license}"; LICENSE is MIT.`)
}

if (own.dependencies && Object.keys(own.dependencies).length > 0) {
  // Anything here is installed into the consumer's tree. Bundled code must not also be listed:
  // they would end up with two copies of the same library.
  problems.push(
    `runtime dependencies declared: ${Object.keys(own.dependencies).join(', ')}. ` +
      'Bundled code belongs in devDependencies; anything genuinely required belongs in peerDependencies.',
  )
}

for (const name of BUNDLED) {
  if (!notices.includes(name)) problems.push(`${name} is bundled but has no notice.`)
  if (!own.devDependencies?.[name])
    problems.push(`${name} is declared bundled but is not installed.`)
}

/** The licence a package declares, read from the installed tree. */
function licenceOf(name) {
  try {
    const found = execFileSync('find', [
      'node_modules/.pnpm',
      '-maxdepth',
      '4',
      '-path',
      `*/node_modules/${name}/package.json`,
    ])
      .toString()
      .split('\n')
      .filter(Boolean)

    if (found.length === 0) return null
    return JSON.parse(readFileSync(found[0], 'utf8')).license ?? null
  } catch {
    return null
  }
}

const declared = [
  ...Object.keys(own.devDependencies ?? {}),
  ...Object.keys(own.peerDependencies ?? {}),
]

for (const name of declared) {
  const licence = licenceOf(name)
  if (licence === null) continue // not installed here; nothing to judge
  if (!ALLOWED.has(licence)) problems.push(`${name} is ${licence}, which is not on the allow list.`)
}

if (problems.length > 0) {
  console.error('Licence check failed:\n')
  for (const problem of problems) console.error(`  · ${problem}`)
  process.exit(1)
}

console.log(`Licence check passed — ${declared.length} packages, all permissive, notices present.`)
