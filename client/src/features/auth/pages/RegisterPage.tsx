import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthError } from '../components/AuthError'
import { AuthLayout } from '../components/AuthLayout'
import { SubmitButton } from '../components/SubmitButton'

export function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const mutation = useMutation({ mutationFn: () => register({ displayName, email, password }), onSuccess: () => navigate('/role-selection', { replace: true }) })
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate() }
  return <AuthLayout title="Create your account" subtitle="Start with your LabCast sign-in details."><form onSubmit={submit} className="mt-7"><label className="grid gap-2 text-sm text-fog">Name<input required autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><label className="mt-4 grid gap-2 text-sm text-fog">Email<input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><label className="mt-4 grid gap-2 text-sm text-fog">Password<span className="text-xs text-mist">At least 8 characters</span><input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><AuthError message={mutation.isError ? toAuthErrorMessage(mutation.error) : undefined} /><SubmitButton type="submit" isLoading={mutation.isPending}>Create account</SubmitButton></form><p className="mt-6 text-center text-sm text-mist">Already have an account? <Link className="font-semibold text-sky-aqua hover:text-white" to="/login">Sign in</Link></p></AuthLayout>
}
