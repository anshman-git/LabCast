import { useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'

export function JoinRoomPage() {
  const navigate = useNavigate()
  const [studentName, setStudentName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleJoin = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = studentName.trim()
    const trimmedCode = roomCode.trim().toUpperCase()

    if (!trimmedName || !trimmedCode) return

    // Store guest student info in sessionStorage
    sessionStorage.setItem('labcast_student_name', trimmedName)
    sessionStorage.setItem('labcast_guest_id', `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)

    navigate(`/room/${trimmedCode}`)
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans text-zinc-100">
      <div className="w-full max-w-sm rounded-[10px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Join a Classroom</h1>
          <p className="text-xs text-zinc-400 mt-1">Enter your name and room code to watch live screen broadcasts.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Your Name</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Room Code</label>
            <input
              type="text"
              required
              minLength={4}
              maxLength={8}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="LAB401"
              className="w-full h-10 rounded-[10px] border border-zinc-800 bg-zinc-950 px-3 font-mono tracking-widest text-sm text-zinc-100 uppercase placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!studentName.trim() || roomCode.trim().length < 4}
            className="w-full h-10 rounded-[10px] bg-zinc-100 text-zinc-950 font-medium text-sm hover:bg-white active:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            Join Classroom <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Teacher with an account?{' '}
            <a href="/login" className="text-zinc-300 hover:text-white font-medium underline underline-offset-2">
              Teacher Login
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
