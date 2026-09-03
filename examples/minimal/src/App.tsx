import { useState } from 'react'
import { IconButton, Panel, Panels, usePanels } from '@pasquelin/panels'
import { ChatIcon, FilesIcon, PlusIcon, SearchIcon, TerminalIcon, TuneIcon } from '../../src/icons'
import { ExampleChrome } from '../../src/ExampleChrome'

/** The ids this application declares. The union is what makes `reveal('chatt')` fail to compile. */
type PanelId = 'files' | 'search' | 'chat' | 'inspector' | 'terminal'

export function App() {
  return (
    <ExampleChrome example="minimal">
      <Chassis />
    </ExampleChrome>
  )
}

function Chassis() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  return (
    <Panels<PanelId>
      storageKey="panels-example:minimal"
      theme={theme}
      draggablePanels
      railHeader={<IconButton label="New" icon={<PlusIcon />} acts className="pnl-rail__button" />}
      header={<Header theme={theme} onTheme={setTheme} />}
      footer={<Footer />}
    >
      <Panel<PanelId> id="files" zone="left" slot="primary" title="Files" icon={<FilesIcon />}>
        <List items={['src/', 'index.ts', 'App.tsx', 'styles.css', 'README.md']} />
      </Panel>

      <Panel<PanelId> id="search" zone="left" slot="primary" title="Search" icon={<SearchIcon />}>
        <p style={{ padding: 12, color: 'var(--pnl-muted)' }}>
          Two panels share this half — the rail switches between them. Drag either icon into another
          half to move the panel there.
        </p>
      </Panel>

      <Panel<PanelId>
        id="inspector"
        zone="left"
        slot="secondary"
        title="Outline"
        icon={<TuneIcon />}
      >
        <List items={['App', '  Header', '  Panels', '  Footer']} />
      </Panel>

      <Panel<PanelId>
        id="chat"
        zone="right"
        slot="primary"
        title="Assistant"
        icon={<ChatIcon />}
        opens={380}
        actions={<IconButton label="Clear" acts icon={<PlusIcon />} />}
      >
        <p style={{ padding: 12, color: 'var(--pnl-muted)' }}>
          This one asks to open at 380 rather than the column&rsquo;s own 260.
        </p>
      </Panel>

      <Panel<PanelId>
        id="terminal"
        zone="bottomRight"
        slot="primary"
        title="Terminal"
        icon={<TerminalIcon />}
      >
        <pre style={{ margin: 0, padding: 12, color: 'var(--pnl-muted)' }}>$ pnpm dev</pre>
      </Panel>

      <Panels.Center>
        <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 24 }}>
          <div style={{ maxWidth: 460, textAlign: 'center', color: 'var(--pnl-muted)' }}>
            <h1 style={{ color: 'var(--pnl-text)', fontSize: 20 }}>The centre is yours</h1>
            <p>
              A router outlet, a canvas, a map, document tabs. Drag the gutters between the surfaces
              to resize, click a rail icon to open or close a panel, drag one into another half to
              move it, and reload — the layout comes back.
            </p>
          </div>
        </div>
      </Panels.Center>
    </Panels>
  )
}

function Header({ theme, onTheme }: { theme: string; onTheme: (next: 'dark' | 'light') => void }) {
  // A header that is entirely the project's: it drives the panels through the hook, and knows
  // nothing about zones or slots.
  const { panels, isShown, toggle } = usePanels<PanelId>()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 16px',
        fontSize: 13,
      }}
    >
      <strong style={{ marginRight: 12 }}>minimal</strong>

      {panels.map(panel => {
        const shown = isShown(panel.id)
        return (
          <button
            key={panel.id}
            type="button"
            aria-pressed={shown}
            onClick={() => toggle(panel.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              // Open is a STATE, not an action: it gets the quiet fill, never the accent — a row
              // of solid blue says everything is being actioned at once, which is nothing.
              background: shown ? 'var(--pnl-elevated)' : 'transparent',
              color: shown ? 'var(--pnl-text)' : 'var(--pnl-muted)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                // The one dot of accent: it marks WHICH are open without painting the whole row.
                background: shown ? 'var(--pnl-accent)' : 'transparent',
                outline: shown ? 'none' : '1px solid var(--pnl-border)',
                outlineOffset: -1,
              }}
            />
            {panel.title}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => onTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{
          marginLeft: 'auto',
          border: 'none',
          borderRadius: 4,
          padding: '4px 10px',
          cursor: 'pointer',
          background: 'transparent',
          color: 'var(--pnl-muted)',
        }}
      >
        {theme === 'dark' ? 'Light theme' : 'Dark theme'}
      </button>
    </header>
  )
}

function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        gap: 12,
        padding: '6px 14px',
        fontSize: 11,
        color: 'var(--pnl-muted)',
      }}
    >
      <span>@pasquelin/panels</span>
      <span style={{ marginLeft: 'auto' }}>Tab to a gutter, then use the arrow keys</span>
    </footer>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, padding: '8px 0', listStyle: 'none' }}>
      {items.map(item => (
        <li
          key={item}
          style={{ padding: '4px 12px', whiteSpace: 'pre', color: 'var(--pnl-muted)' }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
