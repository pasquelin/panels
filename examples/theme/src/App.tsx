import { useState } from 'react'
import { Panel, Panels, Separator, usePanels } from '@pasquelin/panels'
import { AlertIcon, ChatIcon, LayersIcon, PaletteIcon, TuneIcon } from '../../src/icons'
import { ExampleChrome } from '../../src/ExampleChrome'
import './theme.css'

type PanelId = 'layers' | 'inspect' | 'notes' | 'alerts'

/**
 * Four palettes, four rows of CSS. Nothing here imports anything the library did not already
 * export — the whole of the repaint is custom properties on the chassis root.
 */
const SKINS = [
  { id: 'brass', name: 'Brass', hint: 'Warm greys, amber accent — the showcase’s own.' },
  { id: 'paper', name: 'Paper', hint: 'Light theme, panels lighter than the chassis.' },
  { id: 'forest', name: 'Forest', hint: 'The accent inherited from a host that is green.' },
  { id: 'plum', name: 'Plum', hint: 'Larger radius, wider rail, roomier header.' },
] as const

type SkinId = (typeof SKINS)[number]['id']

function Skins({ skin, onSkin }: { skin: SkinId; onSkin: (next: SkinId) => void }) {
  return (
    <div className="skins">
      {SKINS.map(one => (
        <button
          key={one.id}
          type="button"
          aria-pressed={skin === one.id}
          className={`skin skin--${one.id}${skin === one.id ? ' skin--on' : ''}`}
          onClick={() => onSkin(one.id)}
        >
          <span className="skin__chips" aria-hidden="true">
            <i className="skin__chip skin__chip--chassis" />
            <i className="skin__chip skin__chip--panel" />
            <i className="skin__chip skin__chip--accent" />
          </span>
          <span className="skin__name">{one.name}</span>
          <span className="skin__hint">{one.hint}</span>
        </button>
      ))}
    </div>
  )
}

function Header({ skin, onSkin }: { skin: SkinId; onSkin: (next: SkinId) => void }) {
  const { panels, isShown, toggle } = usePanels<PanelId>()

  return (
    <header className="bar">
      <Skins skin={skin} onSkin={onSkin} />
      <Separator />
      {panels.map(panel => (
        <button
          key={panel.id}
          type="button"
          className={`bar__toggle${isShown(panel.id) ? ' bar__toggle--on' : ''}`}
          aria-pressed={isShown(panel.id)}
          onClick={() => toggle(panel.id)}
        >
          {panel.title}
        </button>
      ))}
    </header>
  )
}

export function App() {
  const [skin, setSkin] = useState<SkinId>('brass')

  return (
    <ExampleChrome example="theme">
      <Panels<PanelId>
        storageKey="panels-example:theme"
        className={`skinned skinned--${skin}`}
        header={<Header skin={skin} onSkin={setSkin} />}
      >
        <Panel<PanelId> id="layers" zone="left" title="Layers" icon={<LayersIcon />}>
          <div className="rows">
            {['Background', 'Terrain', 'Roads', 'Labels', 'Markers'].map(name => (
              <span key={name} className="row">
                {name}
              </span>
            ))}
          </div>
        </Panel>

        <Panel<PanelId>
          id="inspect"
          zone="left"
          slot="secondary"
          title="Inspector"
          icon={<TuneIcon />}
        >
          <dl className="facts">
            <dt>Radius</dt>
            <dd>--pnl-radius</dd>
            <dt>Rail</dt>
            <dd>--pnl-rail</dd>
            <dt>Accent</dt>
            <dd>--pnl-accent</dd>
          </dl>
        </Panel>

        <Panel<PanelId> id="notes" zone="right" title="How" icon={<ChatIcon />} opens={340}>
          <p className="note">
            The chassis reads its palette from custom properties on its root. Set them on any
            ancestor and it follows — which is how it takes on a host application’s brand rather
            than imposing one.
          </p>
        </Panel>

        <Panel<PanelId> id="alerts" zone="bottomRight" title="Console" icon={<AlertIcon />}>
          <p className="note">Switch palettes above. Nothing re-mounts; only the tokens change.</p>
        </Panel>

        <Panels.Center>
          <div className="centre">
            <PaletteIcon />
            <h1>Four palettes, four rules</h1>
            <p>
              No component was replaced to get here. If you need to go further, every piece — rail,
              header, handle — is exported and replaceable one at a time.
            </p>
          </div>
        </Panels.Center>
      </Panels>
    </ExampleChrome>
  )
}
