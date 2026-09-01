import { useCallback, useState } from 'react'
import { IconButton, Panel, Panels, usePanels } from '@pasquelin/panels'
import { DockviewCenter, type DockviewApi } from '@pasquelin/panels/dockview'
// Dockview's own stylesheet, which the library deliberately does not bundle: it belongs to
// Dockview, the consumer installs that package, and pulling it in would make every project pay
// 134 kB for tabs it may never use. Without this line the tabs stack vertically, unstyled.
import 'dockview-react/dist/styles/dockview.css'
import { DocIcon, FilesIcon, PlusIcon, TerminalIcon, TuneIcon } from '../../src/icons'
import { ExampleChrome } from '../../src/ExampleChrome'

type PanelId = 'files' | 'outline' | 'problems'

const FILES = ['index.ts', 'store.ts', 'clamps.ts', 'Rail.tsx', 'README.md']

/** One kind of document. Dockview hands it the params the panel was opened with. */
function Editor({ params }: { params: Record<string, unknown> }) {
  const name = typeof params.name === 'string' ? params.name : 'untitled'

  return (
    <div className="editor">
      <p className="editor__path">src/{name}</p>
      <pre className="editor__code">
        {`// ${name}\n// Documents live in the centre and wear a tab.\n// Panels live on the edges and wear an icon.`}
      </pre>
    </div>
  )
}

const DOCUMENTS = { editor: Editor }

function Empty() {
  return (
    <div className="centre">
      <h1>No document open</h1>
      <p>Pick a file on the left. Tabs can be dragged, split and stacked.</p>
    </div>
  )
}

/**
 * The panel's own actions, and it must be a component of its own: `usePanels` reads the store
 * the provider makes, so anything calling it has to be rendered INSIDE `<Panels>`. Called from
 * `Workbench` itself — which renders the provider rather than living under it — it throws, and
 * says so.
 */
function RevealFiles() {
  const { reveal } = usePanels<PanelId>()

  return <IconButton label="Go to files" acts icon={<DocIcon />} onClick={() => reveal('files')} />
}

function Workbench() {
  const [api, setApi] = useState<DockviewApi | null>(null)

  const open = useCallback(
    (name: string) => {
      if (!api) return
      // Already open? Bring it forward rather than opening a second tab of the same file.
      const held = api.getPanel(name)
      if (held) {
        held.api.setActive()
        return
      }

      api.addPanel({ id: name, component: 'editor', title: name, params: { name } })
    },
    [api],
  )

  return (
    <Panels<PanelId>
      storageKey="panels-example:dockview"
      railHeader={
        <IconButton
          label="New file"
          acts
          icon={<PlusIcon />}
          className="pnl-rail__button"
          onClick={() => open(`untitled-${Date.now() % 1000}.ts`)}
        />
      }
    >
      <Panel<PanelId> id="files" zone="left" title="Files" icon={<FilesIcon />}>
        <div className="rows">
          {FILES.map(name => (
            <button key={name} type="button" className="row row--button" onClick={() => open(name)}>
              {name}
            </button>
          ))}
        </div>
      </Panel>

      <Panel<PanelId>
        id="outline"
        zone="right"
        title="Outline"
        icon={<TuneIcon />}
        actions={<RevealFiles />}
      >
        <p className="note">
          A panel's actions sit on its own title row. This one reveals another panel — the same call
          a keyboard shortcut or a socket message would make.
        </p>
      </Panel>

      <Panel<PanelId> id="problems" zone="bottomRight" title="Problems" icon={<TerminalIcon />}>
        <p className="note">The band runs the full width, under whichever column is open.</p>
      </Panel>

      <Panels.Center>
        <DockviewCenter documents={DOCUMENTS} empty={Empty} onReady={setApi} />
      </Panels.Center>
    </Panels>
  )
}

export function App() {
  return (
    <ExampleChrome
      title={{ en: 'Document tabs', fr: 'Onglets de documents' }}
      lead={{
        en: 'The centre carries documents on Dockview. Panels stay on the edges and never enter it.',
        fr: 'Le centre porte des documents sur Dockview. Les panneaux restent sur les bords et n’y entrent jamais.',
      }}
    >
      <Workbench />
    </ExampleChrome>
  )
}
