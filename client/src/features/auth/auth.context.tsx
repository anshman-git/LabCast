import { createContext, useContext, useEffect, type PropsWithChildren } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '../../lib/firebase'
import { authService } from './auth.service'
import { useAuthStore } from './auth.store'
import type { AuthUser, LoginInput, RegisterInput, UserRole } from './types'

type AuthContextValue = { user: AuthUser | null; role: UserRole | null; isLoading: boolean; signIn: (input: LoginInput) => Promise<void>; register: (input: RegisterInput) => Promise<void>; resetPassword: (email: string) => Promise<void>; signOut: () => Promise<void>; selectRole: (role: UserRole) => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const { user, role, isLoading, setUser, setRole, setLoading } = useAuthStore()

  useEffect(() => {
    if (!firebaseAuth || !isFirebaseConfigured) { setLoading(false); return }
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser ? { uid: nextUser.uid, email: nextUser.email, displayName: nextUser.displayName, emailVerified: nextUser.emailVerified } : null)
      if (!nextUser) setRole(null)
      setLoading(false)
    })
  }, [setLoading, setRole, setUser])

  return <AuthContext.Provider value={{ user, role, isLoading, signIn: async (input) => { await authService.signIn(input) }, register: async (input) => { await authService.register(input) }, resetPassword: authService.resetPassword, signOut: authService.signOut, selectRole: setRole }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
