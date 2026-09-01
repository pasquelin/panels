import { describe, expect, it } from 'vitest'
import {
  fitSplit,
  fitted,
  fitZoneSize,
  MIN_CENTER,
  MIN_SIZE,
  MIN_SPLIT,
  sharedSizes,
  sizeKeyOf,
} from './clamps'
import type { Lengths, Zone } from './types'

describe('fitZoneSize', () => {
  it('keeps a size that fits', () => {
    expect(fitZoneSize(300, 1600, 260)).toBe(300)
  })

  it('never goes under the floor', () => {
    expect(fitZoneSize(10, 1600, 0)).toBe(MIN_SIZE)
  })

  it('leaves the centre its room, counting the opposite zone', () => {
    // 1000 wide, 300 already taken opposite, 240 owed to the centre: 460 is all that is left.
    expect(fitZoneSize(900, 1000, 300)).toBe(460)
  })

  it('falls back to the floor rather than a negative ceiling on a tiny container', () => {
    // The centre alone asks for more than the container has: the zone keeps its floor rather
    // than being clamped to something below zero.
    expect(fitZoneSize(400, 200, 0)).toBe(MIN_SIZE)
  })

  it('rounds, because a drag reports fractions', () => {
    expect(fitZoneSize(300.6, 1600, 0)).toBe(301)
  })
})

describe('fitSplit', () => {
  it('keeps both halves above the floor', () => {
    expect(fitSplit(50, 600)).toBe(MIN_SPLIT)
    expect(fitSplit(590, 600)).toBe(500)
  })
})

describe('sizeKeyOf', () => {
  it('gives the band one height for its two halves', () => {
    expect(sizeKeyOf('bottomLeft')).toBe(sizeKeyOf('bottomRight'))
  })

  it('leaves the other zones their own', () => {
    expect(sizeKeyOf('left')).toBe('left')
    expect(sizeKeyOf('right')).toBe('right')
    expect(sizeKeyOf('top')).toBe('top')
  })
})

describe('fitted', () => {
  // The left and right columns draw; nothing else does.
  const takesRoom = (zone: Zone) => zone === 'left' || zone === 'right'
  const undragged = () => 260

  it('re-clamps stored sizes to a narrower container', () => {
    const lengths: Lengths = { sizes: { left: 900, right: 900 }, splits: {} }
    const next = fitted(lengths, 1000, 800, takesRoom, undragged)

    // Neither may take the room the other already draws in, nor the centre's floor.
    expect(next.sizes.left).toBeLessThan(900)
    expect(next.sizes.right).toBeLessThan(900)
  })

  it('leaves a layout that already fits alone', () => {
    const lengths: Lengths = { sizes: { left: 300 }, splits: {} }
    expect(fitted(lengths, 1600, 900, takesRoom, undragged).sizes.left).toBe(300)
  })

  it('drops no key it was not given', () => {
    const lengths: Lengths = { sizes: {}, splits: {} }
    const next = fitted(lengths, 1600, 900, takesRoom, undragged)

    expect(next.sizes).toEqual({})
    expect(next.bandSplit).toBeUndefined()
  })

  it('clamps a divider inside a zone whose own length was never dragged', () => {
    // 🛑 `resize` and `resplit` write different keys: parting a column without ever moving its
    // edge left the divider unclamped, and the first half squeezed to nothing.
    const lengths: Lengths = { sizes: {}, splits: { left: 500 }, bandSplit: undefined }
    expect(fitted(lengths, 400, 300, takesRoom, undragged).splits.left).toBe(200)
  })

  it('clamps the band divider against the width, not against a zone', () => {
    const lengths: Lengths = { sizes: {}, splits: {}, bandSplit: 5000 }
    expect(fitted(lengths, 1000, 800, takesRoom, undragged).bandSplit).toBe(900)
  })
})

describe('sharedSizes', () => {
  it('leaves both alone when they fit', () => {
    expect(sharedSizes(320, 380, 1600)).toEqual([320, 380])
  })

  it('keeps the centre its floor when two untouched columns ask for too much', () => {
    // The defect this exists for: 320 + 380 on a 900 px container left 200 for a centre owed
    // 240 — and nothing in the stored lengths could catch it, there being nothing stored.
    const [left, right] = sharedSizes(320, 380, 900)

    expect(left + right).toBeLessThanOrEqual(900 - MIN_CENTER)
    expect(900 - left - right).toBeGreaterThanOrEqual(MIN_CENTER)
  })

  it('takes the ground in proportion, rather than from one of them', () => {
    const [left, right] = sharedSizes(300, 600, 900)

    // The wider one gives up more: collapsing the narrower while the other keeps its width is
    // how a column ends up unusable.
    expect(right).toBeGreaterThan(left)
    expect(left).toBeGreaterThanOrEqual(MIN_SIZE)
  })

  it('never takes either under its own floor', () => {
    const [left, right] = sharedSizes(320, 380, 500)

    expect(left).toBeGreaterThanOrEqual(0)
    expect(left).toBeLessThanOrEqual(MIN_SIZE)
    expect(right).toBeLessThanOrEqual(MIN_SIZE)
  })

  it('answers honestly for a container too small for any arrangement', () => {
    // Nothing fits: both fall to the floor rather than to a negative width.
    const [left, right] = sharedSizes(320, 380, 200)

    expect(left).toBeGreaterThan(0)
    expect(right).toBeGreaterThan(0)
  })

  it('leaves a lone column all the room the centre does not need', () => {
    expect(sharedSizes(900, 0, 900)).toEqual([900 - MIN_CENTER, 0])
  })
})
