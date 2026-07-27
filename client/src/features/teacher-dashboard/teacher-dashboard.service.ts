import { collection, getDocs, query, where } from 'firebase/firestore'
import { firestoreDb, isFirebaseConfigured } from '../../lib/firebase'
import type { TeacherDashboardData } from './teacher-dashboard.types'

export interface TeacherDashboardService {
  getDashboard(teacherId: string): Promise<TeacherDashboardData>
}

const LOCAL_ROOMS_KEY = 'labcast_created_rooms'

export const teacherDashboardService: TeacherDashboardService = {
  async getDashboard(teacherId: string): Promise<TeacherDashboardData> {
    const roomsList: any[] = []

    if (firestoreDb && isFirebaseConfigured) {
      try {
        const q = query(collection(firestoreDb, 'rooms'), where('teacherId', '==', teacherId))
        const snapshot = await getDocs(q)
        snapshot.forEach((doc) => {
          roomsList.push(doc.data())
        })
      } catch (err) {
        console.warn('Firestore dashboard fetch notice:', err)
      }
    }

    // Also check local store for rooms created by this teacher
    try {
      const raw = localStorage.getItem(LOCAL_ROOMS_KEY)
      if (raw) {
        const localMap = JSON.parse(raw)
        Object.values(localMap).forEach((room: any) => {
          if (!roomsList.some((r) => r.roomCode === room.roomCode)) {
            roomsList.push(room)
          }
        })
      }
    } catch {}

    const activeRoom = roomsList.find((r) => r.status === 'active' || r.status === 'waiting') || roomsList[0] || null

    const currentRoomData = activeRoom
      ? {
          id: activeRoom.id || activeRoom.roomCode,
          title: activeRoom.title || 'Live Classroom',
          subject: activeRoom.subject || 'Lab Session',
          roomCode: activeRoom.roomCode,
          status: activeRoom.status || 'active',
          startsAt: 'Live',
          joinedStudents: 0,
        }
      : null

    return {
      currentRoom: currentRoomData,
      todaySessions: roomsList.map((r) => ({
        id: r.id || r.roomCode,
        title: r.title,
        subject: r.subject,
        time: 'Live',
        joinedStudents: 0,
        status: r.status || 'active',
      })),
      recentRooms: roomsList.map((r) => ({
        id: r.id || r.roomCode,
        title: r.title,
        roomCode: r.roomCode,
        lastUsed: 'Recently',
        attendance: 0,
      })),
      studentsJoined: [],
    }
  },
}
