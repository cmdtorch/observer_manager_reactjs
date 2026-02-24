import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useToastStore } from '@/store/toast'

export function ToastViewport() {
  const items = useToastStore((state) => state.items)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className="fixed right-6 top-6 z-[70] flex w-[320px] flex-col gap-3">
      <AnimatePresence initial={false}>
        {items.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className={cn(
              'rounded-2xl border bg-white/90 p-4 text-sm text-slate-900 shadow-lg backdrop-blur',
              toast.variant === 'error' && 'border-rose-300',
              toast.variant === 'success' && 'border-emerald-300',
              toast.variant === 'default' && 'border-slate-200',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.message ? (
                  <div className="mt-1 text-xs text-slate-600">{toast.message}</div>
                ) : null}
              </div>
              <button
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => dismiss(toast.id)}
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
