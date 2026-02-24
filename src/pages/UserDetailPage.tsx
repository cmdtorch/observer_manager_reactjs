import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { api } from '@/api/client'
import { useOrganizations, useSyncUser, useUser } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { OrganizationListItem, UserRead } from '@/types/api'

export function UserDetailPage() {
  const { userId } = useParams()
  const id = userId ?? ''
  const { setHeader } = usePageHeader()
  const { data: user, isLoading, isError, refetch } = useUser(id)
  const { data: organizations } = useOrganizations()
  const syncUser = useSyncUser(id)

  useDocumentTitle(`Observer Manager | ${user?.email ?? 'User'}`)

  useEffect(() => {
    setHeader({
      title: user?.email ?? 'User',
      subtitle: 'User details and sync status.',
      breadcrumb: [
        { label: 'Users', href: '/users' },
        { label: user?.email ?? 'User' },
      ],
    })
  }, [setHeader, user?.email])

  const { data: userOrganizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['users', id, 'organizations'],
    queryFn: async () => {
      if (!organizations) return [] as OrganizationListItem[]
      const results = await Promise.all(
        organizations.map(async (org) => {
          const { data } = await api.get<UserRead[]>(`/api/organizations/${org.id}/users`)
          const match = data.some((entry) => entry.id === id)
          return match ? org : null
        }),
      )
      return results.filter((org): org is OrganizationListItem => Boolean(org))
    },
    enabled: Boolean(id) && Boolean(organizations?.length),
  })

  if (isError) {
    return (
      <ErrorState
        title="Failed to load user"
        description="Please check your connection and retry."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft size={14} />
        Back to users
      </Link>

      <Card>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="space-y-2">
            <div className="text-lg font-semibold text-slate-900">{user?.email}</div>
            <div className="text-sm text-slate-500">
              Created: {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}
            </div>
            <div className="text-sm text-slate-500">
              Updated: {user?.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Grafana</div>
              <div className="text-sm text-slate-500">Sync status and invite link.</div>
            </div>
            {user?.needs_grafana_sync ? (
              <Button variant="outline" onClick={() => syncUser.mutate()} disabled={syncUser.isPending}>
                <RefreshCw size={14} />
                Sync
              </Button>
            ) : null}
          </div>
          <div className="mt-4 text-sm text-slate-600">
            {user?.grafana_id ? `Grafana ID: ${user.grafana_id}` : 'Not synced'}
          </div>
          {user?.grafana_invite_url ? (
            <a className="mt-2 inline-block text-xs text-slate-500" href={user.grafana_invite_url} target="_blank" rel="noreferrer">
              Invite URL
            </a>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">GlitchTip</div>
              <div className="text-sm text-slate-500">Sync status and invite link.</div>
            </div>
            {user?.needs_glitchtip_sync ? (
              <Button variant="outline" onClick={() => syncUser.mutate()} disabled={syncUser.isPending}>
                <RefreshCw size={14} />
                Sync
              </Button>
            ) : null}
          </div>
          <div className="mt-4 text-sm text-slate-600">
            {user?.glitchtip_id ? `GlitchTip ID: ${user.glitchtip_id}` : 'Not synced'}
          </div>
          {user?.glitchtip_invite_url ? (
            <a className="mt-2 inline-block text-xs text-slate-500" href={user.glitchtip_invite_url} target="_blank" rel="noreferrer">
              Invite URL
            </a>
          ) : null}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900">Organizations</div>
            <div className="text-sm text-slate-500">Organizations this user belongs to.</div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {orgsLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (userOrganizations ?? []).length === 0 ? (
            <div className="text-sm text-slate-500">No organizations found for this user.</div>
          ) : (
            userOrganizations?.map((org) => (
              <Link
                key={org.id}
                to={`/organizations/${org.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <div>
                  <div className="font-semibold text-slate-900">{org.name}</div>
                  <div className="text-xs text-slate-500">{org.slug}</div>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(org.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
