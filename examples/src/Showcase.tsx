import { useEffect, useState } from 'react'
import { IconButton, Panel, Panels, usePanels } from '@pasquelin/panels'
import { Code } from './code'
import { EXAMPLES } from './examples'
import {
  ChatIcon,
  FilesIcon,
  LayersIcon,
  PlusIcon,
  SearchIcon,
  TerminalIcon,
  TuneIcon,
} from './icons'

/**
 * The showcase.
 *
 * Its thesis is in the hero: the chassis demonstrating itself, with gutters you can actually
 * drag. A library whose own site does not run it is a library asking to be taken on trust.
 */
export function Showcase() {
  return (
    <>
      <SideRail />
      <main className="page">
        <Hero />
        <Examples />
        <Api />
        <Foot />
      </main>
    </>
  )
}

const SECTIONS = [
  { id: 'top', label: 'Overview', icon: <FilesIcon /> },
  { id: 'examples', label: 'Examples', icon: <TerminalIcon /> },
  { id: 'api', label: 'API', icon: <TuneIcon /> },
]

/**
 * The page's navigation, drawn as the rail the library itself draws.
 *
 * The one borrowed motif on the page, and it earns its place: it is what the product IS. Every
 * other flourish was cut so this one reads.
 */
function SideRail() {
  const [here, setHere] = useState('top')

  useEffect(() => {
    const spotted = new IntersectionObserver(
      entries => {
        const seen = entries.filter(entry => entry.isIntersecting)
        if (seen[0]) setHere(seen[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const { id } of SECTIONS) {
      const node = document.getElementById(id)
      if (node) spotted.observe(node)
    }
    return () => spotted.disconnect()
  }, [])

  return (
    <nav className="railnav" aria-label="Sections">
      <span className="railnav__mark" aria-hidden="true" />
      {SECTIONS.map(section => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`railnav__dot${here === section.id ? ' railnav__dot--on' : ''}`}
          aria-current={here === section.id ? 'true' : undefined}
        >
          <span className="railnav__glyph" aria-hidden="true">
            {section.icon}
          </span>
          <span className="railnav__label">{section.label}</span>
        </a>
      ))}
    </nav>
  )
}

const INSTALL = 'pnpm add @pasquelin/panels'

function Hero() {
  const [copied, setCopied] = useState(false)

  return (
    <header className="hero" id="top">
      <p className="hero__eyebrow">React 19 · 8 kB gzipped · no dependencies</p>
      <h1 className="hero__title">
        The chassis
        <br />
        <em>under</em> your tool.
      </h1>
      <p className="hero__lead">
        Icon rails on the edges, resizable zones around a centre that is yours, and a layout that
        survives a reload. Headless underneath, repaintable on top.
      </p>

      <div className="hero__actions">
        <button
          type="button"
          className="install"
          onClick={() => {
            void navigator.clipboard?.writeText(INSTALL)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          }}
        >
          <code>{INSTALL}</code>
          <span className="install__state">{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <a className="link" href="#examples">
          See the examples
        </a>
      </div>

      <figure className="stage">
        <LiveChassis />
        <figcaption className="stage__caption">
          Live. Drag the gutters between the surfaces, click a rail icon, resize the window.
        </figcaption>
      </figure>
    </header>
  )
}

type DemoId = 'files' | 'search' | 'outline' | 'chat' | 'console'

/** The hero is a real chassis, with real state — not a picture of one. */
function LiveChassis() {
  return (
    <div className="stage__frame">
      <Panels<DemoId>
        storageKey="panels-showcase:hero"
        // Forced, and repainted in the page's own palette: the chassis takes the accent from
        // its host rather than imposing one, and this page IS a host.
        theme="dark"
        railHeader={
          <IconButton label="New" acts icon={<PlusIcon />} className="pnl-rail__button" />
        }
        header={<DemoBar />}
      >
        <Panel<DemoId> id="files" zone="left" title="Files" icon={<FilesIcon />}>
          <div className="rows">
            {['index.ts', 'store.ts', 'Rail.tsx', 'panels.css'].map(name => (
              <span key={name} className="row">
                {name}
              </span>
            ))}
          </div>
        </Panel>
        <Panel<DemoId> id="search" zone="left" title="Search" icon={<SearchIcon />}>
          <p className="note">Two panels share this half. The rail switches between them.</p>
        </Panel>
        <Panel<DemoId>
          id="outline"
          zone="left"
          slot="secondary"
          title="Outline"
          icon={<LayersIcon />}
        >
          <p className="note">The second half of the same column, with its own handle.</p>
        </Panel>
        <Panel<DemoId> id="chat" zone="right" title="Notes" icon={<ChatIcon />} opens={260}>
          <p className="note">
            This one asks to open wider than its column’s own width — <code>opens</code>.
          </p>
        </Panel>
        <Panel<DemoId> id="console" zone="bottomRight" title="Console" icon={<TerminalIcon />}>
          <p className="note">The band runs under whichever column is open.</p>
        </Panel>
        <Panels.Center>
          <div className="demo-centre">
            <p>Your centre</p>
            <span>a router outlet · a canvas · a map · document tabs</span>
          </div>
        </Panels.Center>
      </Panels>
    </div>
  )
}

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

function Examples() {
  return (
    <section className="section" id="examples">
      <h2 className="section__title">Four ways in</h2>
      <p className="section__lead">
        Each one runs in your browser and its whole source is on screen. Start from the closest.
      </p>

      <div className="cards">
        {EXAMPLES.map(example => (
          <article key={example.id} className="card">
            <header className="card__head">
              <h3 className="card__title">{example.title}</h3>
              <p className="card__what">{example.what}</p>
            </header>

            <Code source={example.code} />

            <p className="card__tip">
              <strong>Tip.</strong> {example.tip}
            </p>

            <a className="card__open" href={`./${example.id}/index.html`}>
              Open {example.title} <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

const API = [
  {
    name: 'Declare',
    body: 'A panel is a descriptor. Where it hangs, what it is called, what it draws.',
    code: `<Panel id="files" zone="left" title="Files" icon={<Icon />}>
  <FileTree />
</Panel>`,
  },
  {
    name: 'Drive',
    body: 'One hook for every header, shortcut or menu that needs to act on the panels.',
    code: `const { reveal, close, toggle, isShown } = usePanels<PanelId>()`,
  },
  {
    name: 'Drive from outside React',
    body: 'Build the store yourself and a socket, a native menu or a worker can open a panel.',
    code: `const store = createPanelsStore<PanelId>()
socket.on('alert', () => store.getState().show('alerts'))`,
  },
  {
    name: 'Repaint',
    body: 'Every value is a custom property. Set the accent and the rails follow your brand.',
    code: `.pnl-root {
  --pnl-panel: #101418;
  --pnl-accent: #47965c;
  --pnl-radius: 10px;
}`,
  },
  {
    name: 'Or take the logic only',
    body: 'The components are built on hooks that render nothing. Draw your own frame on them.',
    code: `const zone = useZone('left')
useContainerFit(ref)`,
  },
]

function Api() {
  return (
    <section className="section" id="api">
      <h2 className="section__title">The whole surface</h2>
      <p className="section__lead">
        There is not much of it, and that is the point. Five things to know.
      </p>

      <dl className="api">
        {API.map(entry => (
          <div className="api__row" key={entry.name}>
            <dt className="api__name">{entry.name}</dt>
            <dd className="api__body">
              <p>{entry.body}</p>
              <Code source={entry.code} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const REPO = 'https://github.com/pasquelin/panel'

function Foot() {
  return (
    <footer className="foot">
      <div className="foot__links">
        <a className="link" href={`${REPO}#readme`}>
          Documentation
        </a>
        <a className="link" href={`${REPO}/blob/main/docs/ARCHITECTURE.md`}>
          Architecture
        </a>
        <a className="link" href={REPO}>
          Source
        </a>
        <a className="link" href="https://www.npmjs.com/package/@pasquelin/panels">
          npm
        </a>
      </div>
      <p className="foot__note">
        MIT · built by alban.pasquelin · the chassis on this page is the library itself
      </p>
    </footer>
  )
}
