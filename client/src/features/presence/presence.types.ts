export type PresenceRole = 'teacher' | 'student'
export type PresenceParticipant = { userId: string; displayName: string; role: PresenceRole }
export type PresenceStatus = 'idle' | 'connecting' | 'joined' | 'error'
export type JoinResponse = { ok: true; participants: PresenceParticipant[] } | { ok: false; code: string; message: string }
