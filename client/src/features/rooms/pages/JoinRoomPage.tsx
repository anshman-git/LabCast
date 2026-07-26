import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../auth/auth.context'
import { AuthError } from '../../auth/components/AuthError'
import { SubmitButton } from '../../auth/components/SubmitButton'
import { toRoomErrorMessage } from '../room.errors'
import { roomService } from '../room.service'
import { RoomLayout } from '../components/RoomLayout'
import { useRoomPresence } from '../../presence/useRoomPresence'

export function JoinRoomPage() {
  const { user } = useAuth(); const [roomCode, setRoomCode] = useState('')
  const mutation = useMutation({ mutationFn: () => roomService.joinRoom(roomCode, user!.uid) })
  const presence = useRoomPresence(mutation.data?.room.roomCode ?? null, 'student')
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate() }
  if (mutation.data) return <RoomLayout title={mutation.data.alreadyJoined ? 'Already joined' : 'You joined the room'} description="Your room membership is saved."><div className="mt-7 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-center"><CheckCircle2 className="mx-auto text-emerald-200" size={34} /><p className="mt-4 font-display text-xl font-semibold text-cloud">{mutation.data.room.title}</p><p className="mt-1 text-sm text-mist">{mutation.data.room.subject}</p><span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cloud">{presence.status === 'joined' ? 'Connected to live room' : presence.status === 'error' ? 'Room presence unavailable' : 'Connecting to live room…'}</span>{presence.error && <p className="mt-3 text-sm text-red-100">{presence.error}</p>}<div className="mt-6"><a href={`/room/${mutation.data.room.roomCode}`} className="inline-flex items-center gap-2 rounded-xl bg-sky-aqua px-5 py-3 text-sm font-bold text-ink hover:bg-cyan-200">Enter Live Classroom →</a></div></div></RoomLayout>
  return <RoomLayout title="Join a room" description="Enter the six-character code shared by your teacher."><form onSubmit={submit} className="mt-7"><label className="grid gap-2 text-sm text-fog">Room code<input required minLength={6} maxLength={6} autoCapitalize="characters" value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))} placeholder="ABC123" className="rounded-xl border border-white/15 bg-ink/50 px-3 py-3 font-display tracking-[0.22em] text-cloud uppercase outline-none placeholder:tracking-[0.22em] placeholder:text-mist/60 focus:border-sky-aqua" /></label><AuthError message={mutation.isError ? toRoomErrorMessage(mutation.error) : undefined} /><SubmitButton type="submit" isLoading={mutation.isPending}>Join room</SubmitButton></form></RoomLayout>
}
