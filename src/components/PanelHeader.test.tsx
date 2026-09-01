import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { memoryStorage } from '../core/persistence'
import { Panel } from './Panel'
import { PanelHeader } from './PanelHeader'
import { Panels } from './Panels'

describe('PanelHeader', () => {
  /**
   * The half that gives ground is the actions': a panel crowding its row loses those first, and
   * never the close button — which would leave the panel with no way out.
   */
  it('keeps what is trailing outside the box that clips', () => {
    render(
      <PanelHeader title="Files" trailing={<button type="button">close</button>}>
        <button type="button">refresh</button>
      </PanelHeader>,
    )

    const close = screen.getByRole('button', { name: 'close' })
    const actions = screen.getByRole('button', { name: 'refresh' }).parentElement

    expect(actions?.contains(close)).toBe(false)
  })
})

type Id = 'terminal' | 'notes'

describe('a panel’s actions in a horizontal zone', () => {
  function Band({ fillActions }: { fillActions?: boolean }) {
    return (
      <Panels<Id> storage={memoryStorage()} storageKey="fill">
        <Panel<Id>
          id="terminal"
          zone="bottomRight"
          title="Terminal"
          fillActions={fillActions}
          actions={<button type="button">run</button>}
        >
          <p>terminal</p>
        </Panel>
      </Panels>
    )
  }

  /** The default, and it is a GUESS — a wide row that is mostly empty usually carries a bar. */
  it('takes the row’s free width when the panel does not say', () => {
    render(<Band />)

    expect(screen.getByText('Terminal')).toHaveClass('pnl-header__title--fixed')
  })

  /**
   * 🛑 A band holding a list with two buttons wants them at the END. Only the project knows
   * which of its panels is which, so the guess has to be refusable.
   */
  it('hugs the close button when the panel says otherwise', () => {
    render(<Band fillActions={false} />)

    expect(screen.getByText('Terminal')).not.toHaveClass('pnl-header__title--fixed')
  })
})
