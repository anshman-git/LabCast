import { GraduationCap, Presentation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import type { UserRole } from '../types'
import { AuthLayout } from '../components/AuthLayout'

const roles: { value: UserRole; title: string; description: string; icon: typeof GraduationCap }[] = [{ value: 'teacher', title: 'Teacher', description: 'Create and lead lab sessions.', icon: Presentation }, { value: 'student', title: 'Student', description: 'Join and participate in sessions.', icon: GraduationCap }]

export function RoleSelectionPage() {
  const { selectRole, signOut } = useAuth(); const navigate = useNavigate()
  const choose = (role: UserRole) => { selectRole(role); navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true }) }
  return <AuthLayout title="How will you use LabCast?" subtitle="This selection is kept in the current client session until a profile service is introduced."><div className="mt-7 grid gap-3">{roles.map(({ value, title, description, icon: Icon }) => <button key={value} type="button" onClick={() => choose(value)} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-ink/40 p-4 text-left transition hover:border-sky-aqua hover:bg-sky-aqua/10"><span className="grid size-11 place-items-center rounded-xl bg-sky-aqua/15 text-sky-aqua"><Icon size={21} /></span><span><span className="block font-semibold text-cloud">{title}</span><span className="mt-1 block text-sm text-mist">{description}</span></span></button>)}</div><button type="button" onClick={() => void signOut()} className="mt-6 w-full text-sm text-mist hover:text-cloud">Sign out</button></AuthLayout>
}
