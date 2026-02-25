import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'

export function TopBar() {
  const { header } = usePageHeader()
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const breadcrumb = header.breadcrumb ?? []

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        {breadcrumb.length ? (
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {breadcrumb.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href ? (
                  <Link className="transition hover:text-slate-900" to={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 ? <span>/</span> : null}
              </div>
            ))}
          </nav>
        ) : null}
        <div className="mt-2 text-2xl font-semibold text-slate-900">{header.title}</div>
        {header.subtitle ? (
          <div className="text-sm text-slate-500">{header.subtitle}</div>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Separator orientation="vertical" className="hidden h-8 md:block" />
        <Button variant="outline" onClick={clearCredentials}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  )
}
