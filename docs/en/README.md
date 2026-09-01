# @pasquelin/panels — documentation

A React panel chassis: icon rails on the edges, resizable zones around a centre that is yours,
and a layout that survives a reload.

🇫🇷 [Cette page en français](../fr/README.md)

| | |
| --- | --- |
| [Panels](PANELS.md) | Declaring a panel: zone, slot, icon, `opens`, `solo` |
| [Layout](LAYOUT.md) | Zones, halves, resizing, and the floors that protect the centre |
| [Hooks](HOOKS.md) | Driving the chassis, from React and from outside it |
| [Theming](THEMING.md) | Every token, and how a project imposes its own palette |
| [Components](COMPONENTS.md) | The pieces, and replacing them one at a time |
| [Document tabs](DOCKVIEW.md) | The optional Dockview centre |
| [Recipes](RECIPES.md) | Electron, an existing page, keyboard shortcuts, testing |
| [Architecture](../ARCHITECTURE.md) | How it works inside |

## Install

```bash
pnpm add @pasquelin/panels
```

React 19 is a peer dependency. Nothing else is required.

## The smallest thing that works

```tsx
import { Panels, Panel } from '@pasquelin/panels'
import '@pasquelin/panels/styles.css'

type PanelId = 'files' | 'notes'

export function App() {
  return (
    <Panels<PanelId>>
      <Panel<PanelId> id="files" zone="left" title="Files" icon={<FilesIcon />}>
        <FileTree />
      </Panel>

      <Panel<PanelId> id="notes" zone="right" title="Notes" icon={<NoteIcon />}>
        <Notes />
      </Panel>

      <Panels.Center>
        <YourApp />
      </Panels.Center>
    </Panels>
  )
}
```

That is the whole of it. The rails, the resize handles, the persistence and the keyboard are
already there.

`<Panels>` fills its parent, so give that parent a height — `height: 100%` up to the root, or a
grid cell, or a flex child. A chassis in a box of no height draws nothing.

## What it is not

It is a **layout**, not a framework. It draws the frame and remembers the sizes; what goes in the
panels is your project's business. There is no state management, no data layer, no icon set, no
i18n, and no opinion about what the centre holds.

## Type parameter

Every component takes the union of your panel ids:

```tsx
type PanelId = 'files' | 'search' | 'notes'

<Panels<PanelId>> … </Panels>
const { reveal } = usePanels<PanelId>()
```

Skip it and the ids fall back to `string`, which still works — you lose the compiler catching
`reveal('note')` when the panel is called `notes`.
