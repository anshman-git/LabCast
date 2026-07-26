import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, Plus } from 'lucide-react'
import { useAuth } from '../../auth/auth.context'
import { AuthError } from '../../auth/components/AuthError'
import { SubmitButton } from '../../auth/components/SubmitButton'
import { toRoomErrorMessage } from '../room.errors'
import { roomService } from '../room.service'
import { RoomLayout } from '../components/RoomLayout'

export function CreateRoomPage() {
  const { user } = useAuth(); const [title, setTitle] = useState(''); const [subject, setSubject] = useState(''); const [copied, setCopied] = useState(false)
  const mutation = useMutation({ mutationFn: () => roomService.createRoom({ title, subject }, user!.uid) })
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate() }
  const copyCode = async () => { if (!mutation.data) return; await navigator.clipboard.writeText(mutation.data.roomCode); setCopied(true) }

  if (mutation.data) return <RoomLayout title="Room is ready" description="Share this code with your students to let them join."><div className="mt-7 rounded-2xl border border-sky-aqua/30 bg-sky-aqua/10 p-5 text-center"><p className="text-sm text-mist">Room code</p><p className="mt-2 font-display text-4xl font-bold tracking-[0.2em] text-sky-aqua">{mutation.data.roomCode}</p><p className="mt-4 text-sm text-fog">{mutation.data.title} · {mutation.data.subject}</p><span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cloud">Waiting</span><div className="mt-5 flex items-center justify-center gap-3"><button type="button" onClick={() => void copyCode()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-cloud hover:border-sky-aqua"><Copy size={15} />{copied ? 'Copied' : 'Copy code'}</button><a href={`/room/${mutation.data.roomCode}`} className="inline-flex items-center gap-2 rounded-xl bg-sky-aqua px-4 py-2.5 text-sm font-bold text-ink hover:bg-cyan-200">Enter Classroom →</a></div></div></RoomLayout>
  return <RoomLayout title="Create a room" description="Set up a waiting room for your next lab session."><form onSubmit={submit} className="mt-7"><label className="grid gap-2 text-sm text-fog">Room title<input required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Introduction to React" className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none placeholder:text-mist/60 focus:border-sky-aqua" /></label><label className="mt-4 grid gap-2 text-sm text-fog">Subject<input required maxLength={80} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Computer Science" className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 text-cloud outline-none placeholder:text-mist/60 focus:border-sky-aqua" /></label><AuthError message={mutation.isError ? toRoomErrorMessage(mutation.error) : undefined} /><SubmitButton type="submit" isLoading={mutation.isPending}><Plus className="mr-2 inline-block" size={16} />Create waiting room</SubmitButton></form></RoomLayout>
}
