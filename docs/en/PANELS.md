# Panels

🇫🇷 [Cette page en français](../fr/PANELS.md) · [← Index](README.md)

A panel is declared with `<Panel>`, which is a **descriptor**: it is never rendered where you
write it. `<Panels>` reads its props to build the rail and hands its children to the zone it
named.

```tsx
<Panel<PanelId>
  id="files"
  zone="left"
  slot="primary"
  title="Files"
  icon={<FilesIcon />}
  actions={<RefreshButton />}
  opens={320}
>
  <FileTree />
</Panel>
```

## Props

| Prop | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique, and the type parameter of `<Panels>` |
| `zone` | yes | `left`, `right`, `top`, `bottomLeft`, `bottomRight` |
| `slot` | no | `primary` (nearest the edge) or `secondary`. Defaults to `primary` |
| `title` | yes | Accessible name and header title, **already translated** |
| `icon` | no | Anything React renders. No icon set is imposed |
| `actions` | no | Rendered on the panel's own title row, beside its name |
| `opens` | no | The size this panel wants when it leads its zone |
| `solo` | no | Takes the zone whole. `primary` only |

## Sharing a half

Two panels with the same `zone` and the same `slot` **take turns**: the rail switches between
them, and only one is on screen at a time.

```tsx
<Panel id="files" zone="left" title="Files">…</Panel>
<Panel id="search" zone="left" title="Search">…</Panel>
```

To show them **together**, stacked, put the second in the other half:

```tsx
<Panel id="files" zone="left" title="Files">…</Panel>
<Panel id="outline" zone="left" slot="secondary" title="Outline">…</Panel>
```

The rail draws the same cut as a separator: icons above it open in the first half, icons below in
the second. The rail is the legend of the column.

## Which panel opens first

A half with nothing chosen opens on the **first panel declared for it**. Declaration order is
therefore meaningful: put the panel a reader should land on first.

To open somewhere else, name the halves yourself:

```tsx
<Panels<PanelId> defaultOpen={{ left: { primary: 'search' } }}>
```

`defaultOpen` is read once per view, and never against a layout that was restored — an
arrangement the reader made outranks a default.

## `opens`

A zone has a width of its own (320 for `left`, 260 for `right`, 180 for `top`, 240 for the band).
A panel that needs more says so:

```tsx
<Panel id="chat" zone="right" title="Assistant" opens={460}>
```

A size the reader dragged always wins over it: a length somebody chose is an answer about the
column, not about the panel that happened to be in it.

## `solo`

A `solo` panel takes its zone **whole**; the other half draws nothing while it is up.

```tsx
<Panel id="chat" zone="right" title="Assistant" solo opens={460}>
```

The half it silences is **put away, not closed**. Close the solo panel and what was there comes
back untouched. That stash is never persisted: a column reopening by itself days later, on an
arrangement nobody remembers making, is not a restoration.

`solo` only applies to `primary`.

## `fillActions`

A panel in a horizontal zone gets the header's free width for its actions — right for a montage
bar, wrong for a band holding a list with two buttons. Say which yours is:

```tsx
<Panel id="problems" zone="bottomRight" title="Problems" fillActions={false} actions={…}>
```

## Adding and removing panels

The registry follows your JSX, in the order you declare it. A panel that stops being declared
leaves the rail, and the half it held **falls back** to whatever is still declared for it — it is
not closed, and the choice is not forgotten. Declare the panel again and the half is its once
more, in the place it had.

Conditional panels work as you would expect:

```tsx
{project && (
  <Panel id="git" zone="left" slot="secondary" title="History">…</Panel>
)}
```

This is how you express what a capability system would otherwise be for: a panel that should not
be offered is a panel you do not declare. And because a withdrawal costs nothing, a panel may go
and come back as often as a right, a route or a connection does.

## Views

Two parts of one application may want their own arrangement — an editor and a review screen, a
project and a dashboard. Name the one in front, and each keeps the panels it had open:

```tsx
<Panels<PanelId> view={reviewing ? 'review' : 'edit'}>
```

Closing a column in one view leaves it open in the other, and coming back finds it as it was
left. The **lengths are shared**: a column that changed width on the way to another view would
read as another window.

Left out, everything lands in one view and nothing about this is visible. Views cost nothing to
ignore, and a project that grows into a second one only has a prop to pass.

The prop is **controlled**: it is reconciled on every render, so `setView` called behind its back
is taken over on the next one. And views are never evicted — name the handful of screens that own
an arrangement rather than every route, or `view={location.pathname}` grows one stored entry per
URL, for ever.

## Moving panels

A reader may drag a rail icon into another half — the other half of the same column, the opposite
column, either end of the band. Every half a rail draws will take a drop, and the empty ones show
themselves for as long as a panel is being carried.

Anywhere in a rail is a drop: the half a panel lands in is whichever of that rail's own is
**nearest** the pointer, not the one it happens to be over. A half is only as tall as the icons
standing in it, and a reader aiming at the space below the last one is aiming at that half.

A zone holding **nothing** offers one place to land rather than two: `primary` and `secondary` are
only two destinations once something stands in the zone to be above or below.

It is **off by default**: a chassis whose icons move under the pointer is not what every project
wants.

```tsx
<Panels<PanelId> draggablePanels>
```

The panel keeps the zone and the half it was dropped in, and that choice is stored with the rest
of the layout. Your declaration is not overwritten — it is what the panel falls **back** to. Drop
a panel where the project already put it and the override is dropped rather than written down as
a coincidence, so the panel follows the declaration again the day you move it.

A panel that was on screen when it was picked up is on screen where it lands. One that was not
moves on paper alone: opening a column the reader never asked for is a strange way to answer a
drag.

`solo` panels always land in `primary`, whichever half they are dropped in — a solo panel silences
the other half, and one sitting in `secondary` would silence the half it stands in.

## `placementScope`

Where the panels sit follows `view`, unless you say otherwise:

```tsx
<Panels<PanelId> view={reviewing ? 'review' : 'edit'} placementScope="shared" draggablePanels>
```

The two views then keep their own **open panels** while sharing one **arrangement of the rails**:
a reader who moves Search under Files does it once, not once per screen. Left out, each view
arranges its own rails.

## Moving a panel from your own code

`movePanel` is on the store and on `usePanelsActions`, for a menu, a shortcut or a test:

```tsx
store.getState().movePanel('files', { zone: 'right', slot: 'secondary' }, 0)
```

The last argument is the position **inside that half**, counted among the panels already there —
`0` puts it first, anything past the end puts it last.
