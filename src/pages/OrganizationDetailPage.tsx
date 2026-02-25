import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Globe,
  KeyRound,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import { isAxiosError } from 'axios'
import {
  useCreateApiKey,
  useCreateApplication,
  useCreateDefaultAlerts,
  useDeleteApiKey,
  useDeleteApplication,
  useListApiKeys,
  useListApplications,
  useListUsers,
  useOrganization,
  useSetupTelegram,
} from '@/api/hooks'
import { getValidationErrorMessage } from '@/api/validation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { AddUserPanel } from '@/components/shared/AddUserPanel'
import { KeyMaskDisplay } from '@/components/shared/KeyMaskDisplay'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SyncOrgButton } from '@/components/shared/SyncOrgButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToastStore } from '@/store/toast'
import { createApiKeySchema, createApplicationSchema } from '@/validation/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateApiKeyValues, CreateApplicationValues } from '@/validation/schemas'
import type { CreateApplicationResponse } from '@/types/api'

const platformOptions = ['django', 'reactjs', 'react_native', 'fastapi', 'nodejs', 'other'] as const

export function OrganizationDetailPage() {
  const { orgId } = useParams()
  const id = orgId ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'users'
  const { setHeader } = usePageHeader()
  const { data: org, isLoading, isError, refetch } = useOrganization(id)
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useListUsers(id)
  const {
    data: apps,
    isLoading: appsLoading,
    isError: appsError,
    refetch: refetchApps,
  } = useListApplications(id)
  const {
    data: keys,
    isLoading: keysLoading,
    isError: keysError,
    refetch: refetchKeys,
  } = useListApiKeys(id)
  const createApp = useCreateApplication(id)
  const deleteApp = useDeleteApplication(id)
  const createKey = useCreateApiKey(id)
  const deleteKey = useDeleteApiKey(id)
  const setupTelegram = useSetupTelegram(id)
  const createAlerts = useCreateDefaultAlerts(id)
  const pushToast = useToastStore((state) => state.push)

  const [telegramOpen, setTelegramOpen] = useState(false)
  const [chatId, setChatId] = useState('')
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [appOpen, setAppOpen] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [createdApp, setCreatedApp] = useState<CreateApplicationResponse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'key' | 'app'; id: string } | null>(null)

  useDocumentTitle(`Observer Manager | ${org?.name ?? 'Organization'}`)

  useEffect(() => {
    setHeader({
      title: org?.name ?? 'Organization',
      subtitle: org?.slug ? `Slug: ${org.slug}` : 'Organization detail',
      breadcrumb: [
        { label: 'Organizations', href: '/organizations' },
        { label: org?.name ?? 'Organization' },
      ],
    })
  }, [org?.name, org?.slug, setHeader])

  const grafanaUrl = import.meta.env.VITE_GRAFANA_BASE_URL
  const glitchtipUrl = import.meta.env.VITE_GLITCHTIP_BASE_URL

  const apiKeyForm = useForm<CreateApiKeyValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { description: '' },
  })

  const appForm = useForm<CreateApplicationValues>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: { name: '', platform: 'django' },
  })

  const handle422 = (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 422) {
      pushToast({
        title: 'Validation error',
        message: getValidationErrorMessage(error),
        variant: 'error',
      })
      return
    }
    pushToast({ title: 'Something went wrong', message: 'Please try again.', variant: 'error' })
  }

  const truncatedDsn = (dsn: string | null) => {
    if (!dsn) return '-'
    return dsn.length > 40 ? `${dsn.slice(0, 36)}...` : dsn
  }

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value)
    pushToast({ title: 'Copied to clipboard', variant: 'success' })
  }

  const summaryFields = useMemo(() => {
    return [
      { label: 'Grafana Org ID', value: org?.grafana_org_id ?? '-' },
      { label: 'GlitchTip Org ID', value: org?.glitchtip_org_id ?? '-' },
      { label: 'Telegram Chat', value: org?.telegram_chat ?? 'Not configured' },
      { label: 'Status', value: org?.is_active ? 'Active' : 'Inactive' },
      { label: 'Created', value: org?.created_at ? new Date(org.created_at).toLocaleString() : '-' },
      { label: 'Updated', value: org?.updated_at ? new Date(org.updated_at).toLocaleString() : '-' },
    ]
  }, [org])

  if (isError) {
    return (
      <ErrorState
        title="Failed to load organization"
        description="Please check your connection and retry."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/organizations" className="inline-flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft size={14} />
          Back to organizations
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">Organization Overview</div>
            <div className="text-sm text-slate-500">Core org identifiers and integrations.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setChatId(org?.telegram_chat ?? '')
                setTelegramOpen(true)
              }}
            >
              <MessageSquare size={14} />
              Setup Telegram
            </Button>
            <SyncOrgButton orgId={id} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryFields.map((field) => (
            <div key={field.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase text-slate-400">{field.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{field.value}</div>
            </div>
          ))}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase text-slate-400">Grafana</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              {org?.grafana_org_id ?? '-'}
              {grafanaUrl && org?.grafana_org_id ? (
                <a
                  className="text-xs text-slate-500 hover:text-slate-900"
                  href={`${grafanaUrl}/orgs/${org.grafana_org_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={12} />
                </a>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase text-slate-400">GlitchTip</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
              {org?.glitchtip_org_id ?? '-'}
              {glitchtipUrl && org?.glitchtip_slug ? (
                <a
                  className="text-xs text-slate-500 hover:text-slate-900"
                  href={`${glitchtipUrl}/organizations/${org.glitchtip_slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={12} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setSearchParams({ tab: value })}
      >
        <TabsList>
          <TabsTrigger value="users">
            <Users size={14} />
            Users
          </TabsTrigger>
          <TabsTrigger value="keys">
            <KeyRound size={14} />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="apps">
            <Layers size={14} />
            Applications
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <ShieldCheck size={14} />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {usersError ? (
            <ErrorState
              title="Failed to load users"
              description="Please check your connection and retry."
              onRetry={() => refetchUsers()}
            />
          ) : usersLoading || isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <AddUserPanel orgId={id} users={users ?? []} />
          )}
        </TabsContent>

        <TabsContent value="keys">
          <div className="flex justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">API Keys</div>
              <div className="text-sm text-slate-500">Manage organization-scoped API keys.</div>
            </div>
            <Button variant="primary" onClick={() => setApiKeyOpen(true)}>
              <Plus size={14} />
              Create Key
            </Button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
            {keysError ? (
              <div className="p-6">
                <ErrorState
                  title="Failed to load API keys"
                  description="Please check your connection and retry."
                  onRetry={() => refetchKeys()}
                />
              </div>
            ) : keysLoading ? (
              <div className="p-6">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (keys ?? []).length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No API keys yet"
                  description="Create a key for this organization."
                  actionLabel="Create Key"
                  onAction={() => setApiKeyOpen(true)}
                  icon={<KeyRound size={18} />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="p-3">Key</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Active</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(keys ?? []).map((key) => (
                      <tr key={key.id} className="border-t border-slate-100">
                        <td className="p-3">
                          <KeyMaskDisplay masked={key.key_masked} />
                        </td>
                        <td className="p-3 text-slate-500">{key.description ?? '-'}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              key.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(key.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete({ type: 'key', id: key.id })}
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="apps">
          <div className="flex justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Applications</div>
              <div className="text-sm text-slate-500">Manage instrumented applications.</div>
            </div>
            <Button variant="primary" onClick={() => setAppOpen(true)}>
              <Plus size={14} />
              Create App
            </Button>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
            {appsError ? (
              <div className="p-6">
                <ErrorState
                  title="Failed to load applications"
                  description="Please check your connection and retry."
                  onRetry={() => refetchApps()}
                />
              </div>
            ) : appsLoading ? (
              <div className="p-6">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (apps ?? []).length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No applications yet"
                  description="Create an application for this organization."
                  actionLabel="Create App"
                  onAction={() => setAppOpen(true)}
                  icon={<Layers size={18} />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-400">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Platform</th>
                      <th className="p-3">GlitchTip DSN</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(apps ?? []).map((app) => (
                      <tr key={app.id} className="border-t border-slate-100">
                        <td className="p-3 font-semibold text-slate-900">{app.name}</td>
                        <td className="p-3">
                          <PlatformBadge platform={app.platform} />
                        </td>
                        <td className="p-3 text-slate-500">
                          <button
                            className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
                            onClick={() => app.glitchtip_dsn && copyToClipboard(app.glitchtip_dsn)}
                          >
                            {truncatedDsn(app.glitchtip_dsn)}
                            {app.glitchtip_dsn ? <Copy size={12} /> : null}
                          </button>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDelete({ type: 'app', id: app.id })}
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-slate-900">Alerts</div>
                <div className="text-sm text-slate-500">Create default alerting rules in Grafana.</div>
              </div>
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    await createAlerts.mutateAsync()
                    pushToast({ title: 'Default alerts created', variant: 'success' })
                  } catch (error) {
                    handle422(error)
                  }
                }}
                disabled={createAlerts.isPending}
              >
                Create Default Alerts
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={telegramOpen} onOpenChange={setTelegramOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Telegram</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Telegram chat id"
            value={chatId}
            onChange={(event) => setChatId(event.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTelegramOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={setupTelegram.isPending || chatId.trim().length === 0}
              onClick={async () => {
                try {
                  await setupTelegram.mutateAsync({ chat_id: chatId })
                  pushToast({ title: 'Telegram synced', variant: 'success' })
                  setChatId('')
                  setTelegramOpen(false)
                } catch (error) {
                  handle422(error)
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={apiKeyOpen} onOpenChange={setApiKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={apiKeyForm.handleSubmit(async (values) => {
              try {
                const response = await createKey.mutateAsync({
                  description: values.description || null,
                })
                setCreatedKey(response.key)
                apiKeyForm.reset()
                setApiKeyOpen(false)
                pushToast({ title: 'API key created', variant: 'success' })
              } catch (error) {
                handle422(error)
              }
            })}
          >
            <Input placeholder="Description (optional)" {...apiKeyForm.register('description')} />
            {apiKeyForm.formState.errors.description ? (
              <p className="text-xs text-rose-500">{apiKeyForm.formState.errors.description.message}</p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setApiKeyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createKey.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(createdKey)} onOpenChange={() => setCreatedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-mono text-slate-700">
              {createdKey}
            </div>
            <div className="text-xs text-amber-600">
              Copy this key now. It will not be shown again.
            </div>
            <Button
              variant="outline"
              onClick={() => createdKey && copyToClipboard(createdKey)}
            >
              <Copy size={14} />
              Copy key
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={appOpen} onOpenChange={setAppOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={appForm.handleSubmit(async (values) => {
              try {
                const response = await createApp.mutateAsync(values)
                setCreatedApp(response)
                appForm.reset({ name: '', platform: 'django' })
                setAppOpen(false)
                pushToast({ title: 'Application created', variant: 'success' })
              } catch (error) {
                handle422(error)
              }
            })}
          >
            <Input placeholder="Application name" {...appForm.register('name')} />
            {appForm.formState.errors.name ? (
              <p className="text-xs text-rose-500">{appForm.formState.errors.name.message}</p>
            ) : null}
            <select
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
              {...appForm.register('platform')}
            >
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {appForm.formState.errors.platform ? (
              <p className="text-xs text-rose-500">{appForm.formState.errors.platform.message}</p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAppOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createApp.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(createdApp)} onOpenChange={() => setCreatedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Created</DialogTitle>
          </DialogHeader>
          {createdApp ? (
            <div className="space-y-3 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{createdApp.name}</div>
              <div>DSN: {createdApp.glitchtip_dsn ?? '-'}</div>
              <div>OTLP Endpoint: {createdApp.otlp_endpoint}</div>
              <div>Resource Attributes: {JSON.stringify(createdApp.resource_attributes)}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
                {createdApp.instructions}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete item?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onOpenChange={(openState) => {
          if (!openState) setConfirmDelete(null)
        }}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            if (confirmDelete.type === 'key') {
              await deleteKey.mutateAsync(confirmDelete.id)
              pushToast({ title: 'API key deleted', variant: 'success' })
            } else {
              await deleteApp.mutateAsync(confirmDelete.id)
              pushToast({ title: 'Application deleted', variant: 'success' })
            }
          } catch (error) {
            handle422(error)
          } finally {
            setConfirmDelete(null)
          }
        }}
      />
    </div>
  )
}
