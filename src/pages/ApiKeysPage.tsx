import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAllApiKeys } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { KeyMaskDisplay } from '@/components/shared/KeyMaskDisplay'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function ApiKeysPage() {
  const { setHeader } = usePageHeader()
  const navigate = useNavigate()
  useDocumentTitle('Observer Manager | API Keys')

  useEffect(() => {
    setHeader({
      title: 'API Keys',
      subtitle: 'Read-only overview of keys across all organizations.',
    })
  }, [setHeader])

  const { data, isLoading, isError, refetch } = useAllApiKeys()

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-base font-semibold text-slate-900">All API Keys</div>
        <div className="mt-4 overflow-x-auto">
          {isError ? (
            <ErrorState
              title="Failed to load API keys"
              description="Please check your connection and retry."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              title="No API keys"
              description="Create keys from an organization detail page."
              actionLabel="Go to Organizations"
              onAction={() => navigate('/organizations')}
              icon={<KeyRound size={18} />}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3">Organization</th>
                  <th className="py-3">Key</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Active</th>
                  <th className="py-3">Created</th>
                  <th className="py-3 text-right">Manage</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map(({ key, organization }) => (
                  <tr key={key.id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-900">{organization.name}</td>
                    <td className="py-3">
                      <KeyMaskDisplay masked={key.key_masked} />
                    </td>
                    <td className="py-3 text-slate-500">{key.description ?? '-'}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          key.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(key.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <Link
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                        to={`/organizations/${organization.id}?tab=keys`}
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
