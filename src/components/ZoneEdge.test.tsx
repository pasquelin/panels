import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryStorage } from '../core/persistence'
import { createPanelsStore, type PanelsStore } from '../core/store'
import { Center } from './Center'
import { Panel } from './Panel'
import { Panels } from './Panels'

type Id = 'files' | 'outline' | 'chat' | 'terminal' | 'notes'

/**
 * The geometry the frame draws, which no other suite covers: which zones take room, where the
 * handles go, and what a half is given as a length.
 *
 * 🛑 Written when IA Studio migrated onto this library and let its own copies go. They had been
 * the only tests of these rules, and the assumption that "the library covers it" was wrong.
 */
function Frame({ children, store }: { children: React.ReactNode; store?: PanelsStore<Id> }) {
  return (
    <Panels<Id> store={store} storage={memoryStorage()} storageKey="geometry">
      {children}
      <Center>
        <p>the middle</p>
      </Center>
    </Panels>
  )
}

/** A zone's own handle, plus the divider a zone cut in two puts inside itself. */
const handles = () => screen.queryAllByRole('separator')

/** The smallest box holding both — what says which of them the frame groups together. */
function boxOf(one: HTMLElement, other: HTMLElement): HTMLElement | null {
  for (let node = one.parentElement; node; node = node.parentElement) {
    if (node.contains(other)) return node
  }
  return null
}

describe('a zone drawing nothing', () => {
  it('takes neither room nor a handle', () => {
    render(
      <Frame>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
      </Frame>,
    )

    // One zone open, so one handle: its own. No `top`, no band, no right column.
    expect(handles()).toHaveLength(1)
  })
})

describe('a column cut in two', () => {
  it('keeps both halves and the divider between them', () => {
    render(
      <Frame>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="outline" zone="left" slot="secondary" title="Outline">
          <p>outline tree</p>
        </Panel>
      </Frame>,
    )

    expect(screen.getByText('file list')).toBeInTheDocument()
    expect(screen.getByText('outline tree')).toBeInTheDocument()
    // The zone's own handle, and the one between its halves.
    expect(handles()).toHaveLength(2)
  })

  it('draws no divider where only one half is open', () => {
    render(
      <Frame>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="chat" zone="right" title="Chat">
          <p>conversation</p>
        </Panel>
      </Frame>,
    )

    // Two zones, one handle each, and nothing inside either.
    expect(handles()).toHaveLength(2)
  })

  it('divides the column evenly until a divider has been dragged', () => {
    render(
      <Frame>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="outline" zone="left" slot="secondary" title="Outline">
          <p>outline tree</p>
        </Panel>
      </Frame>,
    )

    // No length of its own: both halves are flex, and CSS parts the column.
    expect(screen.getByRole('region', { name: 'Outline' }).style.flexBasis).toBe('')
  })
})

describe('the bottom band', () => {
  it('runs the opposite column past it, and its own down to it', () => {
    render(
      <Frame>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="terminal" zone="bottomRight" title="Terminal">
          <p>terminal</p>
        </Panel>
      </Frame>,
    )

    const left = screen.getByRole('region', { name: 'Files' })
    const band = screen.getByRole('region', { name: 'Terminal' })
    const centre = screen.getByText('the middle')

    // 🛑 The left column is NOT in the box the band shares with the centre: it runs to the foot
    // of the frame, and the band starts where it ends.
    expect(boxOf(band, centre)?.contains(left)).toBe(false)
  })

  it('is one surface and one handle when a single half draws', () => {
    render(
      <Frame>
        <Panel<Id> id="terminal" zone="bottomRight" title="Terminal">
          <p>terminal</p>
        </Panel>
      </Frame>,
    )

    // No divider inside the strip: the other half draws nothing to be parted from.
    expect(handles()).toHaveLength(1)
  })

  it('parts its two halves with a handle of their own', () => {
    render(
      <Frame>
        <Panel<Id> id="notes" zone="bottomLeft" title="Notes">
          <p>notes</p>
        </Panel>
        <Panel<Id> id="terminal" zone="bottomRight" title="Terminal">
          <p>terminal</p>
        </Panel>
      </Frame>,
    )

    // One handle per half, plus the one dividing the strip in two.
    expect(handles()).toHaveLength(3)
  })
})

/**
 * jsdom lays nothing out: every box answers zero. These give the frame the geometry a browser
 * would, one class at a time, so a drag can be measured against it.
 */
function laidOut(widths: Record<string, number>, heights: Record<string, number>): void {
  const of = (record: Record<string, number>) =>
    function (this: Element): number {
      for (const [name, value] of Object.entries(record)) {
        if (this.classList.contains(name)) return value
      }
      return 0
    }
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(of(widths))
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(of(heights))
}

function drag(handle: HTMLElement, from: [number, number], to: [number, number]): void {
  fireEvent.pointerDown(handle, {
    pointerId: 1,
    button: 0,
    isPrimary: true,
    clientX: from[0],
    clientY: from[1],
  })
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: to[0], clientY: to[1] })
  fireEvent.pointerUp(handle, { pointerId: 1 })
}

describe('a drag, measured', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts a column’s divider from where CSS put it, not from zero', () => {
    // A column 800 tall, its two halves 400 each — nobody has dragged the divider yet.
    laidOut({ 'pnl-columns': 1304 }, { 'pnl-columns': 800, 'pnl-zone': 800, 'pnl-surface': 400 })
    const store = createPanelsStore<Id>()
    render(
      <Frame store={store}>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="outline" zone="left" slot="secondary" title="Outline">
          <p>outline tree</p>
        </Panel>
      </Frame>,
    )

    // 🛑 Five pixels, and the second half went from 400 to 100: the handle had started from
    // zero, and the clamp floored it to `MIN_SPLIT`.
    drag(screen.getByRole('separator', { name: 'Resize the two panels' }), [0, 400], [0, 405])

    expect(store.getState().lengths.splits.left).toBe(395)
  })

  it('starts the band’s divider from the half CSS drew', () => {
    laidOut(
      { 'pnl-columns': 1304, 'pnl-band': 1000, 'pnl-band__half': 500 },
      { 'pnl-columns': 800 },
    )
    const store = createPanelsStore<Id>()
    render(
      <Frame store={store}>
        <Panel<Id> id="notes" zone="bottomLeft" title="Notes">
          <p>notes</p>
        </Panel>
        <Panel<Id> id="terminal" zone="bottomRight" title="Terminal">
          <p>terminal</p>
        </Panel>
      </Frame>,
    )

    drag(screen.getByRole('separator', { name: 'Resize the bottom panels' }), [500, 0], [505, 0])

    expect(store.getState().lengths.bandSplit).toBe(505)
  })

  it('bounds a column against the whole columns box, not the row the band left it in', () => {
    // Only the band’s right half draws, so the left column runs to the foot and the right one
    // sits in the inner row — 978 wide, the columns box less the left column and its handle.
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(function (
      this: Element,
    ): number {
      if (this.classList.contains('pnl-columns')) return 1304
      if (!this.classList.contains('pnl-row')) return 0
      return this.parentElement?.classList.contains('pnl-stack') ? 978 : 1304
    })
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(800)
    const store = createPanelsStore<Id>()
    render(
      <Frame store={store}>
        <Panel<Id> id="files" zone="left" title="Files">
          <p>file list</p>
        </Panel>
        <Panel<Id> id="chat" zone="right" title="Chat">
          <p>conversation</p>
        </Panel>
        <Panel<Id> id="terminal" zone="bottomRight" title="Terminal">
          <p>terminal</p>
        </Panel>
      </Frame>,
    )

    // The right column puts its handle FIRST, and the box after it is the zone itself.
    const zone = screen.getByRole('region', { name: 'Chat' }).closest('.pnl-zone')
    const handle = screen
      .getAllByRole('separator', { name: 'Resize panel area' })
      .find(node => node.nextElementSibling === zone)
    if (!handle) throw new Error('no handle before the right column')

    drag(handle, [900, 0], [-1100, 0])

    // 🛑 1304 less the left column’s 320 and the centre’s floor of 240: 744. Measured against
    // the inner row, the left column was taken off twice and the drag stopped at 418.
    expect(store.getState().lengths.sizes.right).toBe(744)
  })
})
