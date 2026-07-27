import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthLayout } from '../components/AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: () => register({ displayName, email, password }),
    onSuccess: () => navigate('/teacher/dashboard', { replace: true }),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <AuthLayout title="Create Teacher Account" subtitle="Set up your LabCast teaching account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
          <input
            required
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Prof. Jane Smith"
            className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email address</label>
          <input
            required
            autoComplete="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.edu"
            className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
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
          {mutation.isPending ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-xs text-zinc-500 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
