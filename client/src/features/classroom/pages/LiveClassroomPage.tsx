import { useEffect, useState } from 'react'
import { Loader2, ServerCrash, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/auth.context'
import { roomService } from '../../rooms/room.service'
import { RoomNotFoundError } from '../../rooms/room.errors'
import { type Room } from '../../rooms/room.types'
import { StudentClassroomView } from '../components/StudentClassroomView'
import { TeacherClassroomView } from '../components/TeacherClassroomView'

export function LiveClassroomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const normalizedCode = (roomCode || '').toUpperCase()

  // Guest student name stored by JoinRoomPage
  const guestStudentName = sessionStorage.getItem('labcast_student_name') || 'Student'

  useEffect(() => {
    let isMounted = true

    async function initClassroom() {
      if (!normalizedCode) {
        if (isMounted) {
          setNotFound(true)
          setLoading(false)
        }
        return
      }

      try {
        const fetchedRoom = await roomService.getRoomByCode(normalizedCode)
        if (isMounted) {
          setRoom(fetchedRoom)
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof RoomNotFoundError) {
            setNotFound(true)
          } else {
            console.warn('Classroom initialization error:', err)
            setNotFound(true)
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initClassroom()
    return () => {
      isMounted = false
    }
  }, [normalizedCode])

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-500 size-5" />
          <p className="text-xs font-medium text-zinc-400">
            Connecting to classroom <strong className="font-mono text-zinc-200">{normalizedCode}</strong>...
          </p>
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-950 font-sans">
        <div className="flex flex-col items-center gap-5 text-center max-w-xs px-4">
          <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4">
            <ServerCrash className="size-7 text-rose-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100">Room Not Found</h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              The classroom code <strong className="font-mono text-zinc-300">{normalizedCode || 'unknown'}</strong> is
              invalid or this session has ended.
            </p>
          </div>
          <button
            onClick={() => navigate('/join')}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Join
          </button>
        </div>
      </main>
    )
  }

  // Teacher: authenticated user who owns the room
  const isTeacherRole = Boolean(
    user &&
      (user.uid === room?.teacherId ||
        !sessionStorage.getItem('labcast_student_name'))
  )

  if (isTeacherRole) {
    return <TeacherClassroomView roomCode={normalizedCode} />
  }

  // Default: Guest student view
  return <StudentClassroomView roomCode={normalizedCode} guestName={guestStudentName} />
}
