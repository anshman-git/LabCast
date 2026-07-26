import type { Timestamp } from 'firebase/firestore'

export const ROOM_CODE_LENGTH = 6
export type RoomStatus = 'waiting' | 'active' | 'ended'
export type MemberRole = 'teacher' | 'student'

export type Room = {
  id: string
  roomCode: string
  teacherId: string
  title: string
  subject: string
  status: RoomStatus
  createdAt: Timestamp | null
}

export type RoomMember = {
  roomId: string
  userId: string
  role: MemberRole
  joinedAt: Timestamp | null
}

export type CreateRoomInput = Pick<Room, 'title' | 'subject'>
export type JoinRoomResult = { room: Room; alreadyJoined: boolean }
