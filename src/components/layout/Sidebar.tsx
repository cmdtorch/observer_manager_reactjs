import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  Layers,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/api-keys', label: 'API Keys', icon: KeyRound },
  { to: '/applications', label: 'Applications', icon: Layers },
  { to: '/telegram', label: 'Telegram Groups', icon: MessageSquare },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col bg-slate-950 px-6 py-8 text-slate-200',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-semibold">
          OM
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Observer Manager</div>
          <div className="text-xs text-slate-400">Admin console</div>
        </div>
      </div>
      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white',
                  isActive && 'bg-white text-slate-900',
                )
              }
              end={item.to === '/'}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="mt-auto text-xs text-slate-500">Powered by Grafana + GlitchTip</div>
    </aside>
  )
}
