import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthLayout } from '../components/AuthLayout'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => signIn({ email, password }),
    onSuccess: () =>
      navigate(
        (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/teacher/dashboard',
        { replace: true }
      ),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <AuthLayout title="Teacher Login" subtitle="Sign in to manage your classroom sessions.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Email address
          </label>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.edu"
            className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            required
            minLength={8}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {mutation.isError && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-[8px] px-3 py-2">
            {toAuthErrorMessage(mutation.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full h-10 rounded-[10px] bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white active:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-xs text-zinc-500 pt-1">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
