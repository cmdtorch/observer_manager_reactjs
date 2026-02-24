import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSyncOrganization } from '@/api/hooks'

export function SyncOrgButton({ orgId }: { orgId: string }) {
  const sync = useSyncOrganization(orgId)

  return (
    <Button onClick={() => sync.mutate()} disabled={sync.isPending || !orgId} variant="outline">
      {sync.isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      Sync
    </Button>
  )
}
