export type PresenceRole = 'teacher' | 'student'

export type Participant = { userId: string; displayName: string; role: PresenceRole }
export type JoinPresencePayload = { roomCode: string; role: PresenceRole; displayName?: string }
export type PresenceResponse = { ok: true; participants: Participant[] } | { ok: false; code: string; message: string }

export type AuthenticatedSocketData = { userId: string; displayName: string; activeRoomCode?: string }
