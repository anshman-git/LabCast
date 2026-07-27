import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../auth.context'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 font-sans" aria-live="polite">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-500 size-5" />
          <p className="text-xs text-zinc-400">Verifying session...</p>
        </div>
      </main>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
