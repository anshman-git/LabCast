import { useState, type FormEvent } from 'react'
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { roomService } from '../room.service'

export function JoinRoomPage() {
  const navigate = useNavigate()
  const [studentName, setStudentName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = studentName.trim()
    const trimmedCode = roomCode.trim().toUpperCase()

    if (!trimmedName || !trimmedCode) return

    setIsVerifying(true)
    try {
      // Validate room existence via roomService lookup
      await roomService.getRoomByCode(trimmedCode)

      // Store student guest credentials in sessionStorage
      sessionStorage.setItem('labcast_student_name', trimmedName)
      sessionStorage.setItem(
        'labcast_guest_id',
        `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      )

      navigate(`/room/${trimmedCode}`)
    } catch (err) {
      setError('Room not found. Please check the room code and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans text-zinc-100 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-sm rounded-[10px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">Join Classroom</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your name and room code to watch live screen broadcasts.
          </p>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Student Name
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g. Alex Chen"
              className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              required
              minLength={4}
              maxLength={8}
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                if (error) setError(null)
              }}
              placeholder="e.g. LAB731"
              className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 font-mono tracking-widest text-xs text-zinc-100 uppercase placeholder-zinc-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || !studentName.trim() || roomCode.trim().length < 4}
            className="w-full h-9 rounded-[8px] bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white active:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isVerifying ? (
              <>
                <Loader2 size={14} className="animate-spin text-zinc-950" />
                Verifying Room...
              </>
            ) : (
              <>
                Join Classroom <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Instructor account?{' '}
            <a
              href="/login"
              className="text-zinc-300 hover:text-white font-medium underline underline-offset-2"
            >
              Teacher Login
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
