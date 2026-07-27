export type PresenceRole = 'teacher' | 'student'

export type Participant = {
  userId: string
  displayName: string
  role: PresenceRole
  isHandRaised?: boolean
  socketId?: string  // FIX #10: Include socket ID for WebRTC peer targeting
}

export type JoinPresencePayload = {
  roomCode: string
  role: PresenceRole
  displayName?: string
  guestId?: string
}

export type PresenceResponse =
  | { ok: true; participants: Participant[] }
  | { ok: false; code: string; message: string }

export type AuthenticatedSocketData = {
  userId: string
  displayName: string
  role?: PresenceRole
  activeRoomCode?: string
}

export type ChatMessagePayload = {
  id?: string
  roomCode: string
  senderId: string
  senderName: string
  senderRole: PresenceRole
  text: string
  timestamp?: string
}

export type HandRaisePayload = {
  roomCode: string
  userId: string
  userName: string
  timestamp?: string
}

export type WebRTCSignalPayload = {
  roomCode: string
  targetSocketId?: string
  senderSocketId?: string
  senderId?: string
  senderName?: string
  sdp?: any
  candidate?: any
  isSharing?: boolean
}

