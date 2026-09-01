/**
 * Every word the showcase says, in one shape.
 *
 * Written out per language rather than keyed against a default: a missing key in a translated
 * interface shows up as an identifier on screen. The type does that job here — a language short
 * of a string does not compile, and fourteen of them make that guarantee worth having.
 */
export type Copy = {
  nav: { overview: string; examples: string; api: string }
  hero: {
    eyebrow: string
    title: [string, string, string]
    lead: string
    copy: string
    copied: string
    seeExamples: string
    caption: string
  }
  demo: {
    centre: string
    centreHint: string
    panels: { files: string; search: string; outline: string; notes: string; console: string }
    said: { share: string; second: string; opens: string; band: string }
  }
  examples: { title: string; lead: string; tip: string; open: (name: string) => string }
  api: { title: string; lead: string }
  foot: { docs: string; architecture: string; source: string; note: string }
  langLabel: string
  /** The four example cards, in the order the page lists them. */
  cards: { title: string; what: string; tip: string }[]
  /** The five API entries, in order. */
  api5: { name: string; body: string }[]
}
