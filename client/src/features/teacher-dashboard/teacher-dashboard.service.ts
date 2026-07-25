import type { TeacherDashboardData } from './teacher-dashboard.types'

export interface TeacherDashboardService { getDashboard(teacherId: string): Promise<TeacherDashboardData> }

const mockDashboard: TeacherDashboardData = {
  currentRoom: { id: 'room-demo-101', title: 'React Components Lab', subject: 'Computer Science', roomCode: 'R4CT89', status: 'waiting', startsAt: '10:30 AM', joinedStudents: 18 },
  todaySessions: [
    { id: 'today-1', title: 'React Components Lab', subject: 'Computer Science', time: '10:30 AM', joinedStudents: 18, status: 'upcoming' },
    { id: 'today-2', title: 'Data Structures Review', subject: 'Computer Science', time: '2:00 PM', joinedStudents: 0, status: 'upcoming' },
    { id: 'today-3', title: 'Web Fundamentals', subject: 'Information Technology', time: '9:00 AM', joinedStudents: 24, status: 'completed' },
  ],
  recentRooms: [
    { id: 'recent-1', title: 'JavaScript Debugging', roomCode: 'JS8K2P', lastUsed: 'Yesterday', attendance: 22 },
    { id: 'recent-2', title: 'CSS Layout Workshop', roomCode: 'LAY7Q4', lastUsed: 'Mon, Jul 21', attendance: 19 },
    { id: 'recent-3', title: 'API Design Review', roomCode: 'API6V9', lastUsed: 'Fri, Jul 18', attendance: 16 },
  ],
  studentsJoined: [
    { id: 'student-1', name: 'Aisha Mehta', initials: 'AM', joinedAt: '10:21 AM' },
    { id: 'student-2', name: 'Rohan Shah', initials: 'RS', joinedAt: '10:22 AM' },
    { id: 'student-3', name: 'Priya Nair', initials: 'PN', joinedAt: '10:24 AM' },
    { id: 'student-4', name: 'Dev Patel', initials: 'DP', joinedAt: '10:26 AM' },
  ],
}

export const teacherDashboardService: TeacherDashboardService = {
  async getDashboard() { return Promise.resolve(mockDashboard) },
}
