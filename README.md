# @pasquelin/panels

**[Live demo ↗](https://pasquelin.github.io/panels/)** · **[Documentation 🇫🇷](docs/fr/README.md)** · **[Documentation 🇬🇧](docs/en/README.md)** · MIT

A React panel chassis: icon rails on the edges, resizable zones around a free centre, and a
layout that survives a reload.

It is a **layout, not a framework**. What goes in the panels is your project's business — the
library draws the frame, remembers the sizes, and gets out of the way.

```bash
pnpm add @pasquelin/panels
```

```tsx
import { Panels, Panel } from '@pasquelin/panels'
import '@pasquelin/panels/styles.css'

type PanelId = 'files' | 'chat'

export function App() {
  return (
    <Panels<PanelId>>
      <Panel<PanelId> id="files" zone="left" title="Files" icon={<FilesIcon />}>
        <FileTree />
      </Panel>

      <Panel<PanelId> id="chat" zone="right" title="Assistant" icon={<ChatIcon />}>
        <Conversation />
      </Panel>

      <Panels.Center>
        <Outlet />
      </Panels.Center>
    </Panels>
  )
}
```

That is the whole of it. The rails, the resize handles, the persistence and the keyboard are
already there.

## What you get

- **Five zones** — `left`, `right`, `top`, `bottomLeft`, `bottomRight`. A zone nobody fills takes
  no room at all. `top` is a band across the width and has no rail of its own: the project opens
  and closes it.
- **Two halves per zone** — `primary` and `secondary`, parted by a handle. Panels sharing a half
  take turns; the rail switches between them.
- **Icon rails** that stay put when a zone closes, so a closed panel is always one click away.
- **Resize** by pointer or keyboard, clamped so the centre never disappears.
- **Persistence** to `localStorage` out of the box, or wherever you say.
- **Draggable rail icons**, opt-in: `draggablePanels` lets a reader move a panel into another
  half, and where they put it is remembered.
- **Typed ids** — `reveal('chatt')` does not compile.
- **No dependencies** beyond React. No icon set, no CSS framework, no i18n.

## Panel props

| Prop | Meaning |
| --- | --- |
| `id` | Unique, and the type parameter of `<Panels>` |
| `zone` | Which edge it hangs from |
| `slot` | `primary` (nearest the edge) or `secondary`. Defaults to `primary` |
| `title` | Accessible name and header title, **already translated** |
| `icon` | Anything React renders — the library imposes no icon set |
| `actions` | Rendered on the panel's own title row |
| `opens` | The width this panel wants when it leads its zone |
| `solo` | Takes the zone whole; the other half is put away, not closed, and comes back |

## Driving the panels from anywhere

`usePanels()` is all a header, a shortcut or a menu needs:

```tsx
const { panels, reveal, close, toggle, isShown } = usePanels<PanelId>()
```

From **outside React** — a socket message, an Electron menu — build the store yourself and keep
the reference:

```tsx
const store = createPanelsStore<PanelId>()

socket.on('alert', () => store.getState().show('alerts'))

<Panels<PanelId> store={store}>…</Panels>
```

## Making it yours

Three levels, and you can stop at any of them.

**1. Repaint it.** Every value is a custom property on `.pnl-root`:

```css
.pnl-root {
  --pnl-panel: #101418;
  --pnl-chassis: #1b1f24;
  --pnl-accent: #47965c; /* the rails follow your brand */
  --pnl-radius: 10px;
  --pnl-rail: 56px;
}
```

**2. Replace a piece.** `Rail`, `PanelHeader`, `ResizeHandle`, `Surface`, `IconButton` and the
rest are exported. Build your own frame out of the ones you keep.

**3. Take the logic only.** Every component is built on hooks that render nothing:

```tsx
const zone = useZone('left') // what it draws, its size, its split
const { reveal, isShown } = usePanels()
useContainerFit(ref) // re-clamps when the container resizes
```

Draw whatever you like on top. The chassis has no opinion about it.

## It fits inside your page

The chassis measures **its own container**, never the window. Put it in a route, under your
navigation, beside your sidebar — the clamps follow the box it is actually in.

## Header and footer are yours

`<Panels>` draws no chrome. `header` and `footer` are slots; pass your own, or nothing. Where a
project's panels come from — a router, a state machine, a config — is that project's business.

## Examples

All four run at **[pasquelin.github.io/panels](https://pasquelin.github.io/panels/)**, or locally:

```bash
pnpm dev
```

- `examples/minimal` — the smallest working chassis
- `examples/router` — the centre as a React Router outlet
- `examples/dockview` — document tabs, on the optional Dockview entry point
- `examples/theme` — the same chassis under four palettes

## Documentation

| | 🇫🇷 Français | 🇬🇧 English |
| --- | --- | --- |
| **Guide + index** | [docs/fr/](docs/fr/README.md) | [docs/en/](docs/en/README.md) |
| Panels | [PANELS.md](docs/fr/PANELS.md) | [PANELS.md](docs/en/PANELS.md) |
| Layout | [LAYOUT.md](docs/fr/LAYOUT.md) | [LAYOUT.md](docs/en/LAYOUT.md) |
| Hooks | [HOOKS.md](docs/fr/HOOKS.md) | [HOOKS.md](docs/en/HOOKS.md) |
| Theming | [THEMING.md](docs/fr/THEMING.md) | [THEMING.md](docs/en/THEMING.md) |
| Components | [COMPONENTS.md](docs/fr/COMPONENTS.md) | [COMPONENTS.md](docs/en/COMPONENTS.md) |
| Document tabs | [DOCKVIEW.md](docs/fr/DOCKVIEW.md) | [DOCKVIEW.md](docs/en/DOCKVIEW.md) |
| Recipes | [RECIPES.md](docs/fr/RECIPES.md) | [RECIPES.md](docs/en/RECIPES.md) |
| Architecture | [ARCHITECTURE.md](docs/ARCHITECTURE.md) | — |

For coding agents: [`llms.txt`](llms.txt) is the mental model, the API and the traps in one
page; [`llms-full.txt`](llms-full.txt) is every English chapter concatenated. Both ship with the
package, and `pnpm llms` regenerates the second from the first plus `docs/`.

## Releasing

`main` is production; `develop` is where work lands. A release is a tag:

```bash
npm version patch      # or minor / major — bumps, commits, tags
git push --follow-tags
```

The tag triggers `release.yml`, which checks that it matches `package.json`, replays
`pnpm validate`, builds, and publishes to npm with a signed provenance attestation — over OIDC,
with no token anywhere. See [CHANGELOG.md](CHANGELOG.md) for what shipped.

## Licence

**MIT** — see [LICENSE](LICENSE).

Every dependency is MIT too, so there is no copyleft obligation anywhere in the tree.
`zustand` is bundled into the published package and its notice travels with it; everything else
is a peer dependency the consuming project installs itself. The full accounting is in
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), and `pnpm licences:check` fails the build if it
stops being true.
