import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthLayout } from '../components/AuthLayout'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')

  const mutation = useMutation({ mutationFn: () => resetPassword(email) })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send a secure password-reset link to your email.">
      {mutation.isSuccess ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={28} className="text-emerald-400" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            If an account exists for <strong className="text-zinc-100">{email}</strong>, a reset link has been sent.
          </p>
          <Link
            to="/login"
            className="mt-2 h-10 px-4 rounded-[10px] border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors inline-flex items-center"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {mutation.isError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-[8px] px-3 py-2">
              {toAuthErrorMessage(mutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-10 rounded-[10px] bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white active:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {mutation.isPending ? 'Sending...' : 'Send reset link'}
          </button>

          <p className="text-center text-xs text-zinc-500">
            <Link to="/login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
              ← Back to sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}
