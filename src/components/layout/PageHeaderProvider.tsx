import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderState {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
}

interface PageHeaderContextValue {
  header: PageHeaderState
  setHeader: (header: PageHeaderState) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | undefined>(undefined)

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderState>({
    title: 'Dashboard',
  })

  const setHeader = useCallback((next: PageHeaderState) => {
    setHeaderState(next)
  }, [])

  const value = useMemo(
    () => ({
      header,
      setHeader,
    }),
    [header, setHeader],
  )

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>
}

export function usePageHeader() {
  const ctx = useContext(PageHeaderContext)
  if (!ctx) {
    throw new Error('usePageHeader must be used within PageHeaderProvider')
  }
  return ctx
}
