# Architecture

How the chassis works inside. For using it, start at
[docs/en](en/README.md) · [docs/fr](fr/README.md).

## Two layers, and the boundary between them

```
core/          the logic. Renders nothing, touches no DOM but to measure
  types        zones, slots, what a panel spec is
  clamps       the floors and the sharing — pure functions, tested alone
  store        one zustand store per chassis, created not imported
  persistence  localStorage by default, any adapter
  context      the provider, and the subscribed readers
  hooks/       usePanels · useZone · useArrangement · useContainerFit · usePointerDrag

components/    built on those hooks, replaceable one at a time
  Panels       collects the descriptors, assembles the frame
  Panel·Center descriptors — never rendered where they are written
  Rail · ZoneEdge · Band · PanelFrame
  Surface · PanelHeader · IconButton · Separator · ResizeHandle

dockview/      a separate entry point. Nothing else imports it
```

The rule: **`core/` never renders, `components/` never decides.** A hook that returns JSX belongs
in `components/`; a component that computes a size belongs in `core/`.

## The store is created, not imported

`createPanelsStore()` makes one per chassis. There is no module-level singleton, which is what
lets two chassis live in one application, and what lets a test render without leaking into the
next.

The provider makes one if you do not pass one. Passing your own is how you drive the chassis from
outside React — see [Recipes](en/RECIPES.md).

## Descriptors, not portals

`<Panel>` and `<Center>` return `null`. `<Panels>` reads them out of its children with
`Children.toArray`, which flattens fragments and drops the falsy, so `{ready && <Panel/>}` and a
mapped list both work.

The alternative was a portal per panel. It was rejected because a portal puts the panel's content
in a **different React tree** from the one it was declared in: context, error boundaries and
suspense would all stop at the boundary, and a panel could not read a provider its own file sits
under.

The cost is that panels must be children of `<Panels>`, not of some component in between. That is
the same constraint `<Route>` has, and it is understood.

## What is stored, and what is resolved

Stored: which panel each half was **told** to hold, per view, and the sizes. Nothing else — and
only a real choice: a half nobody has touched is stored open, naming nobody.

Everything else is **resolved at render**:

- which panel a half *draws* is not what it *holds* — the one it names if that panel is still
  declared for that half, else the first one that is
- what a zone *draws* is not what its halves hold either — a `solo` panel silences the other
- the size a zone *takes* is bounded against the opposite zone and the measured room
- whether a zone *takes room* is not whether it *draws* — the band's two halves share one height

Each of those was a bug before it was a function. They are `shownIn`, `sharedSizes` and
`zoneTakesRoom`, and each has a test that starts from the arrangement that broke it.

Resolving the first one at render rather than writing it down is what makes conditional panels
free. A panel withdrawn — behind a right, a route, a connection — leaves a half that falls back;
declared again, it takes its half back. Written down, the choice would have been lost the first
time the panel was hidden, and nothing would ever have restored it.

## Why the selectors are scalar

`resize`, `resplit` and `fit` replace `lengths` and `available` wholesale. A component subscribed
to either as an object therefore re-renders on **every** `pointermove` of a drag — with five zones
mounted, five re-renders a frame where two are owed.

`useZone` subscribes to individual numbers instead, and `PanelFrame` and `ZoneEdge` are memoised
to stop the cascade below them.

## Measuring the columns, not the chassis

`useContainerFit` observes the box the zones and the centre share — not the root, which also holds
the rails, the header and the footer. Counting those would let a column overrun the centre by
exactly their width.

Observing the *container* rather than the window is what lets the chassis live inside a page that
already exists.

## The stylesheet owes its specificity to its consumers

Every default token sits inside `:where()`, at zero specificity, so anything a project writes
wins whatever order the stylesheets load in. The layout rules keep normal specificity: they are
not something a repaint should reach.

`src/styles/tokens.test.ts` reads the sheet and fails if a token block escapes `:where()`.

## What was deliberately left out

- **surfaces / sections** — the chassis still has no notion of what a screen *is*, or of your
  domain. What it does carry, since views, is that one application can have two screens worth
  arranging apart: `view` names an arrangement and nothing more. The router changes the children;
  the view says which arrangement they are drawn in.
- **capabilities** — a panel that should not be offered is a panel you do not declare.
- **i18n** — four strings, passed in already translated.
- **an icon set** — `icon` takes any node.
- **tooltips** — and everything else a design system puts on a button. The two buttons the
  chassis draws itself are replaceable (`components`), which is what keeps `tooltip`, `shortcut`
  and `badge` from becoming props here one after the other.
- **floating and dragging panels between zones** — planned, and the state model already allows an
  override of the declared zone. Not in v1.
