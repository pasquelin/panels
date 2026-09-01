import type { Copy } from './shape'

export const de: Copy = {
  nav: { overview: 'Überblick', examples: 'Beispiele', api: 'API' },
  hero: {
    eyebrow: 'React 19 · 8 kB gzipped · keine Abhängigkeiten',
    title: ['Das Gerüst', 'unter', 'Ihrem Werkzeug.'],
    lead: 'Icon-Leisten an den Rändern, größenveränderbare Zonen um eine Mitte, die Ihnen gehört, und ein Layout, das ein Neuladen übersteht. Ohne Rendering darunter, frei umfärbbar darüber.',
    copy: 'Kopieren',
    copied: 'Kopiert',
    seeExamples: 'Beispiele ansehen',
    caption:
      'Live. Ziehen Sie an den Fugen zwischen den Flächen, klicken Sie ein Leistensymbol an, ändern Sie die Fenstergröße.',
  },
  demo: {
    centre: 'Ihre Mitte',
    centreHint: 'ein Router-Outlet · ein Canvas · eine Karte · Dokument-Tabs',
    panels: {
      files: 'Dateien',
      search: 'Suche',
      outline: 'Gliederung',
      notes: 'Notizen',
      console: 'Konsole',
    },
    said: {
      share: 'Zwei Panels teilen sich diese Hälfte. Die Leiste wechselt zwischen ihnen.',
      second: 'Die zweite Hälfte derselben Spalte, mit eigenem Griff.',
      opens: 'Dieses möchte breiter öffnen, als seine Spalte ist.',
      band: 'Das Band läuft unter der Spalte, die gerade offen ist.',
    },
  },
  examples: {
    title: 'Vier Einstiege',
    lead: 'Jedes läuft in Ihrem Browser, und der vollständige Quelltext steht daneben. Fangen Sie beim nächstliegenden an.',
    tip: 'Tipp.',
    open: name => `${name} öffnen`,
  },
  api: {
    title: 'Die gesamte Oberfläche',
    lead: 'Es ist wenig, und genau das ist der Punkt. Fünf Dinge, die man wissen muss.',
  },
  foot: {
    docs: 'Dokumentation',
    architecture: 'Architektur',
    source: 'Quellcode',
    note: 'MIT · von alban.pasquelin · das Gerüst dieser Seite ist die Bibliothek selbst',
  },
  langLabel: 'Sprache',
  cards: [
    {
      title: 'Minimal',
      what: 'Das kleinste Gerüst, das funktioniert. Zwei Spalten, ein Band, eine Mitte — und eine eigene Kopfzeile, die es steuert.',
      tip: 'Panels, die sich Zone und Hälfte teilen, wechseln sich ab; die Leiste schaltet zwischen ihnen um. Geben Sie einem die zweite Hälfte, damit es unter dem ersten steht.',
    },
    {
      title: 'React Router',
      what: 'Die Mitte ist ein Outlet. Navigation ändert nur die Mitte — Spalten behalten ihre Breite, offene Panels bleiben offen.',
      tip: 'Deklarieren Sie die Panels in der Layout-Route, oberhalb des Outlets. Pro Seite deklariert, würden sie bei jeder Navigation ausgehängt und verlören ihren Inhalt.',
    },
    {
      title: 'Dokument-Tabs',
      what: 'Die Mitte trägt Dokumente über Dockview — Tabs, die sich ziehen und teilen lassen — während die Panels an den Rändern bleiben.',
      tip: 'Aus dem dockview-Einstiegspunkt importieren, damit sein Gewicht nur die Projekte trifft, die Tabs wollen. Ein Panel betritt nie die Mitte: ein Dokument hat einen Namen, ein Panel ein Symbol.',
    },
    {
      title: 'Umgefärbt',
      what: 'Dasselbe Gerüst unter vier Paletten. Farben, Radius, Leistenbreite, Kopfzeilenhöhe — alles Custom Properties.',
      tip: 'Setzen Sie das Akzent-Token auf einem beliebigen Vorfahren, und das Gerüst übernimmt Ihre Marke, statt seine aufzudrängen. Weiter gehen? Jedes Teil ist exportiert und einzeln austauschbar.',
    },
  ],
  api5: [
    {
      name: 'Deklarieren',
      body: 'Ein Panel ist ein Deskriptor: wo es hängt, wie es heißt, was es zeichnet.',
    },
    {
      name: 'Steuern',
      body: 'Ein Hook für jede Kopfzeile, jedes Tastenkürzel und jedes Menü, das auf die Panels wirken soll.',
    },
    {
      name: 'Von außerhalb React steuern',
      body: 'Erzeugen Sie den Store selbst, dann können ein Socket, ein natives Menü oder ein Worker ein Panel öffnen.',
    },
    {
      name: 'Umfärben',
      body: 'Jeder Wert ist eine Custom Property. Setzen Sie den Akzent, und die Leisten folgen Ihrer Marke.',
    },
    {
      name: 'Oder nur die Logik nehmen',
      body: 'Die Komponenten stehen auf Hooks, die nichts zeichnen. Zeichnen Sie Ihren eigenen Rahmen darauf.',
    },
  ],
}
