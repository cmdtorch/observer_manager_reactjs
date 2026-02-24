import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, UserPlus, X } from 'lucide-react'
import { useAddUserToOrg, useRemoveUserFromOrg, useUsersSearch } from '@/api/hooks'
import type { UserRead } from '@/types/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addOrgUserSchema, type AddOrgUserValues } from '@/validation/schemas'
import { useDebounce } from '@/hooks/useDebounce'
import { useToastStore } from '@/store/toast'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

interface AddUserPanelProps {
  orgId: string
  users: UserRead[]
}

export function AddUserPanel({ orgId, users }: AddUserPanelProps) {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const { data: allUsers } = useUsersSearch(debounced)
  const addUser = useAddUserToOrg(orgId)
  const removeUser = useRemoveUserFromOrg(orgId)
  const pushToast = useToastStore((state) => state.push)
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null)

  const form = useForm<AddOrgUserValues>({
    resolver: zodResolver(addOrgUserSchema),
    defaultValues: { email: '' },
  })

  const userIds = useMemo(() => new Set(users.map((user) => user.id)), [users])

  const results = useMemo(() => {
    if (!allUsers) return []
    const term = debounced.toLowerCase()
    return allUsers.filter(
      (user) => user.email.toLowerCase().includes(term) && !userIds.has(user.id),
    )
  }, [allUsers, debounced, userIds])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="text-base font-semibold text-slate-900">Organization Users</div>
        <div className="mt-4 space-y-3">
          {users.length === 0 ? (
            <div className="text-sm text-slate-500">No users added yet.</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user.email}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant={user.needs_grafana_sync ? 'warning' : 'success'}>
                      Grafana {user.needs_grafana_sync ? 'Needs Sync' : 'Synced'}
                    </Badge>
                    <Badge variant={user.needs_glitchtip_sync ? 'warning' : 'success'}>
                      GlitchTip {user.needs_glitchtip_sync ? 'Needs Sync' : 'Synced'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setConfirmUserId(user.id)
                  }}
                  disabled={removeUser.isPending}
                >
                  <X size={14} />
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-base font-semibold text-slate-900">Search Existing Users</div>
          <div className="mt-3 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <Input
              placeholder="Search by email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {debounced.length > 2 ? (
            <div className="mt-4 space-y-2">
              {results.length === 0 ? (
                <div className="text-sm text-slate-500">No matching users.</div>
              ) : (
                results.map((user) => (
                  <button
                    key={user.id}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-left text-sm text-slate-700 transition hover:border-slate-200"
                    onClick={async () => {
                      try {
                        await addUser.mutateAsync({ user_id: user.id })
                        setSearch('')
                        pushToast({ title: 'User added', variant: 'success' })
                      } catch {
                        pushToast({
                          title: 'Add failed',
                          message: 'Please try again.',
                          variant: 'error',
                        })
                      }
                    }}
                  >
                    <span>{user.email}</span>
                    <UserPlus size={14} />
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="mt-4 text-xs text-slate-400">Type at least 3 characters.</div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-base font-semibold text-slate-900">Create & Add New User</div>
          <form
            className="mt-4 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await addUser.mutateAsync({ email: values.email })
                form.reset()
                pushToast({ title: 'User created and added', variant: 'success' })
              } catch {
                pushToast({
                  title: 'Create failed',
                  message: 'Please try again.',
                  variant: 'error',
                })
              }
            })}
          >
            <Input placeholder="email@sabahhub.com" {...form.register('email')} />
            {form.formState.errors.email ? (
              <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
            ) : null}
            <Button type="submit" variant="primary" disabled={addUser.isPending}>
              Add user
            </Button>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmUserId)}
        title="Remove user?"
        description="This will remove the user from the organization."
        confirmLabel="Remove"
        onOpenChange={(open) => {
          if (!open) setConfirmUserId(null)
        }}
        onConfirm={async () => {
          if (!confirmUserId) return
          try {
            await removeUser.mutateAsync(confirmUserId)
            pushToast({ title: 'User removed', variant: 'success' })
          } catch {
            pushToast({
              title: 'Remove failed',
              message: 'Please try again.',
              variant: 'error',
            })
          } finally {
            setConfirmUserId(null)
          }
        }}
      />
    </div>
  )
}
