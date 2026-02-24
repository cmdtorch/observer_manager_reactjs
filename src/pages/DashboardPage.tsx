import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, KeyRound, Layers, Users, Plus, UserPlus } from 'lucide-react'
import { api } from '@/api/client'
import { queryKeys, useAllApiKeys, useAllApplications, useOrganizations, useUsers } from '@/api/hooks'
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

export function DashboardPage() {
  const { setHeader } = usePageHeader()
  useDocumentTitle('Observer Manager | Dashboard')
  const navigate = useNavigate()

  useEffect(() => {
    setHeader({
      title: 'Dashboard',
      subtitle: 'Overview of organizations, users, keys, and applications.',
    })
  }, [setHeader])

  const { data: organizations, isLoading: orgLoading, isError: orgError, refetch: refetchOrgs } =
    useOrganizations()
  const { data: users, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } =
    useUsers()
  const { data: allApps, isLoading: appsLoading } = useAllApplications()
  const { data: allKeys, isLoading: keysLoading } = useAllApiKeys()
  const pushToast = useToastStore((state) => state.push)

  const recentOrganizations = useMemo(() => {
    return (organizations ?? [])
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [organizations])

  const usersNeedingSync = useMemo(() => {
    return (users ?? []).filter((user) => user.needs_grafana_sync || user.needs_glitchtip_sync)
  }, [users])

  const queryClient = useQueryClient()
  const [syncingUserId, setSyncingUserId] = useState<string | null>(null)

  const syncUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<UserRead>(`/api/users/${userId}/sync`)
      return data
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
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Organizations', value: organizations?.length ?? 0, icon: Building2, loading: orgLoading },
          { label: 'Users', value: users?.length ?? 0, icon: Users, loading: usersLoading },
          { label: 'Applications', value: allApps?.length ?? 0, icon: Layers, loading: appsLoading },
          { label: 'API Keys', value: allKeys?.length ?? 0, icon: KeyRound, loading: keysLoading },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Icon size={18} />
              </div>
              <div>
                <div className="text-sm text-slate-500">{card.label}</div>
                {card.loading ? (
                  <Skeleton className="mt-2 h-6 w-16" />
                ) : (
                  <div className="text-2xl font-semibold text-slate-900">{card.value}</div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Recent Organizations</div>
              <div className="text-sm text-slate-500">Latest 5 organizations created.</div>
            </div>
            <Button asChild variant="outline">
              <Link to="/organizations">View all</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {orgError ? (
              <ErrorState
                title="Failed to load organizations"
                description="Please check your connection and retry."
                onRetry={() => refetchOrgs()}
              />
            ) : orgLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : recentOrganizations.length === 0 ? (
              <EmptyState
                title="No organizations yet"
                description="Create your first organization to start provisioning users and apps."
                actionLabel="Create Organization"
                onAction={() => navigate('/organizations-create=1')}
                icon={<Building2 size={18} />}
              />
            ) : (
              recentOrganizations.map((org) => (
                <Link
                  key={org.id}
                  to={`/organizations/${org.id}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-200"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{org.name}</div>
                    <div className="text-xs text-slate-500">Slug: {org.slug}</div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(org.created_at).toLocaleDateString()}</div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Users Needing Sync</div>
              <div className="text-sm text-slate-500">Quickly sync users to Grafana/GlitchTip.</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {usersError ? (
              <ErrorState
                title="Failed to load users"
                description="Please check your connection and retry."
                onRetry={() => refetchUsers()}
              />
            ) : usersLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : usersNeedingSync.length === 0 ? (
              <EmptyState
                title="All users are synced"
                description="No pending sync operations right now."
                icon={<Users size={18} />}
              />
            ) : (
              usersNeedingSync.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{user.email}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <UserSyncBadge
                        type="grafana"
                        synced={!user.needs_grafana_sync}
                        isSyncing={syncingUserId === user.id}
                        onSync={() => syncUser.mutate(user.id)}
                      />
                      <UserSyncBadge
                        type="glitchtip"
                        synced={!user.needs_glitchtip_sync}
                        isSyncing={syncingUserId === user.id}
                        onSync={() => syncUser.mutate(user.id)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => syncUser.mutate(user.id)}
                    disabled={syncingUserId === user.id}
                  >
                    Sync
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="primary">
          <Link to="/organizations-create=1">
            <Plus size={16} />
            Create Organization
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/users-create=1">
            <UserPlus size={16} />
            Add User
          </Link>
        </Button>
      </div>
    </div>
  )
}