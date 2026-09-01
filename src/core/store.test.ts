import { beforeEach, describe, expect, it } from 'vitest'
import { createPanelsStore, shownIn, undraggedSizeOf, type PanelsStore } from './store'
import { DEFAULT_SIZES } from './clamps'
import type { PanelSpec } from './types'

type Id = 'files' | 'search' | 'outline' | 'chat' | 'inspector' | 'terminal'

const SPECS: PanelSpec<Id>[] = [
  { id: 'files', zone: 'left', slot: 'primary', title: 'Files' },
  { id: 'search', zone: 'left', slot: 'primary', title: 'Search' },
  { id: 'outline', zone: 'left', slot: 'secondary', title: 'Outline' },
  { id: 'chat', zone: 'right', slot: 'primary', title: 'Chat', solo: true, opens: 460 },
  { id: 'inspector', zone: 'right', slot: 'secondary', title: 'Inspector' },
  { id: 'terminal', zone: 'bottomRight', slot: 'primary', title: 'Terminal' },
]

function made(): PanelsStore<Id> {
  const store = createPanelsStore<Id>()
  for (const spec of SPECS) store.getState().register(spec)
  return store
}

describe('settle', () => {
  it('opens each half on the panel declared first for it', () => {
    const store = made()
    store.getState().settle()

    expect(store.getState().open).toEqual({
      left: { primary: 'files', secondary: 'outline' },
      right: { primary: 'chat', secondary: 'inspector' },
      bottomRight: { primary: 'terminal' },
    })
  })

  it('runs once — a second call must not undo what the reader has done since', () => {
    const store = made()
    store.getState().settle()
    store.getState().show('search')
    store.getState().settle()

    expect(store.getState().open.left?.primary).toBe('search')
  })

  it('lets the project name the halves it cares about and fills in the rest', () => {
    const store = made()
    store.getState().settle({ left: { primary: 'search' } })

    expect(store.getState().open.left?.primary).toBe('search')
    expect(store.getState().open.left?.secondary).toBe('outline')
  })

  it('never runs when a layout was restored — that arrangement is the reader’s own', () => {
    const store = createPanelsStore<Id>({ initial: { open: { left: { primary: 'search' } } } })
    for (const spec of SPECS) store.getState().register(spec)
    store.getState().settle()

    expect(store.getState().open).toEqual({ left: { primary: 'search' } })
  })
})

describe('show and close', () => {
  let store: PanelsStore<Id>
  beforeEach(() => {
    store = made()
    store.getState().settle()
  })

  it('swaps within a half rather than stacking', () => {
    store.getState().show('search')

    expect(store.getState().open.left).toEqual({ primary: 'search', secondary: 'outline' })
  })

  it('focuses the zone it opened in', () => {
    store.getState().show('terminal')
    expect(store.getState().focusedZone).toBe('bottomRight')
  })

  it('empties only the half it was asked about', () => {
    store.getState().close('left', 'primary')

    expect(store.getState().open.left).toEqual({ secondary: 'outline' })
  })

  it('drops the focus when the zone it named stops drawing', () => {
    store.getState().show('files')
    store.getState().close('left', 'primary')
    store.getState().close('left', 'secondary')

    expect(store.getState().focusedZone).toBeNull()
  })

  it('ignores a panel nobody declared', () => {
    const before = store.getState().open
    store.getState().show('nope' as Id)

    expect(store.getState().open).toBe(before)
  })
})

describe('toggle', () => {
  it('closes what is shown and opens what is not', () => {
    const store = made()
    store.getState().settle()

    store.getState().toggle('files')
    expect(shownIn(store.getState(), 'left').primary).toBeUndefined()

    store.getState().toggle('files')
    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })
})

describe('solo', () => {
  it('takes the zone whole and silences the other half', () => {
    const store = made()
    store.getState().settle()

    // `chat` is declared solo and is what the right column settles on.
    expect(shownIn(store.getState(), 'right')).toEqual({ primary: 'chat' })
  })

  it('puts the other half AWAY rather than closing it, and gives it back', () => {
    const store = made()
    store.getState().settle()
    // The inspector is silenced by the solo chat, and stored all the same.
    store.getState().close('right', 'primary')

    expect(shownIn(store.getState(), 'right').secondary).toBe('inspector')
  })

  it('stashes what the zone held when a solo panel arrives', () => {
    const store = createPanelsStore<Id>({
      initial: { open: { right: { primary: 'inspector', secondary: 'inspector' } } },
    })
    for (const spec of SPECS) store.getState().register(spec)

    store.getState().show('chat')
    expect(store.getState().stashed.right).toBeDefined()

    store.getState().close('right', 'primary')
    expect(store.getState().open.right).toEqual({ primary: 'inspector', secondary: 'inspector' })
  })
})

describe('unregister', () => {
  it('empties the half a removed panel occupied', () => {
    const store = made()
    store.getState().settle()
    store.getState().unregister('files')

    expect(store.getState().open.left?.primary).toBeUndefined()
    expect(store.getState().registry.some(spec => spec.id === 'files')).toBe(false)
  })
})

describe('undraggedSizeOf', () => {
  it('gives the zone its own width when no panel asks for more', () => {
    const store = made()
    store.getState().settle()

    const state = store.getState()
    expect(undraggedSizeOf(state.registry, 'left', shownIn(state, 'left').primary)).toBe(
      DEFAULT_SIZES.left,
    )
  })

  it('honours what the leading panel asks for', () => {
    const store = made()
    store.getState().settle()

    // `chat` asks for 460 against the column's own 260.
    const state = store.getState()
    expect(undraggedSizeOf(state.registry, 'right', shownIn(state, 'right').primary)).toBe(460)
  })
})

describe('resize', () => {
  it('does not write when the value has not moved', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('left', 300, 1600)

    const before = store.getState().lengths
    store.getState().resize('left', 300, 1600)

    expect(store.getState().lengths).toBe(before)
  })

  it('writes the band’s two halves under one key', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('bottomLeft', 300, 900)

    expect(store.getState().lengths.sizes.bottomRight).toBe(300)
  })
})

describe('reset', () => {
  it('clears the arrangement but keeps the declared panels', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('left', 400, 1600)
    store.getState().reset()

    expect(store.getState().open).toEqual({})
    expect(store.getState().lengths.sizes).toEqual({})
    expect(store.getState().registry).toHaveLength(SPECS.length)
  })
})
