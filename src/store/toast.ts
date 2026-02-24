import { create } from 'zustand'

export type ToastVariant = 'default' | 'success' | 'error'

export interface ToastItem {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

interface ToastState {
  items: ToastItem[]
  push: (item: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (item) => {
    const id = crypto.randomUUID()
    set((state) => ({ items: [...state.items, { ...item, id }] }))
    window.setTimeout(() => {
      set((state) => ({ items: state.items.filter((toast) => toast.id !== id) }))
    }, 4500)
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((toast) => toast.id !== id) })),
}))
