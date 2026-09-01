import { createContext, useContext, type ComponentType } from 'react'
import { IconButton, type IconButtonProps } from '../components/IconButton'

/**
 * The pieces a project may draw itself, where the chassis would otherwise draw them in the
 * middle of a rail it owns.
 *
 * One entry today, and the shape is what lets there be more without breaking anyone. The
 * library keeps its promise by NOT growing props for what a design system owns — a tooltip, a
 * shortcut hint, a badge: those live on the button, and the button is replaceable.
 */
export type PanelsComponents = {
  /** The rail's buttons and the panel header's close button. See `IconButtonProps`. */
  IconButton: ComponentType<IconButtonProps>
}

const DEFAULTS: PanelsComponents = { IconButton }

const ComponentsContext = createContext<PanelsComponents>(DEFAULTS)

export const ComponentsProvider = ComponentsContext.Provider

/** Defaults outside a chassis, so `<Rail>` and `<PanelFrame>` stand on their own. */
export function usePanelsComponents(): PanelsComponents {
  return useContext(ComponentsContext)
}

export function withDefaults(components: Partial<PanelsComponents> | undefined): PanelsComponents {
  return components === undefined ? DEFAULTS : { ...DEFAULTS, ...components }
}
