export type DashboardRoom = { id: string; title: string; subject: string; roomCode: string; status: 'waiting' | 'scheduled' | 'active' | 'idle' | 'ended'; startsAt: string; joinedStudents: number }
export type TodaySession = { id: string; title: string; subject: string; time: string; joinedStudents: number; status: 'upcoming' | 'completed' | 'active' }
export type RecentRoom = { id: string; title: string; roomCode: string; lastUsed: string; attendance: number }
export type JoinedStudent = { id: string; name: string; initials: string; joinedAt: string }
export type TeacherDashboardData = { currentRoom: DashboardRoom | null; todaySessions: TodaySession[]; recentRooms: RecentRoom[]; studentsJoined: JoinedStudent[] }
