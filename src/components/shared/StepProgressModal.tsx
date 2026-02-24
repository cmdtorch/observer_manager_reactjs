import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type StepStatus = 'pending' | 'loading' | 'success' | 'error'

export interface StepItem {
  label: string
  status: StepStatus
}

interface StepProgressModalProps {
  open: boolean
  title: string
  steps: StepItem[]
  summary?: React.ReactNode
  onOpenChange: (open: boolean) => void
}

export function StepProgressModal({
  open,
  title,
  steps,
  summary,
  onOpenChange,
}: StepProgressModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={`${step.label}-${index}`} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                {step.status === 'loading' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {step.status === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : null}
                {step.status === 'error' ? (
                  <XCircle size={16} className="text-rose-500" />
                ) : null}
                {step.status === 'pending' ? <div className="h-2 w-2 rounded-full bg-slate-400" /> : null}
              </div>
              <div className="text-sm text-slate-700">{step.label}</div>
            </div>
          ))}
        </div>
        {summary ? <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">{summary}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
