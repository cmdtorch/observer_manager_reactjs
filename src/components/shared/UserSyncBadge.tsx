import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UserSyncBadgeProps {
  type: 'grafana' | 'glitchtip'
  synced: boolean
  onSync: () => void
  isSyncing: boolean
}

export function UserSyncBadge({ synced, onSync, isSyncing }: UserSyncBadgeProps) {
  if (synced) {
    return <Badge variant="success">Synced</Badge>
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
      onClick={onSync}
      disabled={isSyncing}
    >
      {isSyncing ? <Loader2 size={12} className="animate-spin" /> : null}
      Needs Sync
    </button>
  )
}
