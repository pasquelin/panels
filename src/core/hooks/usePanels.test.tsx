import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Panel } from '../../components/Panel'
import { Panels } from '../../components/Panels'
import { memoryStorage } from '../persistence'
import { usePanels } from './usePanels'

type Id = 'files' | 'search' | 'outline' | 'chat'

/**
 * A header of the project's own — outside the chassis, driving it through the hook alone. This
 * is the shape every consumer writes, so it is the shape the test has to take.
 */
function Header() {
  const { panels, isShown, toggle } = usePanels<Id>()

  return (
    <header>
      {panels.map(panel => (
        <button
          key={panel.id}
          type="button"
          aria-pressed={isShown(panel.id)}
          onClick={() => toggle(panel.id)}
        >
          go {panel.title}
        </button>
      ))}
    </header>
  )
}

function Chassis() {
  return (
    <Panels<Id> storage={memoryStorage()} header={<Header />}>
      <Panel<Id> id="files" zone="left" title="Files">
        <p>file list</p>
      </Panel>
      <Panel<Id> id="search" zone="left" title="Search">
        <p>search form</p>
      </Panel>
      <Panel<Id> id="outline" zone="left" slot="secondary" title="Outline">
        <p>outline tree</p>
      </Panel>
      <Panel<Id> id="chat" zone="right" title="Chat">
        <p>conversation</p>
      </Panel>
    </Panels>
  )
}

const pressed = (title: string) =>
  screen.getByRole('button', { name: `go ${title}` }).getAttribute('aria-pressed')

describe('usePanels, from a component outside the chassis', () => {
  it('reports the arrangement it starts on', () => {
    render(<Chassis />)

    expect(pressed('Files')).toBe('true')
    expect(pressed('Outline')).toBe('true')
    expect(pressed('Chat')).toBe('true')
    expect(pressed('Search')).toBe('false')
  })

  it('follows a panel opened from the rail', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    // The rail's own button, not the header's: the header must follow a change it did not make.
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(pressed('Search')).toBe('true')
    expect(pressed('Files')).toBe('false')
  })

  it('follows a panel closed from its header', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    await user.click(screen.getAllByRole('button', { name: 'Close panel' })[0]!)
    expect(pressed('Files')).toBe('false')
  })

  it('drives the chassis: toggling from outside opens and closes the panel', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    await user.click(screen.getByRole('button', { name: 'go Search' }))
    expect(screen.getByText('search form')).toBeInTheDocument()
    expect(pressed('Search')).toBe('true')

    await user.click(screen.getByRole('button', { name: 'go Search' }))
    expect(screen.queryByText('search form')).not.toBeInTheDocument()
    expect(pressed('Search')).toBe('false')
  })

  it('never reports a panel silenced by a solo one as shown', async () => {
    const user = userEvent.setup()
    render(
      <Panels<Id> storage={memoryStorage()} header={<Header />}>
        <Panel<Id> id="chat" zone="right" title="Chat" solo>
          <p>conversation</p>
        </Panel>
        <Panel<Id> id="outline" zone="right" slot="secondary" title="Outline">
          <p>outline tree</p>
        </Panel>
      </Panels>,
    )

    expect(pressed('Chat')).toBe('true')
    // Silenced by the solo panel: put away, not closed — and NOT shown.
    expect(pressed('Outline')).toBe('false')

    await user.click(screen.getByRole('button', { name: 'go Chat' }))
    expect(pressed('Outline')).toBe('true')
  })
})
