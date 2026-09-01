/** The four examples, in the order the page lists them. Their prose lives in `copy/`. */
export const EXAMPLE_IDS = ['minimal', 'router', 'dockview', 'theme'] as const

/**
 * The same in every language, because it is code. Only what surrounds it is translated, which is
 * why the snippets live here once rather than inside fifteen translation files.
 */
export const CODE = {
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

export const API_CODE = {
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
