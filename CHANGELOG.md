# Changelog

All notable changes to `@pasquelin/panels`.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] — 2026-09-03

### Fixed

- **A drop lands in the half nearest the pointer, not the one it happens to be over.** A half's
  drop zone is exactly as tall as the icons standing in it, so the rail's empty space — most of
  it, under the last icon — belonged to no half at all. A reader aiming below a button was offered
  no indicator and dropped onto nothing; the only way to reach the place under an icon was to
  hover that icon. Anywhere in a rail is now a drop, and the half is whichever of that rail's own
  is closest.

## [0.4.0] — 2026-09-03

### Added

- **A reader can move a panel from one half to another.** Off by default — `draggablePanels` on
  `<Panels>` turns it on. Dragging a rail icon lifts a ghost under the pointer and opens every
  half a rail draws, empty ones included, to receive it; dropping it there moves the panel, and
  the choice is stored with the rest of the layout. The declaration is never overwritten: it is
  what the panel falls back to, so a panel dropped back where the project put it drops the
  override rather than recording a coincidence. A panel that was on screen when it was picked up
  is on screen where it lands; one that was not moves on paper alone, since opening a column
  nobody asked for is a strange answer to a drag. `solo` panels always land in `primary` — one
  sitting in `secondary` would silence the half it stands in.
- **`placementScope`**, for two views that share one arrangement of the rails. Placement follows
  `view` unless this names a scope of its own, so an application whose screens each keep their
  own open panels can still let a reader arrange the rails once rather than once per screen.
- **`movePanel(id, { zone, slot }, index)`** on the store and on `usePanelsActions`, for a menu,
  a shortcut or a test. The index is the position inside the half being dropped into.
- `arrangedRegistry(state)` is exported: the declared panels as the reader has arranged them,
  each carrying the zone and half it stands in. `usePanels().panels` answers with the same list,
  so it cannot disagree with the `isShown` and `close` beside it.

### Fixed

- **`--pnl-rail-button` sizes the rail's buttons, which it never did.** The token is documented as
  "the rail icon button" and defaults to `36px`, but `.pnl-icon-button` sets `28px` and is
  declared lower in the same stylesheet — at equal specificity it won, silently, and a project
  widening its rail moved everything except the buttons. Found by the drag: a drop marker
  honouring the token stood eight pixels taller than the button it stands in for, and the rail
  jumped by the difference on every pointer move. Rail buttons are now the `36px` they were always
  meant to be; a project that wants the old size sets `--pnl-rail-button: 28px`.

### Changed

- **`top` is carried by no rail.** A rail is an edge of the frame, and `top` is a band lying
  across the whole width — it has no edge of its own. Given to the left rail for want of anywhere
  else, its icons stood under the left column's own and read as more of that column: a reader
  dropping a panel there watched it land across the top of the window. A panel declared in `top`
  still draws; the project opens and closes it itself, through `usePanels().toggle` or the store.
- **A zone holding nothing offers one place to land, not two.** `primary` and `secondary` are two
  destinations only once something stands in the zone to be above or below; empty, they are the
  same landing. Offered as two, a drag drew a pair of identical squares for one place, parted by a
  separator cutting a zone that has nothing to cut.
- **`useZonePanels` answers both halves, empty ones included.** What a rail draws for an empty
  half is the rail's own question — nothing at rest, a place to land while a panel is carried —
  and answering it in the hook left the caller rebuilding the half it had just dropped. Code that
  took the result as "the halves worth drawing" now filters on `panels.length > 0` itself.
- **The stored layout stays at version 2.** The placements a reader drags only ever GREW the
  file: a build without them ignores the key, and this one reads a file that has none. Bumped, an
  older bundle — a second tab, a rollback — would have found a version it does not know and
  dropped the whole layout, sizes and arrangements included, to reject a key it never needed.
- **`Arranged` now requires `placements` and `placementScope`.** Every reader built on it asks
  where a panel *is*, and one handed a state without them is not asking a smaller question — it is
  being told where panels were declared for a chassis whose reader has moved them. Left optional,
  two call sites inside the library had already forgotten them. Code that builds an `Arranged` by
  hand rather than taking it from `useArrangement` has two fields to add; `{}` and `null` are the
  values for a chassis nobody has rearranged.

## [0.3.4] — 2026-09-02

### Changed

- **A tag pushed twice no longer fails the release.** Nothing in the library moved: the published
  files are those of 0.3.3. `v0.3.3` reached GitHub as two push events, and the second run
  replayed the whole chain only to be turned away by the registry — `cannot publish over the
  previously published versions` — reporting in red a release that had succeeded. A `guard` job
  now asks npm whether the version is already there, and the publishing job starts only if it is
  not, so the duplicate reads as skipped rather than broken.

## [0.3.3] — 2026-09-02

### Fixed

- **`defaultOpen` reaches the very first view the chassis lands on.** That view is settled by
  `setView`, which reads the halves off the store's own `defaults` — and those were written by
  `settle` alone, running after it. So a project naming `view` opened whatever happened to be
  declared at that instant, and a view settles once: measured in IA Studio, a space entered
  through Image kept its band shut in Video for good, and the home its lower left for as long as
  the project was still being read.

## [0.3.2] — 2026-09-02

### Fixed

- **A declaration that says the same thing writes nothing.** A project builds its panel list in
  its render, so the list arrives rebuilt whenever anything else in that component moves — and
  `declare` wrote it through, notifying every rail, every zone and every frame for a list
  identical to the one they already held. Measured in a real application: five rewrites for five
  renders that had nothing to do with the panels. The specs are now compared field by field.

## [0.3.1] — 2026-09-02

### Fixed

- **A zone's divider no longer jumps to 100 px on its first drag.** Until a split was stored, CSS
  parted the zone in two and the handle had nothing to start from, so it started from zero and
  the clamp floored the first pixel of the drag to `MIN_SPLIT` — a half of 390 px snapped to 100.
  The handle now measures the half it moves. The band's divider had the same defect, and the same
  cure.
- **A column is bounded against the columns box, not against the row the band left it in.** With
  one half of the band drawing, the opposite column runs to the foot and this one sits in an
  inner row that already lacks that column — and `resize` took it off a second time. The right
  column stopped at 418 px with the centre still 554 wide; it now reaches 744, the centre at its
  floor.
- **`fit` writes nothing when nothing had to move.** It rebuilt `lengths` on every frame of a
  window resize, and the persistence subscriber — which compares by reference — re-serialised
  the whole layout for each of them.
- **A right click, or a second finger, no longer starts a drag.** The handle captured any
  pointer; it now takes the main button of the primary pointer and nothing else.
- **The handles keep the gesture on touch.** `touch-action: none` and `user-select: none`, so a
  finger on a handle resizes the zone rather than scrolling the page, and a mouse leaving the
  handle mid-drag selects no title on its way.
- **`<DockviewCenter>` reads `onLayout` when a change lands, not when Dockview became ready.**
  `onReady` fires once, and the callback it captured was the first render's.

### Changed

- **The layout is written at most every 250 ms, and flushed on unmount and `pagehide`.** A drag
  wrote to `localStorage` on every `pointermove` — sixty synchronous serialisations a second, on
  the thread that draws the drag. A project reading the storage right after an action may find
  it not written yet; unmounting the chassis, or the page being hidden, writes what is pending.
- **`useZone` subscribes once to the arrangement rather than three times.** Fourteen selectors
  per zone, rerun on every write to the store, are now eight.
- **`<PanelFrame>` takes a `ref`, which reaches its surface.**

## [0.3.0] — 2026-09-01

### Added

- **`fillActions` on `<Panel>`.** Whether a panel's actions take the header's free width or hug
  the close button. The chassis guessed it from "publishes actions and sits in a horizontal
  zone", which is right for a montage bar and wrong for a band holding a list with two buttons —
  and only the project knows which of its panels is which. Left out, the guess stands.

### Fixed

- **`reset()` no longer settles against an empty registry.** Called before any panel is declared
  it settled the view EMPTY — and an entry is what stops anything reopening it, so every half
  stayed shut for good.
- **`<Panel>` fields reach the registry by spread**, not one by one. `fillActions` was the second
  field in two releases to be added to the type and forgotten in the collector.

### Tests

- The frame's GEOMETRY is covered here at last: a zone drawing nothing takes neither room nor
  handle, a column keeps its divider only between two open halves, an untouched half is flexed
  rather than sized, the band runs under the opposite column and parts its own two halves.
  🛑 These were IA Studio's, and it let them go on migrating — on the assumption that this
  library covered them. It did not.
- `PanelHeader` keeps what is trailing outside the box that clips: a crowded row loses its
  actions, never its way out.

## [0.2.0] — 2026-09-01

Two changes to the same idea: **what a half shows is resolved when it is drawn, not written down
once**. That is what lets a project declare its panels conditionally without losing anything, and
what makes a second view cost one prop.

### Added

- **Views.** `<Panels view="review">` — a named arrangement. Each view keeps the panels it had
  open to itself; the lengths stay shared, because a column that changed width on the way to
  another view reads as another window. Omitted, everything lands in one view and nothing about
  this is visible. The store gains `view`, `views` and `setView`; the prop is controlled.
- `DEFAULT_VIEW`, the name a project that never passes one lands in.
- **`components`**, to draw the chassis' own buttons yourself:
  `<Panels components={{ IconButton: Mine }}>`. The rail's buttons and the close button were the
  one part of the chassis a project could not repaint, so a tooltip — or a shortcut hint, or a
  badge — had nowhere to go but a new prop here. Read once, like `storage`.
- `shownSpecsIn`, `openOf` and the `Arranged` type, for a project building its own frame on the
  headless core: `shownIn` hands back ids, and every caller was finding the panel again from them.

### Removed

- **`PanelsState.open` and `PanelsState.settled`.** One map, `views`, now holds every
  arrangement including the one in front, and having an entry in it IS the record of having been
  settled. Read the view on screen with `openOf(state)`.
  Keeping the front view apart cost three hand-written merges and a `delete`, and the invariant
  they upheld was tenable by nobody: a cold start straight onto a view the stored file had never
  named took it for settled and drew **an empty chassis** — while reaching the same screen from
  another view worked. One map makes the two paths agree by construction.
- **`shownIn`, `zoneDraws` and `zoneTakesRoom` take `Arranged`** — `{ registry, view, views }` —
  where they took `{ registry, open }`. Passing the whole state still works.
- **`undraggedSizeOf(zone, spec)`** takes the leading panel rather than a registry and an id.
- **`readLayout` and `writeLayout` carry `LayoutState`**, which is now `{ views, lengths }`. That
  type was exported, described persistence, and had stopped being true.
- **`setView` is no longer on `usePanelsActions`.** Inside React the `view` prop is the one path;
  it remains on the store for a project driving the chassis from outside React.

### Changed

- **A withdrawn panel no longer empties its half.** It falls back to whatever is still declared
  for that half, and the choice is remembered: declare the panel again and the half is its once
  more. Before, hiding a panel behind a right, a route or a connection lost the arrangement for
  good — while an unknown id read back from storage survived as a half that was neither open nor
  closed. The two cases now answer the same way.
- **`settle` opens a half without naming a panel.** `ZoneSlots` gains `null` as a third state —
  the key absent is a closed half, `null` an open one that named nobody, an id a real choice.
  Only choices are stored, so an untouched half follows your declarations instead of freezing
  one screen's answer.
- **`show` on a panel already drawn only focuses it**, rather than writing its name down.
- **`register` and `unregister` are replaced by `declare(specs)`**, which posts the panels as a
  list. The list IS the order the rail stacks them in, so a panel that goes and comes back
  returns to its place instead of to the end.
- **Stored layouts are at version 2**, holding one entry per view. A version 1 file is read back
  as the default view — the upgrade costs nobody their layout.
- **The `view` prop is reconciled on every render**, not on a dependency change. It was
  controlled only when some unrelated prop happened to change identity, so a `defaultOpen`
  written inline and one hoisted into a constant gave opposite contracts.
- **The layout is written only when the arrangements or the lengths actually moved.** The store
  notifies on every write — a focus, a measure, each `pointermove` of a drag — and each of those
  used to re-serialise the whole file.

### Fixed

- **A view named after anything on `Object.prototype`** — `constructor`, `toString`, `__proto__` —
  was taken for settled and drew an empty chassis, then the first click froze the remaining half
  closed for good. `in` answers for the prototype chain; `Object.hasOwn` does not.
- **A stored view named `__proto__` was lost, and took the map's prototype with it.** `JSON.parse`
  makes it an own property, and assigning it on a plain object fires the setter — so a view named
  `left` would have inherited an arrangement that was not its own. No global pollution, measured.
- **`setView` and `reset` now settle on the spot.** Reachable only through a render, a view
  arrived at from outside React — a native menu, a socket — stayed unsettled, and a `reset` asked
  for by a button inside the chassis left the frame blank until some ancestor happened to
  re-render. The reset was not written to disk either, so the arrangement being escaped came back
  on reload.
- **A project bringing its own `store` was never handed the stored layout**, and overwrote the
  file on the first write — losing its arrangement on every launch for having built the store
  itself.
- **`view` no longer defaults**, so a project that never passes it keeps `setView` for itself. The
  prop claimed the view on every render, undoing an imperative call at the next unrelated render
  of some ancestor.
- **Replacing a `solo` panel no longer closes the half beside it.** When the solo panel led by
  fallback rather than by choice, showing anything in that zone rebuilt it from nothing.
- **A zone's divider is re-clamped even when its own length was never dragged.** `resize` and
  `resplit` write different keys, so parting a column without ever moving its edge left the
  divider past the bottom of a shrunken column, squeezing the first half to nothing.
- **A `defaultOpen` half written `undefined`** was drawn on the first launch and closed after a
  reload: `JSON` drops the key the three-state semantics rests on.
- **A band drawing nothing still reserved its height.** Two predicates in `clamps.ts` answered
  "is this zone open?" from the stored arrangement alone, without the registry — so a half left
  open on a panel the project no longer declares counted as drawing. The strip held 240 px under
  an empty band, every drag of the top zone was clamped against those 240, and the focus stayed
  on a zone that had stopped drawing. The question is now asked of `zoneTakesRoom`, which knows
  what is declared.

## [0.1.1] — 2026-09-01

Everything here is about what leaves the repository. The library itself did not change.

### Fixed

- **The published types were empty.** `dist/index.d.ts` contained `export { }` — the package
  typechecked in this repository and gave a consumer nothing at all. Declarations are emitted by
  `tsc` now, not by a bundler plugin.
- **`@pasquelin/panels/dockview` did not exist.** `exports` promised the subpath and the build
  never produced it; importing it failed at install time.
- **The stylesheet weighed 137 kB.** Dockview's own sheet had been merged into it, so every
  project paid for tabs it may never open. It belongs to Dockview, and the consumer loads it.
  Now 5.2 kB.
- **The types named `zustand`.** It is bundled, so no consumer has that package installed and
  their typecheck failed with TS2307 on a package that advertises no dependencies. The store's
  surface is declared directly.
- **The types named a stylesheet path that does not exist**, failing with TS2882 without
  `skipLibCheck`. The sheet has its own entry and `index.ts` no longer pulls it in.

### Changed

- Document tabs follow IA Studio's design, rule for rule: only the visible tab carries a
  background, tabs take the surfaces' radius and are parted by a margin, the title yields and the
  close button never does, and that button is a disc shown under the pointer.

### Added

- `--pnl-surface` (between the panel and its hovered state) and `--pnl-tab`, which the tab strip
  needs and the chassis had no equivalent for.

## [0.1.0] — 2026-09-01

First release.

- Five zones — `left`, `right`, `top`, `bottomLeft`, `bottomRight` — each cut in two halves, with
  icon rails on the edges and a centre that is the project's own.
- Resize by pointer or keyboard, clamped so the centre keeps its floor whether or not anything
  was ever dragged.
- The chassis measures its **container**, never the window, so it can live inside a page that
  already exists.
- Layout persisted to `localStorage` by default, or to any adapter.
- Headless underneath: every component is built on hooks that render nothing, and each piece is
  exported and replaceable on its own.
- Every visual value is a CSS custom property, declared at zero specificity so a project's
  palette always wins.
- Optional `@pasquelin/panels/dockview` entry point for document tabs.
- No runtime dependencies.

[0.4.1]: https://github.com/pasquelin/panels/releases/tag/v0.4.1
[0.4.0]: https://github.com/pasquelin/panels/releases/tag/v0.4.0
[0.3.4]: https://github.com/pasquelin/panels/releases/tag/v0.3.4
[0.3.3]: https://github.com/pasquelin/panels/releases/tag/v0.3.3
[0.3.2]: https://github.com/pasquelin/panels/releases/tag/v0.3.2
[0.3.1]: https://github.com/pasquelin/panels/releases/tag/v0.3.1
[0.3.0]: https://github.com/pasquelin/panels/releases/tag/v0.3.0
[0.2.0]: https://github.com/pasquelin/panels/releases/tag/v0.2.0
[0.1.1]: https://github.com/pasquelin/panels/releases/tag/v0.1.1
[0.1.0]: https://github.com/pasquelin/panels/releases/tag/v0.1.0
