import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../core/persistence'
import { createPanelsStore } from '../core/store'
import { IconButton, type IconButtonProps } from './IconButton'
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

  it('keeps each view’s open panels to itself, and its lengths shared', async () => {
    const user = userEvent.setup()
    const storage = memoryStorage()

    function Two({ view }: { view: string }) {
      return (
        <Panels<Id> storage={storage} storageKey="test" view={view}>
          <Panel<Id> id="files" zone="left" title="Files">
            <p>file list</p>
          </Panel>
          <Panel<Id> id="outline" zone="left" slot="secondary" title="Outline">
            <p>outline tree</p>
          </Panel>
        </Panels>
      )
    }

    const view = render(<Two view="edit" />)
    await user.click(screen.getByRole('button', { name: 'Files' }))
    expect(screen.queryByText('file list')).not.toBeInTheDocument()

    // The other view never had that panel closed.
    view.rerender(<Two view="review" />)
    expect(screen.getByText('file list')).toBeInTheDocument()

    // And coming back finds it exactly as it was left.
    view.rerender(<Two view="edit" />)
    expect(screen.queryByText('file list')).not.toBeInTheDocument()
  })

  it('shares the lengths between views: no column changes width on the way', () => {
    const storage = memoryStorage()
    const store = createPanelsStore<Id>()

    function Two({ view }: { view: string }) {
      return (
        <Panels<Id> store={store} storage={storage} storageKey="test" view={view}>
          <Panel<Id> id="files" zone="left" title="Files">
            <p>file list</p>
          </Panel>
        </Panels>
      )
    }

    const view = render(<Two view="edit" />)
    act(() => store.getState().resize('left', 420, 1600))
    view.rerender(<Two view="review" />)

    expect(store.getState().lengths.sizes.left).toBe(420)
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

  it('takes the view back from an imperative setView — the prop is what decides', async () => {
    const user = userEvent.setup()
    // 🛑 Reconciled without a dependency array: with one, this held only when some OTHER prop
    // happened to change identity, so two projects writing the same code got opposite contracts.
    const storage = memoryStorage()
    const store = createPanelsStore<Id>()

    function One() {
      return (
        <Panels<Id> store={store} storage={storage} storageKey="test" view="edit">
          <Panel<Id> id="files" zone="left" title="Files">
            <p>file list</p>
          </Panel>
        </Panels>
      )
    }

    const view = render(<One />)
    // Closed HERE, so the two views differ on screen and the takeover is visible.
    await user.click(screen.getByRole('button', { name: 'Files' }))
    expect(screen.queryByText('file list')).not.toBeInTheDocument()

    act(() => store.getState().setView('sneaky'))
    expect(screen.getByText('file list')).toBeInTheDocument()

    view.rerender(<One />)
    expect(store.getState().view).toBe('edit')
    // The screen, not just the store: it passed while nothing on screen followed the takeover.
    expect(screen.queryByText('file list')).not.toBeInTheDocument()
  })

  it('draws a panel again once the project declares it back', async () => {
    const user = userEvent.setup()
    function Conditional({ offered }: { offered: boolean }) {
      return (
        <Panels<Id> storage={memoryStorage()} storageKey="test">
          <Panel<Id> id="files" zone="left" title="Files">
            <p>file list</p>
          </Panel>
          {offered && (
            <Panel<Id> id="search" zone="left" title="Search">
              <p>search form</p>
            </Panel>
          )}
        </Panels>
      )
    }

    const view = render(<Conditional offered />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByText('search form')).toBeInTheDocument()

    // Withdrawn: the half falls back rather than closing on a panel nobody can reach.
    view.rerender(<Conditional offered={false} />)
    expect(screen.getByText('file list')).toBeInTheDocument()

    // And the choice was never forgotten.
    view.rerender(<Conditional offered />)
    expect(screen.getByText('search form')).toBeInTheDocument()
  })

  it('lets the project draw the buttons itself, rail and close alike', async () => {
    const user = userEvent.setup()
    // What a design system needs and the library must not learn: a tooltip, here stood in for by
    // an attribute the chassis knows nothing about.
    function Tipped({ label, acts, ...rest }: IconButtonProps) {
      return <IconButton {...rest} label={label} acts={acts} data-tip={label} />
    }

    render(
      <Panels<Id> storage={memoryStorage()} storageKey="test" components={{ IconButton: Tipped }}>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
      </Panels>,
    )

    expect(screen.getByRole('button', { name: 'Files' })).toHaveAttribute('data-tip', 'Files')
    const panel = screen.getByRole('region', { name: 'Files' })
    const close = within(panel).getByRole('button', { name: 'Close panel' })
    expect(close).toHaveAttribute('data-tip', 'Close panel')

    // Still a working button, not just a decorated one.
    await user.click(close)
    expect(screen.queryByText('file list')).not.toBeInTheDocument()
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
