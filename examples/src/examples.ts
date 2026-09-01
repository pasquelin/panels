import type { Lang } from './i18n'

/** One example, as the showcase presents it: what it proves, and the advice that goes with it. */
export type ExampleCard = {
  id: string
  title: string
  what: string
  tip: string
  code: string
}

/**
 * The code is the same in both languages — it is code. Only what surrounds it is translated,
 * which is also why the snippets live here once rather than inside each translation.
 */
const CODE = {
  minimal: `import { Panels, Panel } from '@pasquelin/panels'
import '@pasquelin/panels/styles.css'

<Panels<PanelId>>
  <Panel<PanelId> id="files" zone="left" title="Files">
    <FileTree />
  </Panel>

  <Panel<PanelId> id="notes" zone="right" opens={380}>
    <Notes />
  </Panel>

  <Panels.Center>
    <YourApp />
  </Panels.Center>
</Panels>`,
  router: `function Layout() {
  return (
    <Panels<PanelId>>
      <Panel<PanelId> id="sites" zone="left" title="Sites">
        <SiteList />
      </Panel>

      <Panels.Center>
        <Outlet />
      </Panels.Center>
    </Panels>
  )
}`,
  dockview: `import { DockviewCenter } from '@pasquelin/panels/dockview'

<Panels.Center>
  <DockviewCenter
    documents={{ editor: Editor }}
    empty={NothingOpen}
    onReady={setApi}
  />
</Panels.Center>`,
  theme: `.pnl-root {
  --pnl-chassis: #2e2b26;
  --pnl-panel: #1b1916;
  --pnl-accent: #d99a2b;
  --pnl-radius: 12px;
  --pnl-rail: 60px;
}`,
} as const

export const EXAMPLES: Record<Lang, ExampleCard[]> = {
  en: [
    {
      id: 'minimal',
      title: 'Minimal',
      what: 'The smallest chassis that works. Two columns, a band, a centre — and a header of your own driving it.',
      tip: 'Panels sharing a zone and a slot take turns; the rail switches between them. Give a panel the secondary slot to stack it under the first instead.',
      code: CODE.minimal,
    },
    {
      id: 'router',
      title: 'React Router',
      what: 'The centre is an outlet. Navigating changes the middle and nothing else — columns keep their width, open panels stay open.',
      tip: 'Declare the panels in the layout route, above the outlet. Declared per page, they would unmount on every navigation and lose whatever they held.',
      code: CODE.router,
    },
    {
      id: 'dockview',
      title: 'Document tabs',
      what: 'The centre carries documents on Dockview — draggable, splittable tabs — while panels stay on the edges.',
      tip: 'Import it from the dockview entry point so its weight only lands on the projects that want tabs. Tool panels never enter the centre: a document has a name, a panel has an icon.',
      code: CODE.dockview,
    },
    {
      id: 'theme',
      title: 'Repainted',
      what: 'The same chassis under four palettes. Colours, radius, rail width, header height — all custom properties.',
      tip: 'Set the accent token on any ancestor and the chassis inherits your brand instead of imposing one. Need to go further? Every piece is exported and replaceable on its own.',
      code: CODE.theme,
    },
  ],
  fr: [
    {
      id: 'minimal',
      title: 'Minimal',
      what: 'Le plus petit châssis qui fonctionne. Deux colonnes, une bande, un centre — et un en-tête à vous qui le pilote.',
      tip: 'Deux panneaux qui partagent une zone et une moitié prennent leur tour ; le rail bascule entre eux. Donnez-lui la moitié secondaire pour l’empiler sous le premier.',
      code: CODE.minimal,
    },
    {
      id: 'router',
      title: 'React Router',
      what: 'Le centre est une route. Naviguer change le milieu et rien d’autre — les colonnes gardent leur largeur, les panneaux ouverts le restent.',
      tip: 'Déclarez les panneaux dans la route de mise en page, au-dessus de la route enfant. Déclarés par page, ils seraient démontés à chaque navigation et perdraient ce qu’ils tenaient.',
      code: CODE.router,
    },
    {
      id: 'dockview',
      title: 'Onglets de documents',
      what: 'Le centre porte des documents sur Dockview — des onglets qu’on déplace et qu’on partage — pendant que les panneaux restent sur les bords.',
      tip: 'Importez-le depuis l’entrée dockview : son poids ne pèse alors que sur les projets qui veulent des onglets. Un panneau n’entre jamais au centre — un document a un nom, un panneau a une icône.',
      code: CODE.dockview,
    },
    {
      id: 'theme',
      title: 'Repeint',
      what: 'Le même châssis sous quatre palettes. Couleurs, rayon, largeur du rail, hauteur d’en-tête — tout est une propriété personnalisée.',
      tip: 'Posez le jeton d’accent sur n’importe quel ancêtre et le châssis prend votre identité au lieu d’imposer la sienne. Besoin d’aller plus loin ? Chaque pièce est exportée et remplaçable seule.',
      code: CODE.theme,
    },
  ],
}

export type ApiEntry = { name: string; body: string; code: string }

const API_CODE = {
  declare: `<Panel id="files" zone="left" title="Files" icon={<Icon />}>
  <FileTree />
</Panel>`,
  drive: `const { reveal, close, toggle, isShown } = usePanels<PanelId>()`,
  outside: `const store = createPanelsStore<PanelId>()
socket.on('alert', () => store.getState().show('alerts'))`,
  repaint: `.pnl-root {
  --pnl-panel: #101418;
  --pnl-accent: #47965c;
  --pnl-radius: 10px;
}`,
  headless: `const zone = useZone('left')
useContainerFit(ref)`,
} as const

export const API: Record<Lang, ApiEntry[]> = {
  en: [
    {
      name: 'Declare',
      body: 'A panel is a descriptor. Where it hangs, what it is called, what it draws.',
      code: API_CODE.declare,
    },
    {
      name: 'Drive',
      body: 'One hook for every header, shortcut or menu that needs to act on the panels.',
      code: API_CODE.drive,
    },
    {
      name: 'Drive from outside React',
      body: 'Build the store yourself and a socket, a native menu or a worker can open a panel.',
      code: API_CODE.outside,
    },
    {
      name: 'Repaint',
      body: 'Every value is a custom property. Set the accent and the rails follow your brand.',
      code: API_CODE.repaint,
    },
    {
      name: 'Or take the logic only',
      body: 'The components are built on hooks that render nothing. Draw your own frame on them.',
      code: API_CODE.headless,
    },
  ],
  fr: [
    {
      name: 'Déclarer',
      body: 'Un panneau est un descripteur. Où il s’accroche, comment il s’appelle, ce qu’il dessine.',
      code: API_CODE.declare,
    },
    {
      name: 'Piloter',
      body: 'Un seul hook pour tout en-tête, raccourci ou menu qui doit agir sur les panneaux.',
      code: API_CODE.drive,
    },
    {
      name: 'Piloter hors de React',
      body: 'Construisez le store vous-même et un socket, un menu natif ou un worker ouvre un panneau.',
      code: API_CODE.outside,
    },
    {
      name: 'Repeindre',
      body: 'Chaque valeur est une propriété personnalisée. Posez l’accent et les rails suivent votre identité.',
      code: API_CODE.repaint,
    },
    {
      name: 'Ou ne prendre que la logique',
      body: 'Les composants sont bâtis sur des hooks qui ne dessinent rien. Dessinez votre propre cadre dessus.',
      code: API_CODE.headless,
    },
  ],
}
