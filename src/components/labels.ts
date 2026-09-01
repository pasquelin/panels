/**
 * Every word the chassis puts on screen or announces. Already translated: the library carries
 * no i18n, and a key would impose a namespace on every project that installs it.
 */
export type PanelsLabels = {
  closePanel: string
  resizeZone: string
  resizeSplit: string
  resizeBand: string
}

/** English, so the library works before a project has said anything about words. */
export const DEFAULT_LABELS: PanelsLabels = {
  closePanel: 'Close panel',
  resizeZone: 'Resize panel area',
  resizeSplit: 'Resize the two panels',
  resizeBand: 'Resize the bottom panels',
}
