import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const here = import.meta.dirname

/**
 * The showcase and the four examples, built as one multi-page site.
 *
 * `base` is the repository name because GitHub Pages serves a project site under it. It is read
 * from the environment so a local `pnpm dev` still serves from the root.
 */
export default defineConfig(({ command }) => ({
  root: here,
  base: command === 'build' ? '/panel/' : '/',
  plugins: [react()],
  // The source, not the build: an example is also how the library is developed, and a `dist`
  // between the two means every change needs a build before it can be seen.
  resolve: {
    alias: {
      '@pasquelin/panels/dockview': resolve(here, '../src/dockview/index.ts'),
      '@pasquelin/panels': resolve(here, '../src/index.ts'),
    },
  },
  build: {
    outDir: resolve(here, '../dist-site'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        minimal: resolve(here, 'minimal/index.html'),
        router: resolve(here, 'router/index.html'),
        dockview: resolve(here, 'dockview/index.html'),
        theme: resolve(here, 'theme/index.html'),
      },
    },
  },
  server: { port: 5180 },
}))
