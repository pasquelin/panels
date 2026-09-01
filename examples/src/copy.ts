import type { Lang } from './i18n'

/**
 * Every word the showcase says, in both languages.
 *
 * Written out rather than keyed against a default: a missing key in a translated interface shows
 * up as an identifier on screen, and with two languages and one page there is nothing to gain
 * from the machinery that would prevent it. The type does the job — a language short of a string
 * does not compile.
 */
type Copy = {
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
}

export const COPY: Record<Lang, Copy> = {
  en: {
    nav: { overview: 'Overview', examples: 'Examples', api: 'API' },
    hero: {
      eyebrow: 'React 19 · 8 kB gzipped · no dependencies',
      title: ['The chassis', 'under', 'your tool.'],
      lead: 'Icon rails on the edges, resizable zones around a centre that is yours, and a layout that survives a reload. Headless underneath, repaintable on top.',
      copy: 'Copy',
      copied: 'Copied',
      seeExamples: 'See the examples',
      caption: 'Live. Drag the gutters between the surfaces, click a rail icon, resize the window.',
    },
    demo: {
      centre: 'Your centre',
      centreHint: 'a router outlet · a canvas · a map · document tabs',
      panels: {
        files: 'Files',
        search: 'Search',
        outline: 'Outline',
        notes: 'Notes',
        console: 'Console',
      },
      said: {
        share: 'Two panels share this half. The rail switches between them.',
        second: 'The second half of the same column, with its own handle.',
        opens: 'This one asks to open wider than its column’s own width.',
        band: 'The band runs under whichever column is open.',
      },
    },
    examples: {
      title: 'Four ways in',
      lead: 'Each one runs in your browser and its whole source is on screen. Start from the closest.',
      tip: 'Tip.',
      open: name => `Open ${name}`,
    },
    api: {
      title: 'The whole surface',
      lead: 'There is not much of it, and that is the point. Five things to know.',
    },
    foot: {
      docs: 'Documentation',
      architecture: 'Architecture',
      source: 'Source',
      note: 'MIT · built by alban.pasquelin · the chassis on this page is the library itself',
    },
    langLabel: 'Language',
  },
  fr: {
    nav: { overview: 'Aperçu', examples: 'Exemples', api: 'API' },
    hero: {
      eyebrow: 'React 19 · 8 ko compressé · aucune dépendance',
      title: ['Le châssis', 'sous', 'votre outil.'],
      lead: "Des rails d'icônes sur les bords, des zones redimensionnables autour d'un centre qui est le vôtre, et une disposition qui survit au rechargement. Sans rendu en dessous, repeignable au-dessus.",
      copy: 'Copier',
      copied: 'Copié',
      seeExamples: 'Voir les exemples',
      caption:
        'En direct. Faites glisser les gouttières entre les surfaces, cliquez une icône du rail, redimensionnez la fenêtre.',
    },
    demo: {
      centre: 'Votre centre',
      centreHint: 'une route · un canvas · une carte · des onglets',
      panels: {
        files: 'Fichiers',
        search: 'Recherche',
        outline: 'Plan',
        notes: 'Notes',
        console: 'Console',
      },
      said: {
        share: 'Deux panneaux partagent cette moitié. Le rail bascule entre eux.',
        second: 'La seconde moitié de la même colonne, avec sa propre poignée.',
        opens: 'Celui-ci demande à s’ouvrir plus large que sa colonne.',
        band: 'La bande court sous la colonne qui est ouverte.',
      },
    },
    examples: {
      title: 'Quatre portes d’entrée',
      lead: 'Chacun tourne dans votre navigateur et tout son code est à l’écran. Partez du plus proche.',
      tip: 'Conseil.',
      open: name => `Ouvrir ${name}`,
    },
    api: {
      title: 'Toute la surface',
      lead: 'Il n’y en a pas beaucoup, et c’est le but. Cinq choses à savoir.',
    },
    foot: {
      docs: 'Documentation',
      architecture: 'Architecture',
      source: 'Sources',
      note: 'MIT · par alban.pasquelin · le châssis de cette page est la bibliothèque elle-même',
    },
    langLabel: 'Langue',
  },
}
