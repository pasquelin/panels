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

`defaultOpen` is read once, and never against a layout that was restored — an arrangement the
reader made outranks a default.

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

## Adding and removing panels

The registry follows your JSX. A panel that stops being declared is unregistered, and the half it
occupied is emptied — a stored id naming a panel that no longer exists would otherwise leave a
frame with nothing to draw in it.

Conditional panels work as you would expect:

```tsx
{project && (
  <Panel id="git" zone="left" slot="secondary" title="History">…</Panel>
)}
```

This is how you express what a capability system would otherwise be for: a panel that should not
be offered is a panel you do not declare.
