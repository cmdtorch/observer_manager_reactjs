import { useEffect } from 'react'
import { Layers, Copy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAllApplications } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToastStore } from '@/store/toast'

export function ApplicationsPage() {
  const { setHeader } = usePageHeader()
  const pushToast = useToastStore((state) => state.push)
  const navigate = useNavigate()
  useDocumentTitle('Observer Manager | Applications')

  useEffect(() => {
    setHeader({
      title: 'Applications',
      subtitle: 'Read-only overview of applications across orgs.',
    })
  }, [setHeader])

  const { data, isLoading, isError, refetch } = useAllApplications()

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    pushToast({ title: 'Copied to clipboard', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-base font-semibold text-slate-900">All Applications</div>
        <div className="mt-4 overflow-x-auto">
          {isError ? (
            <ErrorState
              title="Failed to load applications"
              description="Please check your connection and retry."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              title="No applications"
              description="Create applications from an organization detail page."
              actionLabel="Go to Organizations"
              onAction={() => navigate('/organizations')}
              icon={<Layers size={18} />}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Platform</th>
                  <th className="py-3">Organization</th>
                  <th className="py-3">GlitchTip DSN</th>
                  <th className="py-3">Created</th>
                  <th className="py-3 text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map(({ app, organization }) => (
                  <tr key={app.id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-900">{app.name}</td>
                    <td className="py-3">
                      <PlatformBadge platform={app.platform} />
                    </td>
                    <td className="py-3 text-slate-500">{organization.name}</td>
                    <td className="py-3 text-slate-500">
                      {app.glitchtip_dsn ? (
                        <button
                          className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
                          onClick={() => copyToClipboard(app.glitchtip_dsn ?? '')}
                        >
                          {app.glitchtip_dsn.length > 36
                            ? `${app.glitchtip_dsn.slice(0, 32)}...`
                            : app.glitchtip_dsn}
                          <Copy size={12} />
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <Link
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        to={`/organizations/${organization.id}?tab=apps`}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
