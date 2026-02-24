import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/auth'
import { loginSchema, type LoginFormValues } from '@/validation/schemas'

export function LoginModal() {
  const encoded = useAuthStore((state) => state.encoded)
  const isLoginOpen = useAuthStore((state) => state.isLoginOpen)
  const setLoginOpen = useAuthStore((state) => state.setLoginOpen)
  const login = useAuthStore((state) => state.login)

  const canClose = useMemo(() => Boolean(encoded), [encoded])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  return (
    <Dialog
      open={isLoginOpen}
      onOpenChange={(open) => {
        if (!open && !canClose) return
        setLoginOpen(open)
      }}
    >
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Secure Access</div>
            <div className="text-xl font-semibold text-slate-900">Sign in</div>
          </div>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit((values) => {
            login(values.username, values.password)
          })}
        >
          <div>
            <Input placeholder="Username" {...form.register('username')} />
            {form.formState.errors.username ? (
              <p className="mt-1 text-xs text-rose-500">
                {form.formState.errors.username.message}
              </p>
            ) : null}
          </div>
          <div>
            <Input type="password" placeholder="Password" {...form.register('password')} />
            {form.formState.errors.password ? (
              <p className="mt-1 text-xs text-rose-500">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" variant="primary">
            Sign In
          </Button>
        </form>
        <div className="mt-4 text-xs text-slate-500">
          Credentials are stored locally to authenticate API requests.
        </div>
      </DialogContent>
    </Dialog>
  )
}
