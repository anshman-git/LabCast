import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth/auth.context'
import { roomService } from '../../rooms/room.service'
import { type Room } from '../../rooms/room.types'
import { StudentClassroomView } from '../components/StudentClassroomView'
import { TeacherClassroomView } from '../components/TeacherClassroomView'

export function LiveClassroomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  const normalizedCode = (roomCode || 'LAB401').toUpperCase()

  // Guest student name stored by JoinRoomPage
  const guestStudentName = sessionStorage.getItem('labcast_student_name') || 'Student'

  useEffect(() => {
    let isMounted = true

    async function initClassroom() {
      try {
        const fetchedRoom = await roomService.getRoomByCode(normalizedCode)
        if (isMounted) {
          setRoom(fetchedRoom)
        }
      } catch (err) {
        console.warn('Classroom initialization notice:', err)
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

  // Teacher: authenticated user
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
