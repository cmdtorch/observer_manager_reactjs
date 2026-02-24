import { Badge } from '@/components/ui/badge'

const platformColors: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  django: 'success',
  reactjs: 'info',
  react_native: 'warning',
  fastapi: 'info',
  nodejs: 'warning',
  other: 'default',
}

export function PlatformBadge({ platform }: { platform: string | null }) {
  const normalized = (platform ?? 'other').toLowerCase()
  const variant = platformColors[normalized] ?? 'default'
  return <Badge variant={variant}>{platform ?? 'Unknown'}</Badge>
}
