/* The chassis */
export { Panels, type PanelsProps } from './components/Panels'
export { Panel, type PanelProps } from './components/Panel'
export { Center, type CenterProps } from './components/Center'

/* The pieces, for a project that replaces one or builds its own frame on the hooks */
export { Rail, RailZone, type RailProps } from './components/Rail'
export { ZoneEdge, type ZoneEdgeProps } from './components/ZoneEdge'
export { Band, type BandProps } from './components/Band'
export { PanelFrame, type PanelFrameProps } from './components/PanelFrame'
export { Surface } from './components/Surface'
export { PanelHeader, type PanelHeaderProps } from './components/PanelHeader'
export { IconButton, type IconButtonProps } from './components/IconButton'
export { Separator, type SeparatorProps } from './components/Separator'
export { ResizeHandle, type ResizeHandleProps } from './components/ResizeHandle'
export { DEFAULT_LABELS, type PanelsLabels } from './components/labels'
export { usePanelContent, ContentProvider, type PanelContent } from './components/content'

/* Headless: the logic, with no rendering at all */
export {
  PanelsProvider,
  usePanelsStore,
  usePanelsState,
  usePanelsActions,
  type PanelsProviderProps,
} from './core/context'
export { usePanels, type PanelsApi } from './core/hooks/usePanels'
export {
  useArrangement,
  useBandHalves,
  useShownIn,
  useZoneDraws,
  useZoneTakesRoom,
} from './core/hooks/useArrangement'
export { useZone, useZonePanels, type ZoneView } from './core/hooks/useZone'
export { useContainerFit } from './core/hooks/useContainerFit'
export { usePointerDrag, type PointerDrag } from './core/hooks/usePointerDrag'

export {
  createPanelsStore,
  shownIn,
  specOf,
  zoneDraws,
  zoneTakesRoom,
  undraggedSizeOf,
  type PanelsState,
  type PanelsStore,
} from './core/store'

export {
  browserStorage,
  memoryStorage,
  readLayout,
  writeLayout,
  LAYOUT_VERSION,
  type LayoutStorage,
} from './core/persistence'

export {
  MIN_SIZE,
  MIN_CENTER,
  MIN_SPLIT,
  DEFAULT_SIZES,
  fitZoneSize,
  fitSplit,
  sharedSizes,
  sizeKeyOf,
} from './core/clamps'

export {
  ZONES,
  SLOTS,
  BOTTOM_ZONES,
  ZONES_BY_SIDE,
  type Side,
  isBottom,
  isHorizontal,
  isLeading,
  type Zone,
  type Slot,
  type PanelSpec,
  type ZoneSlots,
  type OpenByZone,
  type SizesByZone,
  type Lengths,
  type LayoutState,
} from './core/types'

export { cx } from './core/cx'
