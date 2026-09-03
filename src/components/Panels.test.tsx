import { useEffect } from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

/**
 * jsdom implements no `elementFromPoint`, so a drag has to be told what it is over.
 *
 * 🛑 Removed again after every test: defined and left behind, it answered the same rail half for
 * every later drag in the file, whatever the pointer was actually on.
 */
function pointingAt(selector: string): void {
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => document.querySelector(selector),
  })
}

/** A chassis with moving panels on, and its own store so a test can read the placements. */
function Draggable({
  store = createPanelsStore<Id>(),
}: {
  store?: ReturnType<typeof createPanelsStore<Id>>
}) {
  return (
    <Panels<Id> store={store} storage={null} draggablePanels>
      <Panel<Id> id="files" zone="left" title="Files">
        <p>file list</p>
      </Panel>
      <Panel<Id> id="chat" zone="right" title="Chat">
        <p>conversation</p>
      </Panel>
    </Panels>
  )
}

describe('Panels', () => {
  afterEach(() => void Reflect.deleteProperty(document, 'elementFromPoint'))

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

  it('does not add drag wrappers until moving panels is enabled', () => {
    render(<Chassis />)

    expect(screen.getByRole('button', { name: 'Files' }).closest('[data-pnl-panel]')).toBeNull()
  })

  it('moves a rail button to an empty half with a pointer ghost', () => {
    const store = createPanelsStore<Id>()
    render(<Draggable store={store} />)
    const wrapper = screen
      .getByRole('button', { name: 'Files' })
      .closest<HTMLElement>('[data-pnl-panel]')
    expect(wrapper).not.toBeNull()
    pointingAt('[data-pnl-zone="right"][data-pnl-slot="secondary"]')

    fireEvent.pointerDown(wrapper!, {
      pointerId: 1,
      button: 0,
      isPrimary: true,
      clientX: 10,
      clientY: 10,
    })
    fireEvent.pointerMove(wrapper!, { pointerId: 1, clientX: 80, clientY: 80 })
    fireEvent.pointerMove(wrapper!, { pointerId: 1, clientX: 81, clientY: 81 })
    expect(document.querySelector('.pnl-rail-drag__ghost')).toBeInTheDocument()
    expect(document.querySelector('.pnl-rail-drag__placeholder')).toBeInTheDocument()
    fireEvent.pointerUp(wrapper!, { pointerId: 1, clientX: 80, clientY: 80 })

    expect(store.getState().placements.default?.byId.files).toEqual({
      zone: 'right',
      slot: 'secondary',
    })
  })

  it('keeps the panels mounted when moving them is turned on', () => {
    // 🛑 The defect this exists for: the drag provider was two components — one on, the bare
    // children off — so the element type changed with the prop and React unmounted the whole
    // middle. A project with an "arrange the layout" button lost every panel's scroll and focus.
    let mounted = 0
    function Counted() {
      useEffect(() => {
        mounted += 1
      }, [])
      return <p>file list</p>
    }
    const chassis = (draggable: boolean) => (
      <Panels<Id> storage={null} draggablePanels={draggable}>
        <Panel<Id> id="files" zone="left" title="Files">
          <Counted />
        </Panel>
      </Panels>
    )

    const { rerender } = render(chassis(false))
    expect(mounted).toBe(1)

    rerender(chassis(true))
    expect(mounted).toBe(1)
  })

  it('leaves the pointer uncaptured until a press becomes a drag', () => {
    // 🛑 The defect this exists for: captured on `pointerdown`, the wrapper had `pointerup`
    // retargeted onto it, so the browser fired `click` at the common ancestor of down and up —
    // the wrapper, never the button inside it. Every rail click was swallowed, and a closed panel
    // could not be opened at all. jsdom dispatches `click` regardless, so WHEN the capture is
    // taken is the only part of this a test can see.
    const captured = vi.spyOn(Element.prototype, 'setPointerCapture').mockImplementation(() => {})
    render(<Draggable />)
    const wrapper = screen
      .getByRole('button', { name: 'Files' })
      .closest<HTMLElement>('[data-pnl-panel]')!
    pointingAt('[data-pnl-zone="right"][data-pnl-slot="secondary"]')

    fireEvent.pointerDown(wrapper, {
      pointerId: 1,
      button: 0,
      isPrimary: true,
      clientX: 10,
      clientY: 10,
    })
    expect(captured).not.toHaveBeenCalled()

    fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 80, clientY: 80 })
    expect(captured).toHaveBeenCalledWith(1)
    captured.mockRestore()
  })

  it('still toggles a panel on a plain click when panels can be dragged', async () => {
    const user = userEvent.setup()
    render(<Draggable />)

    await user.click(screen.getByRole('button', { name: 'Chat' }))

    expect(screen.queryByText('conversation')).not.toBeInTheDocument()
  })

  it('finds the nearest half when the pointer is in the rail’s empty space', () => {
    const store = createPanelsStore<Id>()
    render(<Draggable store={store} />)
    const wrapper = screen
      .getByRole('button', { name: 'Files' })
      .closest<HTMLElement>('[data-pnl-panel]')!
    // 🛑 The RAIL, not a drop zone. A half is exactly as tall as the icons standing in it, so
    // most of a rail belongs to none of them: aiming below the last icon offered nothing, and
    // the only way to reach the place under a button was to hover the button itself.
    pointingAt('.pnl-rail--right')

    fireEvent.pointerDown(wrapper, {
      pointerId: 1,
      button: 0,
      isPrimary: true,
      clientX: 10,
      clientY: 10,
    })
    fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 80, clientY: 80 })
    fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 81, clientY: 81 })
    fireEvent.pointerUp(wrapper, { pointerId: 1, clientX: 81, clientY: 81 })

    expect(store.getState().placements.default?.byId.files).toEqual({
      zone: 'right',
      slot: 'primary',
    })
  })

  it('offers one place to land in a zone that holds nothing, and two where it holds something', () => {
    render(<Draggable />)
    const wrapper = screen
      .getByRole('button', { name: 'Files' })
      .closest<HTMLElement>('[data-pnl-panel]')!
    pointingAt('[data-pnl-zone="right"][data-pnl-slot="secondary"]')

    fireEvent.pointerDown(wrapper, {
      pointerId: 1,
      button: 0,
      isPrimary: true,
      clientX: 10,
      clientY: 10,
    })
    fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 80, clientY: 80 })

    // 🛑 `bottomLeft` holds nothing: above and below are the same landing there, and two squares
    // for one place — under a separator cutting a zone with nothing to cut — reads as neither.
    expect(document.querySelectorAll('[data-pnl-drop][data-pnl-zone="bottomLeft"]')).toHaveLength(1)
    // `right` holds a panel, so its second half is a destination of its own.
    expect(document.querySelectorAll('[data-pnl-drop][data-pnl-zone="right"]')).toHaveLength(2)
    // 🛑 And `top` is carried by no rail at all: a band lying across the width has no edge, and
    // put in the left rail its squares read as more of the left column — a drop there sent the
    // panel across the top of the window.
    expect(document.querySelectorAll('[data-pnl-drop][data-pnl-zone="top"]')).toHaveLength(0)
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

  /**
   * 🛑 `defaultOpen` on the view the chassis LANDS on. That one is reached by `setView`, which
   * opens what the store's `defaults` name — and those were only written by `settle`, running
   * after it. A project's very first view opened whatever happened to be declared, and settles once.
   */
  it('honours `defaultOpen` on the first view it lands on', () => {
    const store = createPanelsStore<Id>()

    render(
      <Panels<Id>
        store={store}
        storage={null}
        view="edit"
        defaultOpen={{ right: { primary: null } }}
      >
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
      </Panels>,
    )

    // Nothing is declared for the right column, so only `defaultOpen` can have opened it.
    expect(store.getState().views.edit?.right).toEqual({ primary: null })
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

describe('persistence', () => {
  afterEach(() => vi.useRealTimers())

  function One({
    store,
    storage,
  }: {
    store: ReturnType<typeof createPanelsStore<Id>>
    storage: ReturnType<typeof memoryStorage>
  }) {
    return (
      <Panels<Id> store={store} storage={storage} storageKey="test">
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
      </Panels>
    )
  }

  /** The widths the file holds right now. */
  const sizesIn = (storage: ReturnType<typeof memoryStorage>) =>
    (JSON.parse(storage.read('test') ?? '{}') as { lengths?: { sizes?: Record<string, number> } })
      .lengths?.sizes

  it('writes once a drag has settled, not on every frame', () => {
    vi.useFakeTimers()
    const storage = memoryStorage()
    const write = vi.spyOn(storage, 'write')
    const store = createPanelsStore<Id>()
    render(<One store={store} storage={storage} />)
    act(() => {
      vi.runAllTimers()
    })
    write.mockClear()

    // Sixty frames of a drag, as a pointer delivers them.
    act(() => {
      for (let step = 1; step <= 60; step++) store.getState().resize('left', 300 + step, 1600)
    })
    expect(write).not.toHaveBeenCalled()

    act(() => {
      vi.runAllTimers()
    })
    expect(write).toHaveBeenCalledTimes(1)
    expect(sizesIn(storage)?.left).toBe(360)
  })

  it('flushes what is pending when the chassis unmounts', () => {
    const storage = memoryStorage()
    const store = createPanelsStore<Id>()
    const view = render(<One store={store} storage={storage} />)

    act(() => store.getState().resize('left', 420, 1600))
    view.unmount()

    expect(sizesIn(storage)?.left).toBe(420)
  })

  it('flushes when the page is being hidden — a window closing does not wait', () => {
    const storage = memoryStorage()
    const store = createPanelsStore<Id>()
    render(<One store={store} storage={storage} />)

    act(() => store.getState().resize('left', 420, 1600))
    act(() => {
      window.dispatchEvent(new Event('pagehide'))
    })

    expect(sizesIn(storage)?.left).toBe(420)
  })
})
