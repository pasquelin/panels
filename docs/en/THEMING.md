# Theming

🇫🇷 [Cette page en français](../fr/THEMING.md) · [← Index](README.md)

Every value is a custom property on the chassis root. There is no theming API beyond this,
because it does not need one.

```css
.pnl-root {
  --pnl-panel: #101418;
  --pnl-accent: #47965c;
  --pnl-radius: 10px;
}
```

Scope it however you like — a class on `<Panels>`, an ancestor, `:root`. The chassis reads the
computed value, so anything that reaches it works.

```tsx
<Panels className="my-theme">
```

## The tokens

### Surfaces

| Token | Default (dark) | |
| --- | --- | --- |
| `--pnl-chassis` | `#2b2d30` | The frame |
| `--pnl-panel` | `#191a1c` | The surfaces laid on it |
| `--pnl-elevated` | `#3c3f44` | Hover, and an active rail icon |
| `--pnl-border` | `#34363a` | Separators |
| `--pnl-text` | `#dfe1e5` | |
| `--pnl-muted` | `#91959b` | Secondary text, idle icons |

**Panels are darker than the chassis.** That inversion is the one visual idea the library is
built on — it is what reads as "panels on a frame" rather than as a web page. Invert it back by
repainting two tokens; nothing else assumes a direction.

### Accent

| Token | Default | |
| --- | --- | --- |
| `--pnl-accent` | `#346ef2` | What is **actioned**: an active icon in the focused zone |
| `--pnl-accent-text` | `#ffffff` | What is written on it |

Set `--pnl-accent` on any ancestor and the chassis takes your brand instead of imposing one.

The default is a placeholder, and the contrast of **your** accent is yours to check: white on it
needs 4.5:1 for a word, 3:1 for a glyph that informs.

### Gauges

| Token | Default | |
| --- | --- | --- |
| `--pnl-rail` | `48px` | Rail width |
| `--pnl-rail-button` | `36px` | Rail icon button |
| `--pnl-rail-inset` | `14px` | |
| `--pnl-gutter` | `6px` | The space between surfaces, **which is the resize area** |
| `--pnl-header` | `40px` | Panel title row |
| `--pnl-radius` | `6px` | |
| `--pnl-radius-sm` | `4px` | |
| `--pnl-font-size` | `13px` | |

The gutter is not decoration: it **is** where the pointer resizes. Widening it widens the target.

## Light, dark, and following the reader

Left alone, the chassis follows `prefers-color-scheme`. Force it:

```tsx
<Panels theme="dark">   // or "light"
```

The light palette is the **mirror** of the dark one, not its inversion: surfaces stand apart from
the chassis by being lighter, with the chassis as a grey gutter around white panels.

## Why your palette always wins

Every default token is declared inside `:where()`, which carries **no specificity**. Anything you
write — a class, an id, an element selector — outranks it, whatever order the stylesheets load in.

This was a bug once: the defaults sat on `.pnl-root:not([data-pnl-theme='light'])`, which
outscores any single class, so a project's palette applied in the dark and vanished the moment
the reader's system asked for the light one. A guard now reads the stylesheet to keep it at zero.

## Beyond colour

If tokens are not enough, every piece is exported and replaceable on its own — see
[Components](COMPONENTS.md). And if you want none of the rendering, the
[hooks](HOOKS.md) draw nothing at all.
