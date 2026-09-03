import { beforeEach, describe, expect, it } from 'vitest'
import {
  createPanelsStore,
  EMPTY_LENGTHS,
  openOf,
  shownIn,
  shownSpecsIn,
  undraggedSizeOf,
  zoneDraws,
  zoneTakesRoom,
  type PanelsStore,
  type CreatePanelsStoreOptions,
} from './store'
import { DEFAULT_SIZES } from './clamps'
import { DEFAULT_VIEW, type PanelSpec } from './types'

type Id = 'files' | 'search' | 'outline' | 'chat' | 'preview' | 'inspector' | 'terminal' | 'notes'

const SPECS: PanelSpec<Id>[] = [
  { id: 'files', zone: 'left', slot: 'primary', title: 'Files' },
  { id: 'search', zone: 'left', slot: 'primary', title: 'Search' },
  { id: 'outline', zone: 'left', slot: 'secondary', title: 'Outline' },
  { id: 'chat', zone: 'right', slot: 'primary', title: 'Chat', solo: true, opens: 460 },
  { id: 'preview', zone: 'right', slot: 'primary', title: 'Preview' },
  { id: 'inspector', zone: 'right', slot: 'secondary', title: 'Inspector' },
  { id: 'terminal', zone: 'bottomRight', slot: 'primary', title: 'Terminal' },
]

/** A store with the decor declared, as `<Panels>` declares it — options passed straight on. */
function made(options?: CreatePanelsStoreOptions<Id>): PanelsStore<Id> {
  const store = createPanelsStore<Id>(options)
  store.getState().declare(SPECS)
  return store
}

/** Declared apart: in `SPECS` it would open a band half every `settle` test then has to name. */
const NOTES: PanelSpec<Id> = { id: 'notes', zone: 'bottomLeft', slot: 'primary', title: 'Notes' }

describe('settle', () => {
  it('opens every half something is declared for, naming no panel', () => {
    const store = made()
    store.getState().settle()

    expect(openOf(store.getState())).toEqual({
      left: { primary: null, secondary: null },
      right: { primary: null, secondary: null },
      bottomRight: { primary: null },
    })
  })

  it('leaves a half nothing is declared for closed — an empty one still holds a handle', () => {
    const store = made()
    store.getState().settle()

    expect(openOf(store.getState()).top).toBeUndefined()
    expect(openOf(store.getState()).bottomLeft).toBeUndefined()
  })

  it('draws the panel declared first for each half all the same', () => {
    const store = made()
    store.getState().settle()

    expect(shownIn(store.getState(), 'left')).toEqual({ primary: 'files', secondary: 'outline' })
  })

  it('runs once — a second call must not undo what the reader has done since', () => {
    const store = made()
    store.getState().settle()
    store.getState().show('search')
    store.getState().settle()

    expect(openOf(store.getState()).left?.primary).toBe('search')
  })

  it('lets the project name the halves it cares about and fills in the rest', () => {
    const store = made()
    store.getState().settle({ left: { primary: 'search' } })

    expect(openOf(store.getState()).left?.primary).toBe('search')
    expect(openOf(store.getState()).left?.secondary).toBeNull()
  })

  it('never runs when a layout was restored — that arrangement is the reader’s own', () => {
    const store = createPanelsStore<Id>({
      initial: {
        views: { [DEFAULT_VIEW]: { left: { primary: 'search' } } },
        lengths: EMPTY_LENGTHS,
      },
    })
    store.getState().declare(SPECS)
    store.getState().settle()

    expect(openOf(store.getState())).toEqual({ left: { primary: 'search' } })
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

    expect(shownIn(store.getState(), 'left')).toEqual({ primary: 'search', secondary: 'outline' })
  })

  it('focuses the zone it opened in', () => {
    store.getState().show('terminal')
    expect(store.getState().focusedZone).toBe('bottomRight')
  })

  it('empties only the half it was asked about', () => {
    store.getState().close('left', 'primary')

    expect(openOf(store.getState()).left).toEqual({ secondary: null })
    expect(shownIn(store.getState(), 'left')).toEqual({ secondary: 'outline' })
  })

  it('only focuses a panel already on screen, rather than writing its name down', () => {
    // `files` is what the untouched half draws. Naming it would settle for every other view a
    // question this click never asked.
    store.getState().show('files')

    expect(openOf(store.getState()).left?.primary).toBeNull()
    expect(store.getState().focusedZone).toBe('left')
  })

  it('drops the focus when the zone it named stops drawing', () => {
    store.getState().show('files')
    store.getState().close('left', 'primary')
    store.getState().close('left', 'secondary')

    expect(store.getState().focusedZone).toBeNull()
  })

  it('ignores a panel nobody declared', () => {
    const before = openOf(store.getState())
    store.getState().show('nope' as Id)

    expect(openOf(store.getState())).toBe(before)
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
      initial: {
        views: { [DEFAULT_VIEW]: { right: { primary: 'preview', secondary: 'inspector' } } },
        lengths: EMPTY_LENGTHS,
      },
    })
    store.getState().declare(SPECS)

    store.getState().show('chat')
    expect(store.getState().stashed.right).toBeDefined()

    store.getState().close('right', 'primary')
    expect(openOf(store.getState()).right).toEqual({ primary: 'preview', secondary: 'inspector' })
  })

  it('closes the half rather than stashing when the solo panel was only a fallback', () => {
    // Nobody chose it: the zone cannot draw both, and the rail reopens it in one click.
    const store = made()
    store.getState().settle()
    store.getState().show('inspector')

    expect(shownIn(store.getState(), 'right')).toEqual({ secondary: 'inspector' })
  })
})

describe('declare', () => {
  const without = (id: Id) => SPECS.filter(spec => spec.id !== id)

  it('leaves the half open, on whatever is still declared for it', () => {
    const store = made()
    store.getState().settle()
    store.getState().declare(without('files'))

    expect(shownIn(store.getState(), 'left').primary).toBe('search')
  })

  it('gives the half back to the chosen panel when it returns', () => {
    // 🛑 The defect this exists for: a panel hidden behind a right, a route or a connection came
    // back to a half that had forgotten it was ever asked for.
    const store = made()
    store.getState().settle()
    store.getState().show('search')
    store.getState().declare(without('search'))
    expect(shownIn(store.getState(), 'left').primary).toBe('files')

    store.getState().declare(SPECS)
    expect(shownIn(store.getState(), 'left').primary).toBe('search')
  })

  it('keeps the order the project declares, so a returning icon finds its place', () => {
    const store = made()
    store.getState().declare(without('files'))
    store.getState().declare(SPECS)

    expect(store.getState().registry.map(spec => spec.id)).toEqual(SPECS.map(spec => spec.id))
  })

  /**
   * 🛑 A project builds this list in its render, so it arrives rebuilt whenever anything else in
   * that component moves. Written through, every rail, zone and frame re-rendered for a list
   * identical to the one they held — measured at five rewrites for five unrelated renders.
   */
  it('writes nothing when the declaration says the same thing', () => {
    const store = made()
    const held = store.getState().registry
    let notified = 0
    store.subscribe(() => (notified += 1))

    store.getState().declare(SPECS.map(spec => ({ ...spec })))

    expect(store.getState().registry).toBe(held)
    expect(notified).toBe(0)
  })

  it('writes when a title changes, which is what a language change is', () => {
    const store = made()
    store.getState().declare(SPECS.map(spec => ({ ...spec, title: `${spec.title} (fr)` })))

    expect(store.getState().registry[0]?.title).toBe('Files (fr)')
  })

  it('closes nothing: a half whose last panel goes simply draws no more', () => {
    const store = made()
    store.getState().settle()
    store.getState().declare(without('terminal'))

    expect(zoneDraws(store.getState(), 'bottomRight')).toBe(false)
  })
})

describe('resolve', () => {
  it('falls back to the panel declared first when the stored one moved half', () => {
    const store = createPanelsStore<Id>({
      initial: {
        views: { [DEFAULT_VIEW]: { left: { primary: 'outline' } } },
        lengths: EMPTY_LENGTHS,
      },
    })
    // `outline` is declared for the SECOND half of the left column, not the first.
    store.getState().declare(SPECS)

    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })

  it('tells a closed half from one that named nobody', () => {
    const store = createPanelsStore<Id>({
      initial: { views: { [DEFAULT_VIEW]: { left: { secondary: null } } }, lengths: EMPTY_LENGTHS },
    })
    store.getState().declare(SPECS)

    expect(shownIn(store.getState(), 'left')).toEqual({ secondary: 'outline' })
  })
})

describe('views', () => {
  it('keeps the open panels of each view to itself', () => {
    const store = made()
    store.getState().settle()
    store.getState().close('left', 'primary')

    store.getState().setView('other')
    store.getState().settle()
    expect(shownIn(store.getState(), 'left').primary).toBe('files')

    store.getState().setView(DEFAULT_VIEW)
    expect(shownIn(store.getState(), 'left').primary).toBeUndefined()
  })

  it('settles the view it arrives at, without waiting for a render', () => {
    // 🛑 Reachable only through a render, a view arrived at from outside React stayed unsettled
    // — a blank chassis for as long as no ancestor happened to re-render.
    const store = made()
    store.getState().setView('other')

    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })

  it('settles a view whose name is one of Object.prototype', () => {
    // 🛑 `'constructor' in {}` is true: the view was taken for settled and drew nothing at all,
    // then the first click froze the remaining half closed for good.
    const store = made({ view: 'constructor' })
    store.getState().settle()

    expect(shownIn(store.getState(), 'left')).toEqual({ primary: 'files', secondary: 'outline' })
  })

  it('holds every view it has opened, the one in front included', () => {
    const store = made()
    store.getState().settle()
    store.getState().setView('other')

    expect(Object.keys(store.getState().views).sort()).toEqual([DEFAULT_VIEW, 'other'])
  })

  it('settles each view against the panels declared for it, once', () => {
    const store = made()
    store.getState().settle()
    store.getState().setView('other')
    store.getState().settle()
    store.getState().close('left', 'primary')
    store.getState().settle()

    expect(shownIn(store.getState(), 'left').primary).toBeUndefined()
  })

  it('shares the lengths: no column changes width on the way to another view', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('left', 400, 1600)
    store.getState().setView('other')

    expect(store.getState().lengths.sizes.left).toBe(400)
  })

  it('drops the focus and the stash, which belong to the view being left', () => {
    const store = made()
    store.getState().settle()
    store.getState().show('terminal')
    store.getState().setView('other')

    expect(store.getState().focusedZone).toBeNull()
    expect(store.getState().stashed).toEqual({})
  })

  it('settles a view the stored layout never named — arriving straight at one is not empty', () => {
    // 🛑 The defect this exists for, and it only shows on a COLD start: a file existed, so the
    // view was taken as settled, `settle` returned early, and the chassis drew nothing at all.
    // Reached through `setView` from another view it worked, so the same screen answered two
    // ways depending on how you got there.
    const store = made({
      view: 'reports',
      initial: { views: { sites: { left: { primary: null } } }, lengths: EMPTY_LENGTHS },
    })
    store.getState().settle()

    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })

  it('leaves a view the stored layout DID name exactly as it was', () => {
    const store = made({
      view: 'reports',
      initial: { views: { reports: { right: { primary: null } } }, lengths: EMPTY_LENGTHS },
    })
    store.getState().settle()

    expect(shownIn(store.getState(), 'left').primary).toBeUndefined()
  })

  it('drops every other view on reset, and reopens the one in front on the spot', () => {
    const store = made()
    store.getState().settle()
    store.getState().setView('other')
    store.getState().close('left', 'primary')
    store.getState().reset()

    expect(Object.keys(store.getState().views)).toEqual(['other'])
    // 🛑 On the spot: nothing re-renders the provider when a button inside the chassis asked for
    // the reset, so the frame used to stay blank — and the escaped arrangement stayed on disk.
    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })
})

describe('panel placement', () => {
  it('moves a shown panel atomically to another half', () => {
    const store = made()
    store.getState().settle()

    store.getState().movePanel('files', { zone: 'right', slot: 'secondary' }, 0)

    // 🛑 `search` is still declared for the half `files` left, so that half falls BACK to it. It
    // once went dark instead, taking off screen a panel the reader had not touched.
    expect(shownIn(store.getState(), 'left').primary).toBe('search')
    expect(shownIn(store.getState(), 'right').secondary).toBe('files')
    expect(store.getState().placements.default?.byId.files).toEqual({
      zone: 'right',
      slot: 'secondary',
    })
  })

  it('moves a hidden panel without opening it', () => {
    const store = made()
    store.getState().settle()

    store.getState().movePanel('search', { zone: 'right', slot: 'secondary' }, 0)

    expect(shownIn(store.getState(), 'left').primary).toBe('files')
    expect(openOf(store.getState()).right?.secondary).toBeNull()
  })

  it('opens the halves a scope change moves panels into', () => {
    const store = made({
      initial: {
        views: {},
        lengths: EMPTY_LENGTHS,
        placements: {
          image: { byId: { outline: { zone: 'top', slot: 'primary' } }, order: ['outline'] },
        },
      },
    })
    store.getState().settle()

    store.getState().setPlacementScope('image')

    // 🛑 The view was settled against the scope being left, and nothing else reopens a half: the
    // panel this scope moves lands in a column that draws nothing until something else does.
    expect(shownIn(store.getState(), 'top').primary).toBe('outline')
  })

  it('leaves a half the reader closed closed when the scope changes', () => {
    const store = made()
    store.getState().settle()
    store.getState().close('left', 'primary')

    store.getState().setPlacementScope('image')

    // 🛑 A half the reader closed carries no key, exactly like one that never held anything —
    // reopened on every mount of every project passing the prop, and then written to disk.
    expect(openOf(store.getState()).left?.primary).toBeUndefined()
  })

  it('keeps what a half draws when an icon nobody was looking at is reordered above it', () => {
    const store = made()
    store.getState().settle()
    // `files` is drawn because it comes first, and the half names nobody.
    expect(shownIn(store.getState(), 'left').primary).toBe('files')

    store.getState().movePanel('search', { zone: 'left', slot: 'primary' }, 0)

    // 🛑 Moving a hidden icon must move nothing on screen. It changed which panel came first,
    // and a half naming nobody draws whichever that is — so the drag swapped the panel.
    expect(shownIn(store.getState(), 'left').primary).toBe('files')
  })

  it('keeps placements apart by scope and resets them', () => {
    const store = made()
    store.getState().settle()
    store.getState().setPlacementScope('image')
    store.getState().movePanel('search', { zone: 'right', slot: 'secondary' }, 0)
    store.getState().setPlacementScope('video')

    expect(store.getState().placements.video).toBeUndefined()
    store.getState().reset()
    expect(store.getState().placements).toEqual({})
  })

  it('closes the half a moved panel leaves only when nothing is left in it', () => {
    const store = made()
    store.getState().settle()

    // `outline` is alone in the left column's second half: nothing remains to fall back on.
    store.getState().movePanel('outline', { zone: 'top', slot: 'primary' }, 0)

    expect(openOf(store.getState()).left?.secondary).toBeUndefined()
    expect(shownIn(store.getState(), 'top').primary).toBe('outline')
  })

  it('opens the half a restored placement moved a panel into', () => {
    const store = made({
      initial: {
        views: {},
        lengths: EMPTY_LENGTHS,
        placements: {
          [DEFAULT_VIEW]: { byId: { files: { zone: 'top', slot: 'primary' } }, order: ['files'] },
        },
      },
    })
    store.getState().settle()

    // Nothing is DECLARED for the top zone: settling against the declaration alone left the half
    // the reader had dragged `files` into shut, and the panel invisible until they clicked it.
    expect(shownIn(store.getState(), 'top').primary).toBe('files')
  })

  it('leaves the state untouched when a drop changes nothing', () => {
    const store = made()
    store.getState().settle()
    store.getState().movePanel('search', { zone: 'left', slot: 'primary' }, 1)
    const held = store.getState()

    store.getState().movePanel('search', { zone: 'left', slot: 'primary' }, 1)

    expect(store.getState()).toBe(held)
  })

  it('keeps solo panels in a primary half', () => {
    const store = made()
    store.getState().settle()

    store.getState().movePanel('chat', { zone: 'left', slot: 'secondary' }, 0)

    expect(store.getState().placements.default?.byId.chat).toEqual({
      zone: 'left',
      slot: 'primary',
    })
  })
})

describe('undraggedSizeOf', () => {
  it('gives the zone its own width when no panel asks for more', () => {
    const store = made()
    store.getState().settle()

    const state = store.getState()
    expect(undraggedSizeOf('left', shownSpecsIn(state, 'left').primary)).toBe(DEFAULT_SIZES.left)
  })

  it('honours what the leading panel asks for', () => {
    const store = made()
    store.getState().settle()

    // `chat` asks for 460 against the column's own 260.
    const state = store.getState()
    expect(undraggedSizeOf('right', shownSpecsIn(state, 'right').primary)).toBe(460)
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
  it('gives back the arrangement of a first launch, and keeps the declared panels', () => {
    const store = made()
    store.getState().settle()
    store.getState().show('search')
    store.getState().resize('left', 400, 1600)
    store.getState().reset()

    expect(shownIn(store.getState(), 'left').primary).toBe('files')
    expect(store.getState().lengths.sizes).toEqual({})
    expect(store.getState().registry).toHaveLength(SPECS.length)
  })

  it('honours the defaults the project settled with, rather than a bare frame', () => {
    const store = made()
    store.getState().settle({ left: { primary: 'search' } })
    store.getState().reset()

    expect(shownIn(store.getState(), 'left').primary).toBe('search')
  })
})

describe('zoneTakesRoom', () => {
  it('answers like `zoneDraws` for the zones that own their axis', () => {
    const store = made()
    store.getState().settle()
    const state = store.getState()

    for (const zone of ['left', 'right', 'top'] as const) {
      expect(zoneTakesRoom(state, zone)).toBe(zoneDraws(state, zone))
    }
  })

  it('counts the band as ONE strip: either half drawing takes the height', () => {
    // 🛑 The defect this exists for. The band's two halves share one height, so `top` — whose
    // opposite is `bottomRight` — was told nothing faced it whenever the OTHER half was the one
    // open, and could then be dragged over the height the strip was already drawing in.
    const store = createPanelsStore<Id>({
      initial: {
        views: { [DEFAULT_VIEW]: { bottomLeft: { primary: 'notes' } } },
        lengths: EMPTY_LENGTHS,
      },
    })
    store.getState().declare([...SPECS, NOTES])
    const state = store.getState()

    expect(zoneDraws(state, 'bottomRight')).toBe(false)
    expect(zoneTakesRoom(state, 'bottomRight')).toBe(true)
    expect(zoneTakesRoom(state, 'bottomLeft')).toBe(true)
  })

  it('takes no room when the whole strip is closed', () => {
    const store = createPanelsStore<Id>({
      initial: { views: { [DEFAULT_VIEW]: {} }, lengths: EMPTY_LENGTHS },
    })
    store.getState().declare(SPECS)

    expect(zoneTakesRoom(store.getState(), 'bottomRight')).toBe(false)
  })
})

describe('fit', () => {
  it('leaves the lengths alone when nothing had to move', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('left', 300, 1600)

    const before = store.getState().lengths
    store.getState().fit(1600, 900)

    // 🛑 By reference: the persistence subscriber compares nothing else, and a fresh object
    // carrying the same numbers had every resize of the window writing the whole file.
    expect(store.getState().lengths).toBe(before)
  })

  it('does not write at all when the room has not changed either', () => {
    const store = made()
    store.getState().settle()
    store.getState().fit(1600, 900)

    const before = store.getState()
    store.getState().fit(1600, 900)

    expect(store.getState()).toBe(before)
  })

  it('still re-clamps a length the room no longer holds', () => {
    const store = made()
    store.getState().settle()
    store.getState().resize('left', 600, 1600)
    store.getState().fit(700, 900)

    expect(store.getState().lengths.sizes.left).toBeLessThan(600)
  })
})
