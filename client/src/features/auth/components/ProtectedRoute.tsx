import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth.context'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <main className="grid min-h-screen place-items-center bg-ink text-mist" aria-live="polite">Checking your session…</main>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
