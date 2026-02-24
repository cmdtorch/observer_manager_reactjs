import { useEffect, useMemo, useState } from 'react'
import { Link2, MessageSquarePlus } from 'lucide-react'
import { useOrganizations, useTelegramGroups, useUpdateTelegramGroup } from '@/api/hooks'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { usePageHeader } from '@/components/layout/PageHeaderProvider'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToastStore } from '@/store/toast'

export function TelegramGroupsPage() {
  const { setHeader } = usePageHeader()
  useDocumentTitle('Observer Manager | Telegram Groups')

  useEffect(() => {
    setHeader({
      title: 'Telegram Groups',
      subtitle: 'Manage Telegram groups created by the bot webhook.',
    })
  }, [setHeader])

  const { data, isLoading, isError, refetch } = useTelegramGroups()
  const { data: organizations } = useOrganizations()
  const updateGroup = useUpdateTelegramGroup()
  const pushToast = useToastStore((state) => state.push)

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const selectedGroup = data?.find((group) => group.id === selectedGroupId) ?? null
  const orgLookup = useMemo(() => {
    const entries = organizations ?? []
    return new Map(entries.map((org) => [org.id, org.name]))
  }, [organizations])

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-base font-semibold text-slate-900">Telegram Groups</div>
        <div className="mt-4 overflow-x-auto">
          {isError ? (
            <ErrorState
              title="Failed to load Telegram groups"
              description="Please check your connection and retry."
              onRetry={() => refetch()}
            />
          ) : isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              title="No Telegram groups"
              description="Groups are created automatically when the bot joins a chat."
              icon={<MessageSquarePlus size={18} />}
              actionLabel="Refresh"
              onAction={() => refetch()}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Chat ID</th>
                  <th className="py-3">Linked Org</th>
                  <th className="py-3">Created</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(data ?? []).map((group) => (
                  <tr key={group.id} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-900">{group.name ?? 'Untitled'}</td>
                    <td className="py-3 text-slate-500">{group.chat_id}</td>
                    <td className="py-3 text-slate-500">
                      {group.org_id ? orgLookup.get(group.org_id) ?? group.org_id : 'Unlinked'}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(group.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {group.org_id ? (
                        <span className="text-xs text-slate-400">Linked</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedGroupId(group.id)
                            setSelectedOrgId('')
                          }}
                        >
                          <Link2 size={14} />
                          Link to Org
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Dialog
        open={Boolean(selectedGroupId)}
        onOpenChange={(open) => {
          if (!open) setSelectedGroupId(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Telegram Group</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-500">
            {selectedGroup?.name ?? 'Group'} - {selectedGroup?.chat_id}
          </div>
          <select
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            value={selectedOrgId}
            onChange={(event) => setSelectedOrgId(event.target.value)}
          >
            <option value="">Select organization</option>
            {(organizations ?? []).map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedGroupId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedOrgId || updateGroup.isPending}
              onClick={async () => {
                if (!selectedGroupId || !selectedOrgId) return
                try {
                  await updateGroup.mutateAsync({
                    groupId: selectedGroupId,
                    payload: { org_id: selectedOrgId },
                  })
                  pushToast({ title: 'Group linked', variant: 'success' })
                  setSelectedGroupId(null)
                } catch {
                  pushToast({ title: 'Link failed', message: 'Please try again.', variant: 'error' })
                }
              }}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
