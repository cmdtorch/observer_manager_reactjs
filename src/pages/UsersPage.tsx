import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { api } from '@/api/client'
import { queryKeys, useUsers } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserSyncBadge } from '@/components/shared/UserSyncBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToastStore } from '@/store/toast'
import type { UserRead } from '@/types/api'

export function UsersPage() {
  const { setHeader } = usePageHeader()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pushToast = useToastStore((state) => state.push)
  const [searchParams] = useSearchParams()
  const showCreateHint = searchParams.get('create') === '1'

  useDocumentTitle('Observer Manager | Users')

  useEffect(() => {
    setHeader({
      title: 'Users',
      subtitle: 'Manage all users across organizations.',
    })
  }, [setHeader])

  const { data, isLoading, isError, refetch } = useUsers()
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null)

  const syncUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data: response } = await api.post<UserRead>(`/api/users/${userId}/sync`)
      return response
    },
    onMutate: (userId) => setSyncingUserId(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onSettled: () => setSyncingUserId(null),
    onError: () => {
      pushToast({ title: 'Sync failed', message: 'Please try again.', variant: 'error' })
    },
  })

  return (
    <div className="space-y-6">
      {showCreateHint ? (
        <Card className="flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div>
            <div className="text-base font-semibold text-slate-900">Create users via organizations</div>
            <div className="text-sm text-slate-500">Add a user by attaching them to an organization.</div>
          </div>
          <Button variant="outline" onClick={() => navigate('/organizations')}>
            <UserPlus size={16} />
            Go to Organizations
          </Button>
        </Card>
      ) : null}

      <Card>
        <div className="text-base font-semibold text-slate-900">All Users</div>
        <div className="mt-4 overflow-x-auto">
          {isError ? (
            <ErrorState
              title="Failed to load users"
              description="Please check your connection and retry."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              title="No users yet"
              description="Add users by attaching them to an organization."
              actionLabel="Go to Organizations"
              onAction={() => navigate('/organizations')}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3">Email</th>
                  <th className="py-3">Grafana ID</th>
                  <th className="py-3">GlitchTip ID</th>
                  <th className="py-3">Grafana Sync</th>
                  <th className="py-3">GlitchTip Sync</th>
                  <th className="py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="py-3 font-semibold text-slate-900">{user.email}</td>
                    <td className="py-3 text-slate-500">{user.grafana_id ?? '-'}</td>
                    <td className="py-3 text-slate-500">{user.glitchtip_id ?? '-'}</td>
                    <td className="py-3" onClick={(event) => event.stopPropagation()}>
                      <UserSyncBadge
                        type="grafana"
                        synced={!user.needs_grafana_sync}
                        isSyncing={syncingUserId === user.id}
                        onSync={() => syncUser.mutate(user.id)}
                      />
                    </td>
                    <td className="py-3" onClick={(event) => event.stopPropagation()}>
                      <UserSyncBadge
                        type="glitchtip"
                        synced={!user.needs_glitchtip_sync}
                        isSyncing={syncingUserId === user.id}
                        onSync={() => syncUser.mutate(user.id)}
                      />
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
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
