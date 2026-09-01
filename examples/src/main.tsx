import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The chassis' stylesheet, imported the way a consumer imports it — the library no longer pulls
// it in from `index.ts`, so that its declaration stays free of a path only the build knows.
import '@pasquelin/panels/styles.css'
import { Showcase } from './Showcase'
import './showcase.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing')

createRoot(root).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
