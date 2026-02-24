import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-rose-500">
          <AlertTriangle size={18} />
        </div>
        <div>
          <div className="text-base font-semibold text-rose-700">{title}</div>
          <div className="text-sm text-rose-600">{description}</div>
        </div>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}
