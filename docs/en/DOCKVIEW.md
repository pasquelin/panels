# Document tabs

🇫🇷 [Cette page en français](../fr/DOCKVIEW.md) · [← Index](README.md)

The centre is a free slot: a router outlet, a canvas, a map. If you want **document tabs** —
draggable, splittable, stackable — the library ships an adapter over
[Dockview](https://dockview.dev).

It is a **separate entry point**, so its weight only lands on the projects that want it.

```bash
pnpm add dockview-react
```

```tsx
import { DockviewCenter } from '@pasquelin/panels/dockview'

function Editor({ params }) {
  return <FileView name={params.name as string} />
}

const DOCUMENTS = { editor: Editor }

<Panels.Center>
  <DockviewCenter
    documents={DOCUMENTS}
    empty={NothingOpen}
    layout={stored}
    onLayout={setStored}
    onReady={setApi}
  />
</Panels.Center>
```

| Prop | |
| --- | --- |
| `documents` | What each kind renders, keyed by the component name a panel asks for |
| `empty` | Drawn while nothing is open. Without one, Dockview shows a bare watermark |
| `layout` | A layout to restore, as `api.toJSON()` gave it |
| `onLayout` | Called whenever the arrangement changes |
| `onReady` | The api, for opening documents from outside |

## Opening a document

```tsx
const open = (name: string) => {
  const held = api.getPanel(name)
  if (held) return held.api.setActive()   // already open: bring it forward

  api.addPanel({ id: name, component: 'editor', title: name, params: { name } })
}
```

## Panels never enter the centre

The rule the whole chassis is built on. **A document has a name; a panel has an icon.**

Documents are things a person opens and closes, and they wear a tab that carries their name.
Panels are switched from the rail and wear an icon. Mixing them gives you a window where nothing
tells you what is a file and what is a tool.

## Theming

The adapter dresses Dockview in the chassis' tokens: repaint `--pnl-panel` and the tab strip
follows. Without it you would get Dockview's default navy in the middle of your palette.

## Restoring a layout

Dockview throws on a layout naming a component it cannot find. A refused one is **dropped**, and
`onLayout(undefined)` is called so you can forget it — kept, it would fail again at every launch.
