import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../core/persistence'
import { Panel } from './Panel'
import { Panels } from './Panels'
import { Center } from './Center'

type Id = 'files' | 'search' | 'outline' | 'chat'

function Chassis({ storage = memoryStorage() }: { storage?: ReturnType<typeof memoryStorage> }) {
  return (
    <Panels<Id> storage={storage} storageKey="test">
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
      <Center>
        <p>the middle</p>
      </Center>
    </Panels>
  )
}

describe('Panels', () => {
  it('draws the centre and each half’s first panel', () => {
    render(<Chassis />)

    expect(screen.getByText('the middle')).toBeInTheDocument()
    expect(screen.getByText('file list')).toBeInTheDocument()
    expect(screen.getByText('outline tree')).toBeInTheDocument()
    expect(screen.getByText('conversation')).toBeInTheDocument()
  })

  it('leaves the second panel of a half closed until it is asked for', () => {
    render(<Chassis />)
    expect(screen.queryByText('search form')).not.toBeInTheDocument()
  })

  it('puts every declared panel in a rail, open or not', () => {
    render(<Chassis />)

    for (const title of ['Files', 'Search', 'Outline', 'Chat']) {
      expect(screen.getByRole('button', { name: title })).toBeInTheDocument()
    }
  })

  it('swaps panels within a half when the rail is clicked', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByText('search form')).toBeInTheDocument()
    expect(screen.queryByText('file list')).not.toBeInTheDocument()
  })

  it('closes the panel when its own rail icon is clicked again', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    await user.click(screen.getByRole('button', { name: 'Files' }))
    expect(screen.queryByText('file list')).not.toBeInTheDocument()
  })

  it('announces which panel is up', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    expect(screen.getByRole('button', { name: 'Files' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByRole('button', { name: 'Files' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('closes a panel from its header, and the rail can bring it back', async () => {
    const user = userEvent.setup()
    render(<Chassis />)

    const panel = screen.getByRole('region', { name: 'Files' })
    await user.click(within(panel).getByRole('button', { name: 'Close panel' }))
    expect(screen.queryByText('file list')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Files' }))
    expect(screen.getByText('file list')).toBeInTheDocument()
  })

  it('keeps the arrangement across a remount', async () => {
    const user = userEvent.setup()
    const storage = memoryStorage()

    const first = render(<Chassis storage={storage} />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    first.unmount()

    render(<Chassis storage={storage} />)
    expect(screen.getByText('search form')).toBeInTheDocument()
  })

  it('gives every resize handle an accessible name and an orientation', () => {
    render(<Chassis />)
    const handles = screen.getAllByRole('separator')

    expect(handles.length).toBeGreaterThan(0)
    for (const handle of handles) {
      expect(handle).toHaveAccessibleName()
      expect(handle).toHaveAttribute('aria-orientation')
      expect(handle).toHaveAttribute('tabindex', '0')
    }
  })
})
