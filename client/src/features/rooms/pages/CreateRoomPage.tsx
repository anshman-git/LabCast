import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Check, Copy, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth.context'
import { toRoomErrorMessage } from '../room.errors'
import { roomService } from '../room.service'
import { BrandMark } from '../../../components/BrandMark'

export function CreateRoomPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [copied, setCopied] = useState(false)

  const mutation = useMutation({
    mutationFn: () => roomService.createRoom({ title, subject }, user!.uid),
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const copyCode = async () => {
    if (!mutation.data) return
    await navigator.clipboard.writeText(mutation.data.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (mutation.data) {
    return (
      <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm rounded-[10px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm text-center">
          <div className="flex justify-center mb-5">
            <BrandMark />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 mb-4">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Room Ready
          </div>

          <p className="font-mono text-3xl font-semibold tracking-[0.25em] text-zinc-100 mt-2">
            {mutation.data.roomCode}
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            {mutation.data.title} · {mutation.data.subject}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Share this code with your students</p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => void copyCode()}
              className="h-10 px-4 rounded-[10px] border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/room/${mutation.data!.roomCode}`)}
              className="h-10 px-4 rounded-[10px] bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition-colors flex items-center gap-2"
            >
              Enter Classroom <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm rounded-[10px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm">
        <div className="flex justify-center mb-5">
          <BrandMark />
        </div>

        <div className="text-center mb-5">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Create a Room</h1>
          <p className="text-xs text-zinc-400 mt-1">Set up a room for your next lab session.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Class Title</label>
            <input
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS 401: Advanced Systems Programming"
              className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Subject</label>
            <input
              required
              maxLength={80}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {mutation.isError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-[8px] px-3 py-2">
              {toRoomErrorMessage(mutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-10 rounded-[10px] bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white active:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <Plus size={15} />
            {mutation.isPending ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </main>
  )
}
