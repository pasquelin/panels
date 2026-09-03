import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IconButton, Panel, Panels, usePanels } from '@pasquelin/panels'
// La feuille du chassis, importée comme un consommateur l'importe.
import '@pasquelin/panels/styles.css'
import { COPY } from '../../src/copy'
import { useLang } from '../../src/i18n'
import {
  ChatIcon,
  FilesIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  TerminalIcon,
} from '../../src/icons'
import '../../src/demo.css'

/**
 * Le chassis en train de tourner — la thèse de la vitrine, et la raison pour laquelle elle
 * n'en montre pas une capture.
 *
 * Servi comme démo à part et embarqué par la page : la vitrine est du HTML statique rendu
 * une fois par langue, et faire vivre le chassis dedans aurait obligé la page entière à
 * redevenir une application React. La démo, elle, reste la vraie librairie, avec ses
 * gouttières qu'on tire pour de bon.
 *
 * La langue arrive par `?lang=` — la page la transmet, pour que le cadre parle comme ce qui
 * l'entoure.
 */
type DemoId = 'files' | 'search' | 'outline' | 'chat' | 'console'

function DemoBar() {
  const { panels, isShown, toggle } = usePanels<DemoId>()

  return (
    <div className="demo-bar">
      {panels.map(panel => (
        <button
          key={panel.id}
          type="button"
          aria-pressed={isShown(panel.id)}
          className={`demo-bar__chip${isShown(panel.id) ? ' demo-bar__chip--on' : ''}`}
          onClick={() => toggle(panel.id)}
        >
          {panel.title}
        </button>
      ))}
    </div>
  )
}

function DemoCentre() {
  const [lang] = useLang()
  const words = COPY[lang].demo

  return (
    <div className="demo-centre">
      <p>{words.centre}</p>
      <span>{words.centreHint}</span>
    </div>
  )
}

function LiveChassis() {
  const [lang] = useLang()
  const words = COPY[lang].demo

  return (
    <Panels<DemoId>
      storageKey="panels-showcase:hero"
      // La page annonce que les panneaux se déplacent, juste sous ce cadre : une démo vivante
      // où le geste ne marche pas dément la section qu'elle illustre.
      draggablePanels
      // Forcé, et repeint dans la palette de la page : le chassis prend l'accent de son
      // hôte au lieu d'en imposer un, et cette page EST un hôte.
      theme="dark"
      railHeader={<IconButton label="New" acts icon={<PlusIcon />} className="pnl-rail__button" />}
      header={<DemoBar />}
    >
      <Panel<DemoId> id="files" zone="left" title={words.panels.files} icon={<FilesIcon />}>
        <div className="rows">
          {['index.ts', 'store.ts', 'Rail.tsx', 'panels.css'].map(name => (
            <span key={name} className="row">
              {name}
            </span>
          ))}
        </div>
      </Panel>
      <Panel<DemoId> id="search" zone="left" title={words.panels.search} icon={<SearchIcon />}>
        <p className="note">{words.said.share}</p>
      </Panel>
      <Panel<DemoId>
        id="outline"
        zone="left"
        slot="secondary"
        title={words.panels.outline}
        icon={<LayersIcon />}
      >
        <p className="note">{words.said.second}</p>
      </Panel>
      <Panel<DemoId>
        id="chat"
        zone="right"
        title={words.panels.notes}
        icon={<ChatIcon />}
        opens={260}
      >
        <p className="note">
          {words.said.opens} — <code>opens</code>.
        </p>
      </Panel>
      <Panel<DemoId>
        id="console"
        zone="bottomRight"
        title={words.panels.console}
        icon={<TerminalIcon />}
      >
        <p className="note">{words.said.band}</p>
      </Panel>
      <Panels.Center>
        <DemoCentre />
      </Panels.Center>
    </Panels>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('#root missing')

createRoot(root).render(
  <StrictMode>
    <LiveChassis />
  </StrictMode>,
)
