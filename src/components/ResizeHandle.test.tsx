import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ResizeHandle } from './ResizeHandle'

describe('ResizeHandle', () => {
  it('announces where the cut stands', () => {
    render(<ResizeHandle axis="horizontal" size={320} min={140} label="Resize" onSize={vi.fn()} />)
    const handle = screen.getByRole('separator')

    expect(handle).toHaveAttribute('aria-valuenow', '320')
    expect(handle).toHaveAttribute('aria-valuemin', '140')
    expect(handle).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('is reachable and driven by the keyboard', async () => {
    const user = userEvent.setup()
    const onSize = vi.fn()
    render(<ResizeHandle axis="horizontal" size={300} step={16} label="Resize" onSize={onSize} />)

    await user.tab()
    expect(screen.getByRole('separator')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(onSize).toHaveBeenCalledWith(316, expect.any(Number))

    await user.keyboard('{ArrowLeft}')
    expect(onSize).toHaveBeenLastCalledWith(284, expect.any(Number))
  })

  it('reverses the keyboard for a zone that grows backwards', async () => {
    const user = userEvent.setup()
    const onSize = vi.fn()
    render(<ResizeHandle axis="horizontal" invert size={300} step={16} label="R" onSize={onSize} />)

    await user.tab()
    await user.keyboard('{ArrowRight}')

    // The right column widens as the pointer — and the arrow — moves LEFT.
    expect(onSize).toHaveBeenCalledWith(284, expect.any(Number))
  })

  it('ignores keys that are not its axis', async () => {
    const user = userEvent.setup()
    const onSize = vi.fn()
    render(<ResizeHandle axis="horizontal" size={300} label="R" onSize={onSize} />)

    await user.tab()
    await user.keyboard('{ArrowUp}{Enter}{a}')

    expect(onSize).not.toHaveBeenCalled()
  })

  it('measures the panel through the callback its parent gave it, never a DOM sibling', async () => {
    const user = userEvent.setup()
    const onSize = vi.fn()
    render(
      <ResizeHandle axis="horizontal" label="R" measure={() => 240} step={10} onSize={onSize} />,
    )

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(onSize).toHaveBeenCalledWith(250, expect.any(Number))
  })
})
