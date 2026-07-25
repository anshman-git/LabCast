import { create } from 'zustand'
import type { AuthUser, UserRole } from './types'

type AuthState = { user: AuthUser | null; role: UserRole | null; isLoading: boolean; setUser: (user: AuthUser | null) => void; setRole: (role: UserRole | null) => void; setLoading: (isLoading: boolean) => void }

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (isLoading) => set({ isLoading }),
}))
