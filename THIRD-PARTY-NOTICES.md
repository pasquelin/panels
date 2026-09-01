# Third-party notices

`@pasquelin/panels` is distributed under the MIT licence — see [LICENSE](LICENSE).

This file lists the third-party code it carries or requires, and reproduces the notices those
licences ask to be preserved. **Every dependency below is MIT**, so there is no copyleft
obligation and no conflict with this project's own licence.

---

## Bundled into the published package

Code that ships **inside** `dist/`, and whose notice therefore travels with this library.

### zustand

- Version: 5.0.15
- Licence: MIT
- Homepage: https://github.com/pmndrs/zustand

The chassis keeps its state in a zustand store, bundled so that consumers never have to install
or know about it. Its notice, reproduced in full as MIT requires:

```
MIT License

Copyright (c) 2019 Paul Henschel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Required, not bundled

Peer dependencies. They are installed by the consuming project, under their own licences, and no
part of them is copied here.

| Package | Licence | Required |
| --- | --- | --- |
| [react](https://github.com/facebook/react) | MIT | yes |
| [react-dom](https://github.com/facebook/react) | MIT | yes |
| [dockview-react](https://github.com/mathuo/dockview) | MIT | only for `@pasquelin/panels/dockview` |

---

## Used by the examples and the showcase only

None of this is published to npm — it builds the site under `examples/`.

| Package | Licence | Used for |
| --- | --- | --- |
| [react-router-dom](https://github.com/remix-run/react-router) | MIT | the `router` example |
| [dockview-react](https://github.com/mathuo/dockview) | MIT | the `dockview` example |
| [vite](https://github.com/vitejs/vite) · [vitest](https://github.com/vitest-dev/vitest) | MIT | build and tests |
| [typescript](https://github.com/microsoft/TypeScript) | Apache-2.0 | build only, nothing shipped |
| [eslint](https://github.com/eslint/eslint) · [prettier](https://github.com/prettier/prettier) | MIT | development only |

### Fonts

The showcase loads three families from Google Fonts, each under the
[SIL Open Font License 1.1](https://openfontlicense.org/):

- **Space Grotesk** — © Florian Karsten
- **IBM Plex Sans** — © IBM Corp.
- **JetBrains Mono** — © JetBrains s.r.o.

They are linked, not redistributed. The library itself embeds no font and sets no
`font-family`: it inherits whatever the host application uses.

---

## Keeping this file honest

Run `pnpm licences:check` after adding or upgrading a dependency. It reads the installed tree and
fails if anything is not MIT, or if a package is bundled without a notice here.
