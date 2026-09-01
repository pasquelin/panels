import { Children, isValidElement, useMemo, useRef, type ReactElement, type ReactNode } from 'react'
import { cx } from '../core/cx'
import { PanelsProvider, usePanelsStore, type PanelsProviderProps } from '../core/context'
import { useContainerFit } from '../core/hooks/useContainerFit'
import { useIsomorphicLayoutEffect } from '../core/layoutEffect'
import type { PanelSpec } from '../core/types'
import { Band, useBandHalves } from './Band'
import { Center, type CenterProps } from './Center'
import { ContentProvider, type PanelContent } from './content'
import { DEFAULT_LABELS, type PanelsLabels } from './labels'
import { Panel, type PanelProps } from './Panel'
import { Rail } from './Rail'
import { Surface } from './Surface'
import { ZoneEdge } from './ZoneEdge'

export type PanelsProps<Id extends string = string> = Omit<PanelsProviderProps<Id>, 'children'> & {
  /** Above the rails, full width. The project's own — the library imposes no chrome. */
  header?: ReactNode
  /** Below the rails, full width: a status line, counters, a breadcrumb. */
  footer?: ReactNode
  /** Pinned at the top of the left rail, above the icons. */
  railHeader?: ReactNode
  /** Words the chassis says. English by default; pass your own already translated. */
  labels?: Partial<PanelsLabels>
  /**
   * Forces the palette. Left out, the chassis follows the reader's system setting — which is
   * what a project wants until it offers a switch of its own.
   */
  theme?: 'dark' | 'light'
  className?: string
  /** `<Panel>` and `<Center>` descriptors. Anything else is rendered where it stands. */
  children: ReactNode
}

type Collected<Id extends string> = {
  specs: PanelSpec<Id>[]
  content: Map<string, PanelContent>
  centre: ReactElement<CenterProps> | null
  loose: ReactNode[]
}

/**
 * Reads the descriptors out of the children. `<Panel>` and `<Center>` describe rather than
 * render — see `Panel.tsx` for why this is a collection and not a portal.
 *
 * `Children.toArray` flattens fragments and drops the falsy, so `{ready && <Panel/>}` and a
 * mapped list both work. Anything that is neither descriptor is rendered where it stands, which
 * is what lets a project put its own providers between `<Panels>` and its panels.
 */
function collect<Id extends string>(children: ReactNode): Collected<Id> {
  const specs: PanelSpec<Id>[] = []
  const content = new Map<string, PanelContent>()
  const loose: ReactNode[] = []
  let centre: ReactElement<CenterProps> | null = null

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      loose.push(child)
      continue
    }

    if (child.type === Center) {
      centre = child as ReactElement<CenterProps>
      continue
    }

    if (child.type !== Panel) {
      loose.push(child)
      continue
    }

    const props = child.props as PanelProps<Id>
    const { id, zone, slot = 'primary', title, icon, opens, solo, actions, children: body } = props

    specs.push({ id, zone, slot, title, icon, opens, solo })
    content.set(id, { content: body, actions })
  }

  return { specs, content, centre, loose }
}

/**
 * The chassis: icon rails stuck to the edges, rounded panels laid over the gutter, a free centre,
 * and the project's own header and footer around them.
 */
export function Panels<Id extends string = string>({
  header,
  footer,
  railHeader,
  labels,
  theme,
  className,
  children,
  ...provider
}: PanelsProps<Id>) {
  return (
    <PanelsProvider<Id> {...provider}>
      <Frame<Id>
        header={header}
        footer={footer}
        railHeader={railHeader}
        labels={labels}
        theme={theme}
        className={className}
      >
        {children}
      </Frame>
    </PanelsProvider>
  )
}

type FrameProps<Id extends string> = Pick<
  PanelsProps<Id>,
  'header' | 'footer' | 'railHeader' | 'labels' | 'theme' | 'className' | 'children'
>

/**
 * Inside the provider, so it may read the store the provider made.
 *
 * One frame, and the centre stays at the SAME place in the tree through all four arrangements
 * of the band: moved, React would unmount it and take down whatever it holds.
 */
function Frame<Id extends string>({
  header,
  footer,
  railHeader,
  labels,
  theme,
  className,
  children,
}: FrameProps<Id>) {
  const store = usePanelsStore<Id>()
  // The COLUMNS box, not the chassis: the rails, the header and the footer are not room the
  // zones may be dragged into, and counting them would let a column overrun the centre by
  // exactly their width.
  const columns = useRef<HTMLDivElement>(null)
  useContainerFit(columns)

  const { specs, content, centre, loose } = useMemo(() => collect<Id>(children), [children])
  const words = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])

  // The registry follows the declaration: a panel added, removed or renamed has to reach the
  // rail without the project doing anything about it.
  // Before the paint, and before the provider settles the arrangement: a parent's effect runs
  // after its children's, so the registry is full by the time `settle` reads it.
  useIsomorphicLayoutEffect(() => {
    const { register, unregister } = store.getState()
    for (const spec of specs) register(spec)

    const known = new Set(specs.map(spec => spec.id))
    for (const held of store.getState().registry) {
      if (!known.has(held.id)) unregister(held.id)
    }
  }, [store, specs])

  const band = useBandHalves<Id>()

  return (
    <ContentProvider value={content}>
      <div data-pnl-theme={theme} className={cx('pnl-root', className)}>
        {header}

        <div className="pnl-middle">
          <Rail side="left" header={railHeader} />

          {/* Handles occupy exactly the gutter: the space between two surfaces IS the resize
              area, rather than decorative emptiness doubled by a handle. */}
          <div ref={columns} className="pnl-columns">
            <ZoneEdge<Id> zone="top" labels={words} />

            {/* A column runs to the FOOT of the frame unless the band's half on its side is
                drawing: the strip then starts where that column ends, and the opposite one
                keeps its full height. */}
            <div className="pnl-row">
              {!band.left && <ZoneEdge<Id> zone="left" labels={words} />}

              <div className="pnl-stack">
                <div className="pnl-row">
                  {band.left && <ZoneEdge<Id> zone="left" labels={words} />}

                  <Surface className="pnl-centre">{centre?.props.children}</Surface>

                  {band.right && <ZoneEdge<Id> zone="right" labels={words} />}
                </div>

                <Band<Id> left={band.left} right={band.right} labels={words} />
              </div>

              {!band.right && <ZoneEdge<Id> zone="right" labels={words} />}
            </div>
          </div>

          <Rail side="right" />
        </div>

        {footer}
        {loose}
      </div>
    </ContentProvider>
  )
}

Panels.Panel = Panel
Panels.Center = Center
