'use client'
import { create } from 'zustand'
import { authApi, profileApi } from '@/lib/api-client'

/**
 * Browser-side auth/app store for Next.js client components. Server pages
 * pass the user in via the AppShell layout; this store hydrates from that
 * initial value and stays in sync with later fetches.
 */
export const useAuthStore = create((set, get) => ({
  user: null,        // { id, email, role, … }
  profile: null,     // profile row from /profiles/me
  loading: true,

  /** Called once on initial hydration from AppShell.useEffect. */
  hydrate: (me) => {
    if (!me) {
      set({ user: null, profile: null, loading: false })
      return
    }
    const { profile, ...user } = me
    set({ user, profile, loading: false })
  },

  fetchProfile: async () => {
    try {
      const profile = await profileApi.me()
      set({ profile })
      return profile
    } catch { return null }
  },

  signOut: async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    set({ user: null, profile: null, loading: false })
  },
}))

/** Toast + lightweight app state shared by client components. */
export const useAppStore = create((set) => ({
  toasts: [],
  showToast: (message, kind = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
