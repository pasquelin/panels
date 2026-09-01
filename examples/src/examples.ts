/** The four examples, as the showcase presents them: what each proves, and the advice with it. */
export const EXAMPLES = [
  {
    id: 'minimal',
    title: 'Minimal',
    what: 'The smallest chassis that works. Two columns, a band, a centre — and a header of your own driving it.',
    tip: 'Panels sharing a zone and a slot take turns; the rail switches between them. Give a panel the secondary slot to stack it under the first instead.',
    code: `import { Panels, Panel } from '@pasquelin/panels'
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
  },
  {
    id: 'router',
    title: 'React Router',
    what: 'The centre is an outlet. Navigating changes the middle and nothing else — columns keep their width, open panels stay open.',
    tip: 'Declare the panels in the layout route, above the outlet. Declared per page, they would unmount on every navigation and lose whatever they held.',
    code: `function Layout() {
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
  },
  {
    id: 'dockview',
    title: 'Document tabs',
    what: 'The centre carries documents on Dockview — draggable, splittable tabs — while panels stay on the edges.',
    tip: 'Import it from the dockview entry point so its weight only lands on the projects that want tabs. Tool panels never enter the centre: a document has a name, a panel has an icon.',
    code: `import { DockviewCenter } from '@pasquelin/panels/dockview'

<Panels.Center>
  <DockviewCenter
    documents={{ editor: Editor }}
    empty={NothingOpen}
    onReady={setApi}
  />
</Panels.Center>`,
  },
  {
    id: 'theme',
    title: 'Repainted',
    what: 'The same chassis under four palettes. Colours, radius, rail width, header height — all custom properties.',
    tip: 'Set the accent token on any ancestor and the chassis inherits your brand instead of imposing one. Need to go further? Every piece is exported and replaceable on its own.',
    code: `.pnl-root {
  --pnl-chassis: #2e2b26;
  --pnl-panel: #1b1916;
  --pnl-accent: #d99a2b;
  --pnl-radius: 12px;
  --pnl-rail: 60px;
}`,
  },
] as const
