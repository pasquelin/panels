import { describe, expect, it } from 'vitest'
import { LAYOUT_VERSION, memoryStorage, readLayout, writeLayout } from './persistence'

describe('readLayout', () => {
  it('reads back what was written', () => {
    const storage = memoryStorage()
    const layout = { open: { left: { primary: 'files' } }, lengths: { sizes: {}, splits: {} } }
    writeLayout(storage, 'k', layout)

    expect(readLayout(storage, 'k')).toEqual(layout)
  })

  it('answers nothing when there is nothing', () => {
    expect(readLayout(memoryStorage(), 'k')).toBeUndefined()
  })

  it('drops a layout written by another version rather than trusting its shape', () => {
    const storage = memoryStorage()
    storage.write('k', JSON.stringify({ version: LAYOUT_VERSION + 1, open: {}, lengths: {} }))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('survives a corrupted entry', () => {
    const storage = memoryStorage()
    storage.write('k', 'not json at all')

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('refuses a half-shaped entry rather than answering a partial layout', () => {
    const storage = memoryStorage()
    storage.write('k', JSON.stringify({ version: LAYOUT_VERSION, open: {} }))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })

  it('drops a zone this build no longer knows rather than handing it to the frame', () => {
    const storage = memoryStorage()
    storage.write(
      'k',
      JSON.stringify({
        version: LAYOUT_VERSION,
        open: { left: { primary: 'files' }, attic: { primary: 'ghost' } },
        lengths: { sizes: { left: 300, attic: 99 }, splits: {} },
      }),
    )

    const layout = readLayout(storage, 'k')
    expect(layout?.open).toEqual({ left: { primary: 'files' } })
    expect(layout?.lengths.sizes).toEqual({ left: 300 })
  })

  it('drops a slot and an id that are not what they claim to be', () => {
    const storage = memoryStorage()
    storage.write(
      'k',
      JSON.stringify({
        version: LAYOUT_VERSION,
        open: { left: { primary: 'files', secondary: 42, tertiary: 'nope' } },
        lengths: { sizes: { left: 'wide' }, splits: {} },
      }),
    )

    const layout = readLayout(storage, 'k')
    expect(layout?.open).toEqual({ left: { primary: 'files' } })
    expect(layout?.lengths.sizes).toEqual({})
  })

  it('keeps the band divider only when it is a real number', () => {
    const storage = memoryStorage()
    const write = (bandSplit: unknown) =>
      storage.write(
        'k',
        JSON.stringify({
          version: LAYOUT_VERSION,
          open: {},
          lengths: { sizes: {}, splits: {}, bandSplit },
        }),
      )

    write(420)
    expect(readLayout(storage, 'k')?.lengths.bandSplit).toBe(420)

    write('420')
    expect(readLayout(storage, 'k')?.lengths.bandSplit).toBeUndefined()
  })

  it('refuses lengths that carry no sizes', () => {
    const storage = memoryStorage()
    storage.write('k', JSON.stringify({ version: LAYOUT_VERSION, open: {}, lengths: {} }))

    expect(readLayout(storage, 'k')).toBeUndefined()
  })
})
