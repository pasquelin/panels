import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../core/persistence'
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
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Panels<Id> storage={memoryStorage()} storageKey="geometry">
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
