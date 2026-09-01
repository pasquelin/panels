import type { Copy } from './shape'

export const en: Copy = {
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
  cards: [
    {
      title: 'Minimal',
      what: 'The smallest chassis that works. Two columns, a band, a centre — and a header of your own driving it.',
      tip: 'Panels sharing a zone and a slot take turns; the rail switches between them. Give a panel the secondary slot to stack it under the first instead.',
    },
    {
      title: 'React Router',
      what: 'The centre is an outlet. Navigating changes the middle and nothing else — columns keep their width, open panels stay open.',
      tip: 'Declare the panels in the layout route, above the outlet. Declared per page, they would unmount on every navigation and lose whatever they held.',
    },
    {
      title: 'Document tabs',
      what: 'The centre carries documents on Dockview — draggable, splittable tabs — while panels stay on the edges.',
      tip: 'Import it from the dockview entry point so its weight only lands on the projects that want tabs. Tool panels never enter the centre: a document has a name, a panel has an icon.',
    },
    {
      title: 'Repainted',
      what: 'The same chassis under four palettes. Colours, radius, rail width, header height — all custom properties.',
      tip: 'Set the accent token on any ancestor and the chassis inherits your brand instead of imposing one. Need to go further? Every piece is exported and replaceable on its own.',
    },
  ],
  api5: [
    {
      name: 'Declare',
      body: 'A panel is a descriptor. Where it hangs, what it is called, what it draws.',
    },
    {
      name: 'Drive',
      body: 'One hook for every header, shortcut or menu that needs to act on the panels.',
    },
    {
      name: 'Drive from outside React',
      body: 'Build the store yourself and a socket, a native menu or a worker can open a panel.',
    },
    {
      name: 'Repaint',
      body: 'Every value is a custom property. Set the accent and the rails follow your brand.',
    },
    {
      name: 'Or take the logic only',
      body: 'The components are built on hooks that render nothing. Draw your own frame on them.',
    },
  ],
}
