import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PageHeaderProvider } from '@/components/layout/PageHeaderProvider'
import { LoginModal } from '@/components/auth/LoginModal'
import { Button } from '@/components/ui/button'
import { DashboardPage } from '@/pages/DashboardPage'
import { OrganizationsPage } from '@/pages/OrganizationsPage'
import { OrganizationDetailPage } from '@/pages/OrganizationDetailPage'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailPage } from '@/pages/UserDetailPage'
import { ApiKeysPage } from '@/pages/ApiKeysPage'
import { ApplicationsPage } from '@/pages/ApplicationsPage'
import { TelegramGroupsPage } from '@/pages/TelegramGroupsPage'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <PageHeaderProvider>
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <Sidebar />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-[260px] bg-slate-950 shadow-xl">
              <Sidebar />
            </div>
            <button
              className="flex-1 bg-slate-900/60"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        ) : null}

        <main className="flex-1 bg-slate-50/95 px-6 py-8 lg:px-10">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
              <Menu size={16} />
              Menu
            </Button>
          </div>
          <div className="mt-4">
            <TopBar />
          </div>
          <div className="mt-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/organizations/:orgId" element={<OrganizationDetailPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:userId" element={<UserDetailPage />} />
              <Route path="/api-keys" element={<ApiKeysPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/telegram" element={<TelegramGroupsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
      <LoginModal />
    </PageHeaderProvider>
  )
}
