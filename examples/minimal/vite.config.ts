import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = resolve(import.meta.dirname, '.')

export default defineConfig({
  root,
  plugins: [react()],
  // The source, not the build: an example is also how the library is developed, and a `dist`
  // between the two means every change needs a build before it can be seen.
  resolve: { alias: { '@pasquelin/panels': resolve(root, '../../src/index.ts') } },
  server: { port: 5180, open: true },
})
