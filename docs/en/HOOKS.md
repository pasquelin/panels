# Hooks

🇫🇷 [Cette page en français](../fr/HOOKS.md) · [← Index](README.md)

The components are built on these. Take them and draw your own frame, or use them from a header
that knows nothing about zones.

## `usePanels`

Everything a header, a shortcut or a menu needs.

```tsx
const { panels, reveal, close, toggle, isShown, focusedZone, reset } = usePanels<PanelId>()
```

| | |
| --- | --- |
| `panels` | Every declared panel, in declaration order |
| `reveal(id)` | Brings it up in the half it declared, and focuses its zone |
| `close(id)` | Closes **that** panel, or nothing |
| `toggle(id)` | What a rail icon does |
| `isShown(id)` | Whether it is on screen right now |
| `focusedZone` | The last zone clicked, or `null` |
| `reset()` | Back to the opening arrangement |

`close(id)` is asked about the panel, not the half: two panels share a half, and closing "the
half" would close whichever happened to be standing there and report success.

A header built on this follows the chassis whatever moves it — a rail click, a keyboard
shortcut, a socket message:

```tsx
function Header() {
  const { panels, isShown, toggle } = usePanels<PanelId>()

  return (
    <nav>
      {panels.map(panel => (
        <button key={panel.id} aria-pressed={isShown(panel.id)} onClick={() => toggle(panel.id)}>
          {panel.title}
        </button>
      ))}
    </nav>
  )
}
```

⚠️ It must be called **inside** `<Panels>`. A component that renders the chassis cannot also read
it — put the button in a child, or in a panel's `actions`.

## `useZone`

What one zone needs to draw itself.

```tsx
const { primary, secondary, draws, size, split, focused } = useZone<PanelId>('left')
```

`primary` and `secondary` are the panels the zone actually **draws**, which is not always what it
holds — a `solo` panel silences the other half. `size` is already bounded against the opposite
zone and the measured room.

## `useShownIn`, `useZoneDraws`, `useZoneTakesRoom`, `useBandHalves`

Smaller questions, for a frame of your own.

`useZoneTakesRoom` is not `useZoneDraws`: the band's two halves share one height, so either of
them drawing means the strip is taking that height. Ask the wrong one and a zone can be dragged
over room the band is already using.

## `useContainerFit`

Re-clamps the zones when your container changes size.

```tsx
const box = useRef<HTMLDivElement>(null)
useContainerFit(box)
```

Only needed if you build your own frame — `<Panels>` already does it, on the box the zones and
the centre share rather than on the whole chassis.

## Outside React

Build the store yourself and keep the reference:

```tsx
const store = createPanelsStore<PanelId>()

socket.on('alert', () => store.getState().show('alerts'))
window.electron?.onMenu(id => store.getState().show(id))

<Panels<PanelId> store={store}>…</Panels>
```

`store.getState()` gives the same actions the hooks call: `show`, `close`, `toggle`, `focus`,
`resize`, `resplit`, `resplitBand`, `fit`, `reset`.

## `usePanelsState`

Any slice, subscribed:

```tsx
const open = usePanelsState<PanelId, OpenByZone<PanelId>>(state => state.open)
```

Prefer scalar selectors. `lengths` and `available` are replaced wholesale on every write, so
subscribing to either as an object wakes your component on every frame of a drag.
