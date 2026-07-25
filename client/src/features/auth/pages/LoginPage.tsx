import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import { toAuthErrorMessage } from '../auth.errors'
import { AuthError } from '../components/AuthError'
import { AuthLayout } from '../components/AuthLayout'
import { SubmitButton } from '../components/SubmitButton'

export function LoginPage() {
  const { signIn } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const mutation = useMutation({ mutationFn: () => signIn({ email, password }), onSuccess: () => navigate((location.state as { from?: Location })?.from?.pathname ?? '/role-selection', { replace: true }) })
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate() }
  return <AuthLayout title="Welcome back" subtitle="Sign in to continue to LabCast."><form onSubmit={submit} className="mt-7"><label className="grid gap-2 text-sm text-fog">Email<input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><label className="mt-4 grid gap-2 text-sm text-fog">Password<input required minLength={8} autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none focus:border-sky-aqua" /></label><div className="mt-3 text-right"><Link className="text-sm text-sky-aqua hover:text-white" to="/forgot-password">Forgot password?</Link></div><AuthError message={mutation.isError ? toAuthErrorMessage(mutation.error) : undefined} /><SubmitButton type="submit" isLoading={mutation.isPending}>Sign in</SubmitButton></form><p className="mt-6 text-center text-sm text-mist">New to LabCast? <Link className="font-semibold text-sky-aqua hover:text-white" to="/register">Create an account</Link></p></AuthLayout>
}
