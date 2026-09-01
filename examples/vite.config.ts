import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const here = import.meta.dirname

/**
 * Les cinq démos, bâties comme un site multipages.
 *
 * La vitrine n'en fait plus partie : elle est du HTML rendu par `site/build.mjs`, une fois
 * par langue. Ce qui reste ici tourne pour de bon — dont `hero`, le chassis que la vitrine
 * embarque dans son cadre.
 *
 * La sortie va dans `examples/dist`, que `site/build.mjs` recopie sous `_site/examples/`
 * d'après `repo.config.json` : ce fichier n'a donc rien à savoir de l'arborescence publiée.
 */
export default defineConfig(({ command }) => ({
  root: here,
  // GitHub Pages sert un site de projet sous le nom du dépôt, et les démos sous `examples/`.
  // Lu depuis la config plutôt qu'écrit ici, un `pnpm dev` sert toujours depuis la racine.
  base: command === 'build' ? '/panels/examples/' : '/',
  plugins: [react()],
  // La source, pas le build : un exemple est aussi la façon dont la librairie se développe,
  // et un `dist` entre les deux impose un build avant de voir le moindre changement.
  resolve: {
    alias: {
      '@pasquelin/panels/styles.css': resolve(here, '../src/styles/panels.css'),
      '@pasquelin/panels/dockview': resolve(here, '../src/dockview/index.ts'),
      '@pasquelin/panels': resolve(here, '../src/index.ts'),
    },
  },
  build: {
    outDir: resolve(here, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        hero: resolve(here, 'hero/index.html'),
        minimal: resolve(here, 'minimal/index.html'),
        router: resolve(here, 'router/index.html'),
        dockview: resolve(here, 'dockview/index.html'),
        theme: resolve(here, 'theme/index.html'),
      },
    },
  },
  // `site/tokens.css` est importé par `examples/src/demo.css` et vit hors du root de Vite :
  // une seule palette pour la page et pour le chassis qu'elle encadre, plutôt que deux
  // copies à retoucher ensemble.
  server: { port: 5180, fs: { allow: [resolve(here, '..')] } },
}))
