# Recipes

🇫🇷 [Cette page en français](../fr/RECIPES.md) · [← Index](README.md)

## Inside an application that already exists

The chassis measures **its own container**, so it does not have to own the window.

```tsx
<div className="my-app">
  <MyNavigation />
  <section style={{ flex: 1, minHeight: 0 }}>
    <Panels<PanelId>>…</Panels>
  </section>
</div>
```

The only requirement is that the box has a height. `minHeight: 0` on a flex child is the usual
missing piece — without it the child refuses to shrink and the chassis overflows.

## A header that is entirely yours

`<Panels>` draws no chrome. Pass your own, or nothing:

```tsx
<Panels header={<MyHeader />} footer={<MyStatusBar />}>
```

Anything inside them can drive the chassis with [`usePanels`](HOOKS.md) — it does not need to
know what a zone is.

## Electron

Nothing is Electron-specific, but two things are worth wiring.

**The native menu**, which lives in the main process and cannot call a hook:

```tsx
const store = createPanelsStore<PanelId>()

window.electron.onMenuItem(id => store.getState().show(id))

<Panels<PanelId> store={store}>…</Panels>
```

**Persistence to disk** rather than `localStorage`:

```tsx
<Panels
  storage={{
    read: key => window.electron.readLayout(key),
    write: (key, value) => window.electron.writeLayout(key, value),
  }}
>
```

A frameless window's drag region is your header's business: put `WebkitAppRegion: 'drag'` on it,
and `'no-drag'` on the controls inside.

## Keyboard shortcuts

```tsx
function Shortcuts() {
  const { toggle } = usePanels<PanelId>()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'b') toggle('files')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  return null
}
```

Render it inside `<Panels>`, like any other consumer of the hook.

## Two chassis in one application

Give them different storage keys, or they overwrite each other's layout:

```tsx
<Panels storageKey="app:main">…</Panels>
<Panels storageKey="app:report">…</Panels>
```

Each `<Panels>` makes its own store; nothing is shared between them.

Two chassis is not the same question as two **views**. Two chassis are two frames on screen at
once; two views are one frame that two parts of the application arrange differently — see
`view` in [PANELS](PANELS.md#views), which keeps the lengths shared.

## Testing

The chassis is ordinary React. Give it a storage that forgets, so one test cannot leak into the
next:

```tsx
import { memoryStorage } from '@pasquelin/panels'

render(
  <Panels storage={memoryStorage()}>
    <Panel id="files" zone="left" title="Files">
      <p>file list</p>
    </Panel>
  </Panels>,
)

await user.click(screen.getByRole('button', { name: 'Files' }))
```

Everything is reachable by role: the rail is a `toolbar`, panels are `region`s named by their
title, handles are `separator`s.

Note that jsdom lays nothing out, so `useContainerFit` measures zero and the zones keep the sizes
they ask for. That is enough to test what is open and what is not; it is not enough to test the
floors — those are unit-tested against `sharedSizes` instead.

## Server rendering

The chassis reads `localStorage` and measures the DOM, so it belongs on the client. Under
Next.js, mark the file `'use client'`; there is nothing useful to render on the server anyway,
since the layout is the reader's own.
