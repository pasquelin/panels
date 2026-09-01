# Changelog

All notable changes to `@pasquelin/panels`.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.1]: https://github.com/pasquelin/panels/releases/tag/v0.1.1
[0.1.0]: https://github.com/pasquelin/panels/releases/tag/v0.1.0
