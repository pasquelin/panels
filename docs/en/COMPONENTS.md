# Components

🇫🇷 [Cette page en français](../fr/COMPONENTS.md) · [← Index](README.md)

Three levels of adoption, and you can stop at any of them: take the chassis whole, replace a
piece, or take only the [hooks](HOOKS.md) and draw everything yourself.

## What is exported

| | |
| --- | --- |
| `Panels` | The chassis. Collects the descriptors and assembles the frame |
| `Panel` · `Center` | Descriptors. Never rendered where they are written |
| `Rail` · `RailZone` | The icon rail, and one zone's group of icons |
| `ZoneEdge` | A zone: its two halves and its handle |
| `Band` | The bottom strip, and its two zones |
| `PanelFrame` | One panel on screen: surface, title row, body |
| `Surface` | The rounded box |
| `PanelHeader` | The title row |
| `IconButton` | The rail's button, and the header's |
| `Separator` · `ResizeHandle` | |
| `DEFAULT_LABELS` | Every word the chassis says |

## Replacing a piece

Build your own frame out of the ones you keep:

```tsx
import { PanelsProvider, Rail, ZoneEdge, useBandHalves } from '@pasquelin/panels'

function MyChassis({ children }) {
  const band = useBandHalves()

  return (
    <PanelsProvider>
      <div className="my-frame">
        <MyOwnRail side="left" />
        <ZoneEdge zone="left" labels={MY_LABELS} />
        <main>{children}</main>
        <Rail side="right" />
      </div>
    </PanelsProvider>
  )
}
```

`<Panels>` is itself only a provider plus an arrangement of these pieces — there is nothing in it
you cannot write yourself.

## Words

The chassis says four things. They are English by default; pass your own, already translated:

```tsx
<Panels
  labels={{
    closePanel: 'Fermer le panneau',
    resizeZone: 'Redimensionner la zone',
    resizeSplit: 'Redimensionner les deux panneaux',
    resizeBand: 'Redimensionner la bande',
  }}
>
```

The library carries **no i18n**. A key would impose a namespace on every project that installs
it, and translation is something your application already knows how to do.

## Class names

Every class is prefixed `pnl-`. They are part of the public surface — style them, override them,
target them in tests:

```
pnl-root · pnl-middle · pnl-columns · pnl-row · pnl-stack · pnl-centre
pnl-rail · pnl-rail__group · pnl-rail__button
pnl-zone · pnl-band · pnl-surface · pnl-body
pnl-header · pnl-header__title · pnl-header__actions · pnl-header__trailing
pnl-icon-button · pnl-separator · pnl-handle
```

## Accessibility

What the chassis does for you:

- the rail is a `role="toolbar"`, its buttons carry `aria-pressed`
- every panel is a `<section>` named by its title
- every handle is a `role="separator"` with `aria-orientation`, `aria-valuenow` and its bounds,
  focusable and driven by the arrow keys
- the focus ring is visible and `prefers-reduced-motion` is respected

What is yours: the contrast of your palette, and the accessible names of whatever you put inside
the panels.

## Drawing the buttons yourself

The chassis draws two buttons you never reach: the rail's, and a panel header's close. Replace
them rather than configure them — a tooltip, a shortcut hint, a badge belong to your design
system, not to a layout library.

```tsx
<Panels components={{ IconButton: MyIconButton }}>
```

`MyIconButton` receives `IconButtonProps`: `icon`, `label`, `active`, `accented`, `acts`,
`onClick`, plus anything else you spread. `acts` tells the close button from a rail toggle.

Read **once**, like `storage`: an object written inline changes identity on every render, and
every panel would re-render with it.
