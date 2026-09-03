import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { usePanelsComponents } from '../core/components'
import { usePanelsActions } from '../core/context'
import { usePointerDrag, type Dragging } from '../core/hooks/usePointerDrag'
import type { PanelSpec, Slot, Zone } from '../core/types'

/** Where a drop would land: a half, and the position within it. */
export type DropTarget = { zone: Zone; slot: Slot; index: number }

/**
 * What a rail needs to take part in a drag. Typed on `string` rather than on the project's own
 * ids: nothing here reads a panel except by its `id` and its `icon`, and a generic carried
 * through a React context buys two casts and no safety.
 */
export type PanelDragValue = {
  /**
   * The panel being carried, or `null`. One fact and one name: carrying something IS the drag
   * being on, and the rails read it both ways — they open their empty halves, and the carried
   * panel's own button leaves the flow while the ghost holds its place.
   */
  carrying: string | null
  target: DropTarget | null
  bind: (panel: PanelSpec<string>) => {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerCancel: () => void
    onLostPointerCapture: () => void
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void
  }
}

const PanelDragContext = createContext<PanelDragValue | null>(null)

/** Pixels the pointer must travel before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 5

/** What one gesture holds: the panel, where the press began, and the chassis it began in. */
type Held = {
  panel: PanelSpec<string>
  /** Where the press began, which is what the threshold is measured from. */
  originX: number
  originY: number
  /** The chassis root, so the hit-test cannot wander into another one on the same page. */
  root: Element | null
  /** The wrapper the press landed on, so a window listener can claim the pointer for it. */
  node: Element
  moving: boolean
}

/**
 * Moving panels, or not. Off, the context is `null` and the rail renders exactly what it rendered
 * before this existed — no wrappers, no listeners, no ghost.
 *
 * 🛑 ONE component whatever the answer, and the hooks below run either way. Written as two — a
 * provider on, the bare children off — the element type changed with the prop, so React unmounted
 * the whole middle of the chassis the moment a project toggled it: the panels lost their scroll,
 * their focus and anything an uncontrolled input held. The cost of always running is four refs
 * and two `useState` on a chassis that is not using them.
 */
export function PanelDragProvider({
  enabled,
  children,
}: {
  enabled: boolean
  children: ReactNode
}) {
  const { movePanel } = usePanelsActions()
  const { IconButton } = usePanelsComponents()
  const drag = usePointerDrag<Held>()

  const [carried, setCarried] = useState<PanelSpec<string> | null>(null)
  const [target, setTarget] = useState<DropTarget | null>(null)
  // Read by `onPointerUp`, which must see the target as it stands at the drop and not as it
  // stood when the handler was built — that is what keeps `bind` stable across a whole gesture.
  const held = useRef<DropTarget | null>(null)
  /**
   * The panel whose next click is the tail of a drag, and must not toggle it.
   *
   * 🛑 An id, not a flag, and never the drag itself. A drop into ANOTHER half unmounts the button
   * before any click can reach it, so nothing clears a flag — and a bare `true` then swallowed
   * the next activation of a DIFFERENT button. For a pointer that hardly shows, since the press
   * clears it first; for a keyboard it is the whole interaction: tab to a rail icon, press Enter,
   * nothing happens. An id only ever guards its own button.
   */
  const swallow = useRef<string | null>(null)
  const ghost = useRef<HTMLDivElement | null>(null)
  /** The pointer, as last seen. Held so the ghost can be placed the instant it is attached. */
  const at = useRef({ x: 0, y: 0 })

  // Written straight to the node, never through state: this runs on every `pointermove`, and a
  // re-render per frame is what `will-change: transform` is there to avoid.
  const moveGhost = (): void => {
    const node = ghost.current
    if (node)
      node.style.transform = `translate3d(${at.current.x + 12}px, ${at.current.y + 12}px, 0)`
  }

  /**
   * The half under the pointer, and the position the panel would take in it.
   *
   * Measured on every move rather than once at the start: the placeholder this answer puts on
   * screen SHIFTS the buttons it was measured against, so a cached list is wrong by exactly the
   * height of one icon.
   */
  const targetAt = (x: number, y: number, held: Held): DropTarget | null => {
    const drop = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-pnl-drop]')
    const zone = drop?.dataset.pnlZone as Zone | undefined
    const slot = drop?.dataset.pnlSlot as Slot | undefined
    if (!drop || !zone || !slot) return null
    // 🛑 The chassis the gesture began in, and no other. `elementFromPoint` reads the whole
    // document: two chassis side by side, a drag started in one found the other's rail and wrote
    // the placement into the store of the first.
    if (held.root && !held.root.contains(drop)) return null

    const buttons = [...drop.querySelectorAll<HTMLElement>('[data-pnl-panel]')].filter(
      button => button.dataset.pnlPanel !== held.panel.id,
    )
    // One layout read per button: `getBoundingClientRect` already carries the height, and asking
    // `offsetHeight` after it forced a second synchronous layout on every pointer move.
    const index = buttons.findIndex(button => {
      const box = button.getBoundingClientRect()
      return y < box.top + box.height / 2
    })
    return { zone, slot, index: index < 0 ? buttons.length : index }
  }

  /**
   * Watches the WINDOW for the move that turns a press into a drag.
   *
   * 🛑 Because the press is deliberately not captured — see `onPointerDown` — the element stops
   * hearing about the pointer the moment it leaves its own 36 pixels. A reader who flings a panel
   * fast enough for the first sample to land outside never crossed the threshold, never captured,
   * and released onto nothing: press, drag, let go, and the chassis had not moved. The window
   * hears it, claims the pointer, and hands the gesture back to the element.
   */
  const watching = useRef<((event: PointerEvent) => void) | null>(null)

  const unwatch = useCallback((): void => {
    if (watching.current) window.removeEventListener('pointermove', watching.current)
    watching.current = null
  }, [])

  /**
   * The press has travelled far enough to be a drag: claims the pointer, lifts the ghost, and
   * arms the click this gesture will produce. Answers whether the gesture is a drag at all.
   *
   * Shared by the element's own handler and the window's, so the threshold and what crossing it
   * means are written once — two copies would be two thresholds the day either moves.
   */
  const begin = useCallback(
    (current: Dragging<Held>, x: number, y: number): boolean => {
      if (current.moving) return true
      if (Math.hypot(x - current.originX, y - current.originY) < DRAG_THRESHOLD) return false

      unwatch()
      // NOW the pointer is worth claiming, so the gesture survives the cursor leaving the rail.
      drag.capture({ pointerId: current.pointerId, currentTarget: current.node })
      current.moving = true
      swallow.current = current.panel.id
      setCarried(current.panel)
      return true
    },
    [drag, unwatch],
  )

  const watch = useCallback((): void => {
    unwatch()
    const onMove = (native: PointerEvent): void => {
      const current = drag.matching(native)
      if (!current) return

      at.current = { x: native.clientX, y: native.clientY }
      begin(current, native.clientX, native.clientY)
    }
    watching.current = onMove
    window.addEventListener('pointermove', onMove)
  }, [begin, drag, unwatch])

  // A chassis taken off the page mid-press leaves nothing behind.
  useEffect(() => unwatch, [unwatch])

  const release = useCallback((): void => {
    unwatch()
    drag.cancel()
    held.current = null
    setCarried(null)
    setTarget(null)
  }, [drag, unwatch])

  // 🛑 Depends on `movePanel` alone. Built from `target`, every rail button in the chassis would
  // be handed new listeners each time the pointer crossed into another half.
  const bind = useCallback<PanelDragValue['bind']>(
    panel => ({
      onPointerDown: event => {
        if (event.button !== 0 || !event.isPrimary) return
        swallow.current = null
        at.current = { x: event.clientX, y: event.clientY }
        // 🛑 No capture yet. A captured pointer retargets `pointerup` to the capturing element,
        // and the browser then fires `click` at the common ancestor of down and up — this
        // wrapper, never the button inside it. Captured here, a rail button stopped opening its
        // panel at all: every click was swallowed by the very thing meant to carry it.
        drag.start(
          event,
          {
            panel,
            originX: event.clientX,
            originY: event.clientY,
            root: event.currentTarget.closest('.pnl-root'),
            node: event.currentTarget,
            moving: false,
          },
          { capture: false },
        )
        watch()
      },
      onPointerMove: event => {
        const current = drag.matching(event)
        if (!current) return

        at.current = { x: event.clientX, y: event.clientY }
        if (!begin(current, event.clientX, event.clientY)) return
        // 🛑 Hit-test BEFORE moving the ghost. `elementFromPoint` and `getBoundingClientRect`
        // are layout reads, and a style written just above them forces a synchronous recalc —
        // once per frame, for the whole drag. All the reads first, the one write last.
        const next = targetAt(event.clientX, event.clientY, current)
        held.current = next
        // Compared field by field: a pointer travelling inside one half answers the same target
        // sixty times a second, and each new object would re-render every rail.
        setTarget(previous =>
          previous?.zone === next?.zone &&
          previous?.slot === next?.slot &&
          previous?.index === next?.index
            ? previous
            : next,
        )
        moveGhost()
      },
      onPointerUp: event => {
        const current = drag.matching(event)
        if (!current) return

        // 🛑 Only for a press that became a drag. A plain click ends here too, and hit-testing
        // the pointer on every one of them is work nobody asked for.
        if (current.moving) {
          // Asked again when the moves never found a target: the empty halves open on the render
          // `setCarried` triggers, so a press-flick-release in one gesture hit-tested a rail that
          // had not opened them yet, and the drop landed nowhere.
          const landing = held.current ?? targetAt(event.clientX, event.clientY, current)
          if (landing) {
            movePanel(panel.id, { zone: landing.zone, slot: landing.slot }, landing.index)
            // Landing in another half takes this button out of the rail it was in, so no click
            // follows the drop and there is nothing left to swallow.
            if (landing.zone !== panel.zone || landing.slot !== panel.slot) swallow.current = null
          }
        }
        release()
      },
      onPointerCancel: release,
      // The platform can take a capture back — a context menu, a system gesture. Left unhandled,
      // the gesture never ends and the ghost stays on screen.
      onLostPointerCapture: release,
      onClickCapture: event => {
        // Cleared whatever the answer: one click is all this ever guards, and a button that is
        // NOT the one dragged has just proved no click is coming for the one that was.
        const dragged = swallow.current === panel.id
        swallow.current = null
        if (!dragged) return

        // The press that just ended was a drag, and the browser reports a click anyway. Letting
        // it through would toggle the panel the reader had only meant to move.
        event.preventDefault()
        event.stopPropagation()
      },
    }),
    [begin, drag, movePanel, release, watch],
  )

  const value = useMemo<PanelDragValue | null>(
    () => (enabled ? { carrying: carried?.id ?? null, target, bind } : null),
    [enabled, carried, target, bind],
  )

  // Stable, so a target changing mid-drag does not detach and reattach the node the ghost is
  // being moved by — and the initial position is set the moment it is attached.
  const attachGhost = useCallback((node: HTMLDivElement | null) => {
    ghost.current = node
    moveGhost()
  }, [])

  return (
    <PanelDragContext.Provider value={value}>
      {children}
      {carried && (
        <div ref={attachGhost} className="pnl-rail-drag__ghost" aria-hidden="true">
          {/* The project's own button, drawn as the rail draws it: a chassis that replaces
              `IconButton` would otherwise carry something that looks like no button it has, and
              a ghost styled here would drift from the geometry the rail gives its buttons. */}
          <IconButton
            icon={carried.icon}
            label={carried.title}
            active
            className="pnl-rail__button"
            tabIndex={-1}
          />
        </div>
      )}
    </PanelDragContext.Provider>
  )
}

/** The drag in progress, or `null` where moving panels is off. */
export function usePanelDrag(): PanelDragValue | null {
  return useContext(PanelDragContext)
}
