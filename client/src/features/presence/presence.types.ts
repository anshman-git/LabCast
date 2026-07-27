export type PresenceRole = 'teacher' | 'student'
export type PresenceParticipant = { userId: string; displayName: string; role: PresenceRole; socketId?: string }
export type PresenceStatus = 'idle' | 'connecting' | 'joined' | 'error' | 'disconnected'
export type JoinResponse = { ok: true; participants: PresenceParticipant[] } | { ok: false; code: string; message: string }
