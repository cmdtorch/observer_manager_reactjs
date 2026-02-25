import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Plus, Trash2, Eye, X, MessageSquare } from 'lucide-react'
import {
  useCreateOrganization,
  useDeleteOrganization,
  useOrganizations,
  useTelegramGroups,
} from '@/api/hooks'
import { getValidationErrorMessage } from '@/api/validation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepProgressModal } from '@/components/shared/StepProgressModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToastStore } from '@/store/toast'
import { organizationCreateSchema, type OrganizationCreateValues } from '@/validation/schemas'
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  OrganizationListItem,
} from '@/types/api'
import { isAxiosError } from 'axios'

const stepsTemplate = [
  'Create organization record',
  'Provision Grafana workspace',
  'Provision GlitchTip workspace',
  'Issue API key & OTLP endpoint',
  'Invite initial users',
]

export function OrganizationsPage() {
  const { setHeader } = usePageHeader()
  useDocumentTitle('Observer Manager | Organizations')

  useEffect(() => {
    setHeader({
      title: 'Organizations',
      subtitle: 'Provision users, apps, keys, and alerts.',
    })
  }, [setHeader])

  const [searchParams] = useSearchParams()
  const openFromQuery = searchParams.get('create') === '1'

  const [open, setOpen] = useState(openFromQuery)
  const { data, isLoading, isError, refetch } = useOrganizations()
  const { data: telegramGroups } = useTelegramGroups(true, open)
  const createOrg = useCreateOrganization()
  const deleteOrg = useDeleteOrganization()
  const pushToast = useToastStore((state) => state.push)
  const [progressOpen, setProgressOpen] = useState(false)
  const [createResult, setCreateResult] = useState<CreateOrganizationResponse | null>(null)
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<OrganizationListItem | null>(null)

  const form = useForm<OrganizationCreateValues>({
    resolver: zodResolver(organizationCreateSchema),
    defaultValues: { name: '', telegram_group_id: undefined, users: [] },
  })

  const sorted = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const steps = useMemo(() => {
    if (createOrg.isPending) {
      return stepsTemplate.map((label) => ({ label, status: 'loading' as const }))
    }
    if (createOrg.isSuccess) {
      return stepsTemplate.map((label) => ({ label, status: 'success' as const }))
    }
    if (createOrg.isError) {
      return stepsTemplate.map((label, index) => ({
        label,
        status: index === 0 ? 'error' as const : 'pending' as const,
      }))
    }
    return stepsTemplate.map((label) => ({ label, status: 'pending' as const }))
  }, [createOrg.isPending, createOrg.isSuccess, createOrg.isError])

  const addEmailChip = () => {
    const trimmed = emailInput.trim()
    if (!trimmed) return
    setEmails((prev) => Array.from(new Set([...prev, trimmed])))
    setEmailInput('')
  }

  const handleCreate = form.handleSubmit(async (values) => {
    try {
      setProgressOpen(true)
      const payload: CreateOrganizationRequest = {
        name: values.name,
        users: emails.length > 0 ? emails : null,
      }
      if (values.telegram_group_id) {
        payload.telegram_group_id = values.telegram_group_id
      }
      const response = await createOrg.mutateAsync(payload)
      setCreateResult(response)
      pushToast({ title: 'Organization created', variant: 'success' })
      form.reset()
      setEmails([])
      setOpen(false)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        pushToast({
          title: 'Validation error',
          message: getValidationErrorMessage(error),
          variant: 'error',
        })
        return
      }
      pushToast({ title: 'Creation failed', message: 'Please try again.', variant: 'error' })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Organizations</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">Manage your orgs</div>
          <div className="text-sm text-slate-500">Provision users, apps, keys, and alerts.</div>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Create Organization
        </Button>
      </div>

      <Card>
        <div className="text-base font-semibold text-slate-900">All Organizations</div>
        <div className="mt-4 overflow-x-auto">
          {isError ? (
            <ErrorState
              title="Failed to load organizations"
              description="Please check your connection and retry."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No organizations yet"
              description="Create your first organization to start provisioning users and apps."
              actionLabel="Create Organization"
              onAction={() => setOpen(true)}
              icon={<Building2 size={18} />}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Slug</th>
                  <th className="py-3">Grafana ID</th>
                  <th className="py-3">GlitchTip ID</th>
                  <th className="py-3">Telegram</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Created At</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((org) => (
                  <tr key={org.id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-900">{org.name}</td>
                    <td className="py-3 text-slate-500">{org.slug}</td>
                    <td className="py-3 text-slate-500">{org.grafana_org_id ?? '-'}</td>
                    <td className="py-3 text-slate-500">{org.glitchtip_org_id ?? '-'}</td>
                    <td className="py-3 text-slate-500">
                      {org.telegram_group_name ? (
                        <Badge className="inline-flex items-center gap-2">
                          <MessageSquare size={12} />
                          {org.telegram_group_name}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          org.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {org.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/organizations/${org.id}`}>
                            <Eye size={14} />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(org)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <Input placeholder="Organization name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="mt-1 text-xs text-rose-500">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <input
                type="hidden"
                {...form.register('telegram_group_id', {
                  setValueAs: (value) => (value ? value : undefined),
                })}
              />
              <Select
                value={form.watch('telegram_group_id') ?? undefined}
                onValueChange={(value) =>
                  form.setValue('telegram_group_id', value, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Telegram group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {(telegramGroups ?? []).length === 0 ? (
                    <SelectItem value="no-groups" disabled>
                      No available Telegram groups
                    </SelectItem>
                  ) : (
                    (telegramGroups ?? []).map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.chat_id})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.telegram_group_id ? (
                <p className="mt-1 text-xs text-rose-500">
                  {form.formState.errors.telegram_group_id.message}
                </p>
              ) : null}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Users</div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Add user emails"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addEmailChip()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addEmailChip}>
                  Add
                </Button>
              </div>
              {emails.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => setEmails((prev) => prev.filter((item) => item !== email))}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createOrg.isPending}>
                {createOrg.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <StepProgressModal
        open={progressOpen}
        onOpenChange={(openState) => {
          setProgressOpen(openState)
          if (!openState) {
            setCreateResult(null)
          }
        }}
        title="Provisioning Organization"
        steps={steps}
        summary={
          createResult ? (
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">{createResult.name}</div>
              <div className="text-xs text-slate-500">Slug: {createResult.slug}</div>
              <div className="text-xs text-slate-500">API Key: {createResult.api_key}</div>
              <div className="text-xs text-slate-500">OTLP Endpoint: {createResult.otlp_endpoint}</div>
              <div className="text-xs text-slate-500">
                Invited Users: {createResult.invited_users.length ? createResult.invited_users.join(', ') : 'None'}
              </div>
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete organization?"
        description="This will remove the organization and related resources."
        confirmLabel="Delete"
        onOpenChange={(openState) => {
          if (!openState) setConfirmDelete(null)
        }}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await deleteOrg.mutateAsync(confirmDelete.id)
            pushToast({ title: 'Organization deleted', variant: 'success' })
          } catch (error) {
            if (isAxiosError(error) && error.response?.status === 422) {
              pushToast({
                title: 'Validation error',
                message: getValidationErrorMessage(error),
                variant: 'error',
              })
            } else {
              pushToast({
                title: 'Delete failed',
                message: 'Please try again.',
                variant: 'error',
              })
            }
          } finally {
            setConfirmDelete(null)
          }
        }}
      />
    </div>
  )
}
