import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Two entry points, and both must ship types.
 *
 * 🛑 The declarations are emitted by `tsc` (see the `types` script), not by a Vite plugin. The
 * plugin was here and cost two defects in a row: `rollupTypes` produced a bare `export { }` — a
 * package that typechecked here and gave a consumer nothing — and without it the files landed
 * under `dist/src/`, where `exports` does not look. `tsc --emitDeclarationOnly` puts them beside
 * the bundles, which is the one thing that had to be true.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(import.meta.dirname, 'src') } },
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        // Its own entry so its weight only lands on projects that import it.
        dockview: resolve(import.meta.dirname, 'src/dockview/index.ts'),
        // The stylesheet has an entry of its own, and is NOT imported by `index.ts`.
        //
        // 🛑 Imported there, `tsc` carried `import './styles/panels.css'` into the declaration,
        // where that path does not exist — a consumer typechecking without `skipLibCheck` got
        // TS2882 on a package that had just installed cleanly. The consumer imports
        // `@pasquelin/panels/styles.css`, which is what the documentation already said.
        styles: resolve(import.meta.dirname, 'src/styles.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Dockview is a peer: bundling it would put 400 kB in a package that says it has none.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'dockview-react'],
      output: { assetFileNames: 'styles.css' },
    },
  },
})
