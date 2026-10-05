import { create } from 'zustand'
import type { ProductId } from '../lib/types'

export interface Toast {
  id: string
  kind: 'success' | 'info' | 'warning' | 'error'
  title: string
  body?: string
}

export type Flow =
  | { kind: 'deposit'; currency?: 'NGN' | 'USD' }
  | { kind: 'invest'; productId?: ProductId; goalId?: string }
  | { kind: 'redeem'; holdingId?: string }
  | { kind: 'switch'; holdingId?: string }
  | { kind: 'withdraw' }
  | null

interface UIState {
  toasts: Toast[]
  flow: Flow
  rmTyping: boolean
  demoOpen: boolean
  sidebarOpen: boolean
  toast: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
  open: (f: Flow) => void
  close: () => void
  setRmTyping: (v: boolean) => void
  setDemoOpen: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
}

export const useUI = create<UIState>()((set, get) => ({
  toasts: [],
  flow: null,
  rmTyping: false,
  demoOpen: false,
  sidebarOpen: false,
  toast: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }].slice(-4) }))
    setTimeout(() => get().dismiss(id), 4800)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  open: (flow) => set({ flow }),
  close: () => set({ flow: null }),
  setRmTyping: (rmTyping) => set({ rmTyping }),
  setDemoOpen: (demoOpen) => set({ demoOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
