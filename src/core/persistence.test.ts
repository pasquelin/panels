import { describe, expect, it } from 'vitest'
import { LAYOUT_VERSION, memoryStorage, readLayout, writeLayout } from './persistence'
import { DEFAULT_VIEW } from './types'

const EMPTY = { sizes: {}, splits: {} }

/** A file as this version writes it, with one view unless another is named. */
function stored(views: unknown, lengths: unknown = EMPTY, version = LAYOUT_VERSION) {
  return JSON.stringify({ version, views, lengths })
}

describe('readLayout', () => {
  it('reads back what was written', () => {
    const storage = memoryStorage()
    const layout = { views: { [DEFAULT_VIEW]: { left: { primary: 'files' } } }, lengths: EMPTY }
    writeLayout(storage, 'k', layout)

    expect(readLayout(storage, 'k')).toEqual(layout)
  })

  it('answers nothing when there is nothing', () => {
    expect(readLayout(memoryStorage(), 'k')).toBeUndefined()
  })

  it('drops a layout written by another version rather than trusting its shape', () => {
    const storage = memoryStorage()
    storage.write('k', stored({}, EMPTY, LAYOUT_VERSION + 1))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('survives a corrupted entry', () => {
    const storage = memoryStorage()
    storage.write('k', 'not json at all')

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('refuses a half-shaped entry rather than answering a partial layout', () => {
    const storage = memoryStorage()
    storage.write('k', JSON.stringify({ version: LAYOUT_VERSION, views: {} }))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('drops a zone this build no longer knows rather than handing it to the frame', () => {
    const storage = memoryStorage()
    storage.write(
      'k',
      stored(
        { [DEFAULT_VIEW]: { left: { primary: 'files' }, attic: { primary: 'ghost' } } },
        { sizes: { left: 300, attic: 99 }, splits: {} },
      ),
    )

    const layout = readLayout(storage, 'k')
    expect(layout?.views[DEFAULT_VIEW]).toEqual({ left: { primary: 'files' } })
    expect(layout?.lengths.sizes).toEqual({ left: 300 })
  })

  it('drops a slot and an id that are not what they claim to be', () => {
    const storage = memoryStorage()
    storage.write(
      'k',
      stored(
        { [DEFAULT_VIEW]: { left: { primary: 'files', secondary: 42, tertiary: 'nope' } } },
        { sizes: { left: 'wide' }, splits: {} },
      ),
    )

    const layout = readLayout(storage, 'k')
    expect(layout?.views[DEFAULT_VIEW]).toEqual({ left: { primary: 'files' } })
    expect(layout?.lengths.sizes).toEqual({})
  })

  it('keeps a half open on no panel in particular, which is how most of them are written', () => {
    const storage = memoryStorage()
    storage.write('k', stored({ [DEFAULT_VIEW]: { left: { primary: null } } }))

    expect(readLayout(storage, 'k')?.views[DEFAULT_VIEW]).toEqual({ left: { primary: null } })
  })

  it('keeps the band divider only when it is a real number', () => {
    const storage = memoryStorage()
    const write = (bandSplit: unknown) =>
      storage.write('k', stored({}, { sizes: {}, splits: {}, bandSplit }))

    write(420)
    expect(readLayout(storage, 'k')?.lengths.bandSplit).toBe(420)

    write('420')
    expect(readLayout(storage, 'k')?.lengths.bandSplit).toBeUndefined()
  })

  it('refuses lengths that carry no sizes', () => {
    const storage = memoryStorage()
    storage.write('k', stored({}, {}))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })
})

describe('views', () => {
  it('carries every view it was given, each keeping its own arrangement', () => {
    const storage = memoryStorage()
    const views = {
      home: { left: { primary: 'projects' } },
      edit: { left: { primary: 'files' } },
    }
    writeLayout(storage, 'k', { views, lengths: EMPTY })

    expect(readLayout(storage, 'k')?.views).toEqual(views)
  })

  it('names no view the file never held — which is what makes the store settle it', () => {
    const storage = memoryStorage()
    storage.write('k', stored({ home: { left: { primary: 'projects' } } }))

    expect(readLayout(storage, 'k')?.views.edit).toBeUndefined()
  })

  it('reads a version 1 file as the view being asked for — the upgrade costs no layout', () => {
    // 🛑 Landed in the default view whatever was asked for, it became a ghost arrangement the
    // project could never reach, and rewrote itself for ever.
    const storage = memoryStorage()
    storage.write(
      'k',
      JSON.stringify({ version: 1, open: { left: { primary: 'files' } }, lengths: EMPTY }),
    )

    expect(readLayout(storage, 'k', 'edit')?.views.edit).toEqual({ left: { primary: 'files' } })
  })

  it('keeps a view named `__proto__` instead of writing through the prototype', () => {
    // 🛑 `JSON.parse` makes it an own property; assigning it on a plain object fires the setter,
    // so the view vanished and the map inherited an arrangement from the file.
    const storage = memoryStorage()
    // Written as text: an object literal would set the PROTOTYPE, and `JSON.stringify` drops it.
    storage.write(
      'k',
      '{"version":2,"views":{"__proto__":{"left":{"primary":"files"}},"edit":{}},' +
        '"lengths":{"sizes":{},"splits":{}}}',
    )

    const views = readLayout(storage, 'k')?.views
    expect(Object.keys(views ?? {}).sort()).toEqual(['__proto__', 'edit'])
    expect((views as Record<string, unknown>).left).toBeUndefined()
  })
})
