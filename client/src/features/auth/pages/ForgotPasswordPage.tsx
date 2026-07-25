import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthError } from '../components/AuthError'
import { AuthLayout } from '../components/AuthLayout'
import { SubmitButton } from '../components/SubmitButton'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth(); const [email, setEmail] = useState('')
  const mutation = useMutation({ mutationFn: () => resetPassword(email) })
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate() }
  return <AuthLayout title="Reset your password" subtitle="We'll email a secure password-reset link.">{mutation.isSuccess ? <div className="mt-7 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">If an account exists for {email}, a reset link has been sent.</div> : <form onSubmit={submit} className="mt-7"><label className="grid gap-2 text-sm text-fog">Email<input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><AuthError message={mutation.isError ? toAuthErrorMessage(mutation.error) : undefined} /><SubmitButton type="submit" isLoading={mutation.isPending}>Send reset link</SubmitButton></form>}<p className="mt-6 text-center text-sm"><Link className="text-sky-aqua hover:text-white" to="/login">Back to sign in</Link></p></AuthLayout>
}
