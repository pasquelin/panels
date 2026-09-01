import { useEffect, useState } from 'react'
import { IconButton, Panel, Panels, usePanels } from '@pasquelin/panels'
import { Code } from './code'
import { API_CODE, CODE, EXAMPLE_IDS } from './examples'
import { COPY } from './copy'
import { LANG_NAMES, LANGS, useLang, type Lang } from './i18n'
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

const SECTION_IDS = ['top', 'examples', 'api'] as const
const SECTION_ICONS = [<FilesIcon key="a" />, <TerminalIcon key="b" />, <TuneIcon key="c" />]

/**
 * The page's navigation, drawn as the rail the library itself draws.
 *
 * The one borrowed motif on the page, and it earns its place: it is what the product IS. Every
 * other flourish was cut so this one reads.
 */
function SideRail() {
  const [here, setHere] = useState<string>('top')
  const [lang, setLang] = useLang()
  const words = COPY[lang]
  const sections = SECTION_IDS.map((id, index) => ({
    id,
    label: words.nav[id === 'top' ? 'overview' : id],
    icon: SECTION_ICONS[index],
  }))

  useEffect(() => {
    const spotted = new IntersectionObserver(
      entries => {
        const seen = entries.filter(entry => entry.isIntersecting)
        if (seen[0]) setHere(seen[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const id of SECTION_IDS) {
      const node = document.getElementById(id)
      if (node) spotted.observe(node)
    }
    return () => spotted.disconnect()
  }, [])

  return (
    <nav className="railnav" aria-label="Sections">
      <span className="railnav__mark" aria-hidden="true" />
      {sections.map(section => (
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

      {/* At the foot of the rail, where a preference belongs rather than in the reading flow.
          A select rather than fifteen buttons: a column of two-letter codes is a puzzle, and a
          native control is the one thing every platform already knows how to open. */}
      <label className="railnav__langs">
        <span className="sr-only">{words.langLabel}</span>
        <select
          className="railnav__select"
          value={lang}
          onChange={event => setLang(event.target.value as Lang)}
        >
          {LANGS.map(one => (
            <option key={one} value={one} lang={one}>
              {LANG_NAMES[one]}
            </option>
          ))}
        </select>
      </label>
    </nav>
  )
}

const INSTALL = 'pnpm add @pasquelin/panels'

function Hero() {
  const [copied, setCopied] = useState(false)
  const [lang] = useLang()
  const words = COPY[lang].hero
  const [before, accent, after] = words.title

  return (
    <header className="hero" id="top">
      <p className="hero__eyebrow">{words.eyebrow}</p>
      <h1 className="hero__title">
        {before}
        <br />
        <em>{accent}</em> {after}
      </h1>
      <p className="hero__lead">{words.lead}</p>

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
          <span className="install__state">{copied ? words.copied : words.copy}</span>
        </button>
        <a className="link" href="#examples">
          {words.seeExamples}
        </a>
      </div>

      <figure className="stage">
        <LiveChassis />
        <figcaption className="stage__caption">{words.caption}</figcaption>
      </figure>
    </header>
  )
}

type DemoId = 'files' | 'search' | 'outline' | 'chat' | 'console'

/** The hero is a real chassis, with real state — not a picture of one. */
function LiveChassis() {
  const [lang] = useLang()
  const words = COPY[lang].demo

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
  const [lang] = useLang()
  const words = COPY[lang].examples

  return (
    <section className="section" id="examples">
      <h2 className="section__title">{words.title}</h2>
      <p className="section__lead">{words.lead}</p>

      <div className="cards">
        {EXAMPLE_IDS.map((id, index) => {
          const example = { id, ...COPY[lang].cards[index]!, code: CODE[id] }
          return (
            <article key={example.id} className="card">
              <header className="card__head">
                <h3 className="card__title">{example.title}</h3>
                <p className="card__what">{example.what}</p>
              </header>

              <Code source={example.code} />

              <p className="card__tip">
                <strong>{words.tip}</strong> {example.tip}
              </p>

              {/* The language rides along, so an example opens in the one the reader chose. */}
              <a className="card__open" href={`./${example.id}/index.html?lang=${lang}`}>
                {words.open(example.title)} <span aria-hidden="true">→</span>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Api() {
  const [lang] = useLang()
  const words = COPY[lang].api

  return (
    <section className="section" id="api">
      <h2 className="section__title">{words.title}</h2>
      <p className="section__lead">{words.lead}</p>

      <dl className="api">
        {COPY[lang].api5.map((entry, index) => (
          <div className="api__row" key={entry.name}>
            <dt className="api__name">{entry.name}</dt>
            <dd className="api__body">
              <p>{entry.body}</p>
              <Code source={Object.values(API_CODE)[index]!} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const REPO = 'https://github.com/pasquelin/panels'

function Foot() {
  const [lang] = useLang()
  const words = COPY[lang].foot

  return (
    <footer className="foot">
      <div className="foot__links">
        {/* Both languages, always offered — the reader's own first. A page that only links the
            documentation it guessed you wanted hides the other half of it. */}
        <a className="link" href={`${REPO}/blob/main/docs/fr/README.md`} hrefLang="fr">
          {words.docs} <span aria-hidden="true">🇫🇷</span>
        </a>
        <a className="link" href={`${REPO}/blob/main/docs/en/README.md`} hrefLang="en">
          {words.docs} <span aria-hidden="true">🇬🇧</span>
        </a>
        <a className="link" href={`${REPO}/blob/main/docs/ARCHITECTURE.md`}>
          {words.architecture}
        </a>
        <a className="link" href={REPO}>
          {words.source}
        </a>
        <a className="link" href="https://www.npmjs.com/package/@pasquelin/panels">
          npm
        </a>
      </div>
      <p className="foot__note">{words.note}</p>
    </footer>
  )
}
