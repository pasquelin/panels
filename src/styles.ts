/**
 * The stylesheet, as an entry point of its own.
 *
 * 🛑 Imported from `index.ts` instead, `tsc` carried `import './styles/panels.css'` into the
 * published declaration — where that path does not exist, so a consumer typechecking without
 * `skipLibCheck` got TS2882 on a package that had just installed cleanly.
 *
 * Here, the emitted declaration is empty and nothing leaks. Consumers import
 * `@pasquelin/panels/styles.css`, which is what the documentation already told them to do.
 */
import './styles/panels.css'
