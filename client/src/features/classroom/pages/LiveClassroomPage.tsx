import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { attendanceService } from '../../attendance/attendance.service'
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

  const normalizedCode = (roomCode || 'DEMO01').toUpperCase()

  useEffect(() => {
    let isMounted = true

    async function initClassroom() {
      try {
        const fetchedRoom = await roomService.getRoomByCode(normalizedCode)
        if (isMounted) {
          setRoom(fetchedRoom)
        }

        // Record attendance automatically in Firestore & local state
        if (user) {
          const isTeacherUser = user.uid === fetchedRoom.teacherId
          await attendanceService.markAttendance(normalizedCode, user, isTeacherUser ? 'teacher' : 'student')
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
  }, [normalizedCode, user])

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="animate-spin text-sky-400 size-8" />
          <p className="text-sm font-semibold tracking-wide">Initializing LabCast Smart Classroom...</p>
        </div>
      </main>
    )
  }

  // Determine user role (If teacher created room or is logged in as teacher)
  const isTeacherRole = user?.uid === room?.teacherId || user?.displayName?.toLowerCase().includes('prof') || user?.email?.toLowerCase().includes('teacher')

  if (isTeacherRole) {
    return <TeacherClassroomView roomCode={normalizedCode} />
  }

  return <StudentClassroomView roomCode={normalizedCode} />
}
