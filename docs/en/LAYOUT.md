# Layout

🇫🇷 [Cette page en français](../fr/LAYOUT.md) · [← Index](README.md)

```
┌──────────────────────────────────────────────────────────┐
│ header (yours, or nothing)                               │
├──┬────────────────────────────────────────────────────┬──┤
│  │                     top                            │  │
│R │────────────────────────────────────────────────────│R │
│A │  left      │                        │   right      │A │
│I │  primary   │                        │   primary    │I │
│L │  ┄┄┄┄┄┄┄   │        CENTRE          │   ┄┄┄┄┄┄┄    │L │
│  │  secondary │                        │   secondary  │  │
│  │────────────┴────────────────────────┴──────────────│  │
│  │  bottomLeft         ┊        bottomRight           │  │
├──┴────────────────────────────────────────────────────┴──┤
│ footer (yours, or nothing)                               │
└──────────────────────────────────────────────────────────┘
   ┄┄┄  handle between the two halves of a zone
   │    handle between a zone and the centre
   ┊    handle between the band's two halves
```

## Five zones, two halves each

`left`, `right`, `top`, `bottomLeft`, `bottomRight`. **A zone nobody fills takes no room at all** —
no width, no handle, nothing.

Each zone is cut in two: `primary` is the half nearest the window edge the zone hangs from — the
top of a side column, the left of the bottom strip.

## The band is one strip

`bottomLeft` and `bottomRight` share **one height**. Whichever of them is alone runs under the
opposite column; together they split the width, parted by a handle that starts at the middle.

That is also why a side column runs to the foot of the frame **unless** the band's half on its
side is drawing.

## The centre

Whatever you put in `<Panels.Center>`. It stays at the same place in the React tree through every
arrangement of the zones around it — moved, React would unmount it and take down whatever engine,
canvas or editor it holds.

## Resizing

Three handles, three different questions:

| Handle | Moves |
| --- | --- |
| Between a zone and the centre | the zone's own length |
| Between two halves of a zone | the divider inside it |
| Between the band's two zones | how they share the width |

Every one is a `role="separator"`, reachable with <kbd>Tab</kbd> and driven by the arrow keys — a
separator that only answers a pointer is a control a keyboard user cannot operate at all.

## The floors

| | |
| --- | --- |
| `MIN_SIZE` | 140 — smallest a zone may be dragged to |
| `MIN_CENTER` | 240 — room the centre always keeps |
| `MIN_SPLIT` | 100 — room a half keeps inside its zone |

A zone is bounded against **what the opposite zone already takes**. Capping each side at half the
container independently would let left and right add up to the full width, leaving the centre at
zero — and overflowing once the container shrinks.

That bound applies whether or not anything was ever dragged. Two untouched columns asking for 320
and 380 on a 900 px container do not leave the centre 104 px: they give ground in proportion to
what they asked for, so neither collapses while the other keeps its full width.

## It measures its container, not the window

The chassis observes **its own box**. Put it in a route, under your navigation, beside your
sidebar — the floors follow the box it is actually in.

This is what lets it be adopted a piece at a time in an application that already exists.

## Persistence

What is stored: which half holds which panel, in each view, and the sizes. That is all — and
only a real choice is written: a half nobody has touched is stored as open, naming nobody, so it
follows your declarations rather than freezing an answer.

```tsx
<Panels
  storageKey="my-app:layout"   // two chassis in one app need two keys
  storage={myStorage}          // or null to store nothing
>
```

Focus and the solo stash are session state and are deliberately not written down.

**When it is written:** at most once every 250 ms, then when the chassis unmounts and when the
page is hidden. A drag changes the sizes on every frame, and `localStorage` is synchronous — so
the writes are held rather than made, and one carries the latest state. A custom `write` is
therefore called rarely, and reading the storage right after an action may find it not written
yet.

A custom store is two functions:

```ts
const storage = {
  read: (key: string) => string | null,
  write: (key: string, value: string) => void,
}
```

A layout written by another version, or corrupted, is **dropped rather than half-read**: your
defaults are a deliberate arrangement and a broken one is not. Unknown zones, unknown slots and
values of the wrong type are discarded on the way in.
