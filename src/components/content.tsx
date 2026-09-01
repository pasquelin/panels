import { createContext, useContext, type ReactNode } from 'react'

/** What a declared panel renders, kept beside its spec rather than inside the store: React
 * nodes in a store make every subscriber re-render whenever a child changes. */
export type PanelContent = { content: ReactNode; actions?: ReactNode }

const ContentContext = createContext<ReadonlyMap<string, PanelContent>>(new Map())

export const ContentProvider = ContentContext.Provider

export function usePanelContent(id: string): PanelContent | undefined {
  return useContext(ContentContext).get(id)
}
