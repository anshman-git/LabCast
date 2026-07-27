import type { Server, Socket } from 'socket.io'
import type {
  AuthenticatedSocketData,
  ChatMessagePayload,
  HandRaisePayload,
  JoinPresencePayload,
  Participant,
  PresenceResponse,
  WebRTCSignalPayload,
} from './presence.types.js'
import { PresenceRegistry } from './presence.registry.js'

interface ClientToServerEvents {
  'presence:join': (payload: JoinPresencePayload, acknowledge: (response: PresenceResponse) => void) => void
  'presence:leave': (acknowledge?: () => void) => void
  'chat:send': (payload: ChatMessagePayload) => void
  'hand:raise': (payload: HandRaisePayload) => void
  'hand:lower': (payload: { roomCode: string; userId: string }) => void
  'webrtc:offer': (payload: WebRTCSignalPayload) => void
  'webrtc:answer': (payload: WebRTCSignalPayload) => void
  'webrtc:ice-candidate': (payload: WebRTCSignalPayload) => void
  'webrtc:stream-status': (payload: WebRTCSignalPayload) => void
}

interface ServerToClientEvents {
  'presence:participants': (participants: Participant[]) => void
  'chat:message': (payload: ChatMessagePayload) => void
  'hand:raised': (payload: HandRaisePayload) => void
  'hand:lowered': (payload: { userId: string }) => void
  'webrtc:offer': (payload: WebRTCSignalPayload) => void
  'webrtc:answer': (payload: WebRTCSignalPayload) => void
  'webrtc:ice-candidate': (payload: WebRTCSignalPayload) => void
  'webrtc:stream-status': (payload: WebRTCSignalPayload) => void
}

type PresenceSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, AuthenticatedSocketData>
type PresenceServer = Server<ClientToServerEvents, ServerToClientEvents, object, AuthenticatedSocketData>

const PRESENCE_JOIN_EVENT = 'presence:join' as const
const PRESENCE_LEAVE_EVENT = 'presence:leave' as const

const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,8}$/
const roomName = (roomCode: string) => `presence:${roomCode}`

function error(code: string, message: string): PresenceResponse { return { ok: false, code, message } }

export function registerPresenceGateway(io: PresenceServer, registry: PresenceRegistry) {
  io.on('connection', (socket: PresenceSocket) => {
    console.log('[SOCKET] Client connected:', socket.id)
    
    socket.on(PRESENCE_JOIN_EVENT, (payload: JoinPresencePayload, acknowledge: (response: PresenceResponse) => void) => {
      console.log('[PRESENCE:JOIN] Event received', { socketId: socket.id, payload })
      
      const roomCode = payload.roomCode?.trim().toUpperCase()
      console.log('[PRESENCE:JOIN] Room code processed:', { original: payload.roomCode, sanitized: roomCode })
      
      if (!roomCode || !ROOM_CODE_PATTERN.test(roomCode)) {
        console.log('[PRESENCE:JOIN] Invalid room code:', roomCode)
        return acknowledge(error('INVALID_ROOM_CODE', 'Room code must be 4 to 8 alphanumeric characters.'))
      }
      if (payload.role !== 'teacher' && payload.role !== 'student') {
        console.log('[PRESENCE:JOIN] Invalid role:', payload.role)
        return acknowledge(error('INVALID_ROLE', 'A valid presence role is required.'))
      }

      const previousRoom = socket.data.activeRoomCode
      if (previousRoom && previousRoom !== roomCode) leaveSocketRoom(io, registry, socket, previousRoom)
      
      const roomNameValue = roomName(roomCode)
      console.log('[PRESENCE:JOIN] Joining socket to room:', { socketId: socket.id, roomName: roomNameValue, roomCode })
      socket.join(roomNameValue)
      socket.data.activeRoomCode = roomCode
      console.log('[SOCKET] Socket now in rooms:', socket.rooms)

      const displayName = payload.displayName?.trim() || socket.data.displayName || 'Guest User'
      const userId = payload.guestId || socket.data.userId || socket.id
      console.log('[PRESENCE:JOIN] Adding participant to registry:', { roomCode, userId, displayName, role: payload.role })

      // FIX #1: registry.join() now returns participants WITH socketIds included
      const participantsWithSocketIds = registry.join(
        roomCode,
        { userId, displayName, role: payload.role },
        socket.id
      )
      console.log('[PRESENCE:JOIN] Registry updated, participants in room:', { roomCode, count: participantsWithSocketIds.length, participantCount: participantsWithSocketIds.length, participants: participantsWithSocketIds })
      console.log('[PRESENCE:JOIN] Broadcasting to room:', { roomName: roomName(roomCode), participantCount: participantsWithSocketIds.length, withSocketIds: true })
      
      acknowledge({ ok: true, participants: participantsWithSocketIds })
      console.log('[PRESENCE:JOIN] Sent acknowledgment to socket:', socket.id)
      
      io.to(roomName(roomCode)).emit('presence:participants', participantsWithSocketIds)
      console.log('[PRESENCE:JOIN] Broadcasted presence:participants to room:', roomName(roomCode))
    })

    socket.on(PRESENCE_LEAVE_EVENT, (acknowledge?: () => void) => {
      if (socket.data.activeRoomCode) leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode)
      acknowledge?.()
    })

    socket.on('chat:send', (payload: ChatMessagePayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      const fullMessage: ChatMessagePayload = {
        ...payload,
        id: payload.id || Math.random().toString(36).substring(2, 9),
        timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      io.to(roomName(roomCode)).emit('chat:message', fullMessage)
    })

    socket.on('hand:raise', (payload: HandRaisePayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      io.to(roomName(roomCode)).emit('hand:raised', payload)
    })

    socket.on('hand:lower', (payload: { roomCode: string; userId: string }) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      io.to(roomName(roomCode)).emit('hand:lowered', { userId: payload.userId })
    })

    // WebRTC Signaling relays
    socket.on('webrtc:offer', (payload: WebRTCSignalPayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      if (payload.targetSocketId) {
        io.to(payload.targetSocketId).emit('webrtc:offer', { ...payload, senderSocketId: socket.id })
      } else {
        socket.to(roomName(roomCode)).emit('webrtc:offer', { ...payload, senderSocketId: socket.id })
      }
    })

    socket.on('webrtc:answer', (payload: WebRTCSignalPayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      if (payload.targetSocketId) {
        io.to(payload.targetSocketId).emit('webrtc:answer', { ...payload, senderSocketId: socket.id })
      } else {
        socket.to(roomName(roomCode)).emit('webrtc:answer', { ...payload, senderSocketId: socket.id })
      }
    })

    socket.on('webrtc:ice-candidate', (payload: WebRTCSignalPayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      if (payload.targetSocketId) {
        io.to(payload.targetSocketId).emit('webrtc:ice-candidate', { ...payload, senderSocketId: socket.id })
      } else {
        socket.to(roomName(roomCode)).emit('webrtc:ice-candidate', { ...payload, senderSocketId: socket.id })
      }
    })

    socket.on('webrtc:stream-status', (payload: WebRTCSignalPayload) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode) return
      io.to(roomName(roomCode)).emit('webrtc:stream-status', payload)
    })

    socket.on('disconnect', () => {
      console.log('[SOCKET] Client disconnected:', socket.id, 'from room:', socket.data.activeRoomCode)
      if (socket.data.activeRoomCode) leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode)
    })
  })
}

function leaveSocketRoom(io: PresenceServer, registry: PresenceRegistry, socket: PresenceSocket, roomCode: string) {
  socket.leave(roomName(roomCode))
  socket.data.activeRoomCode = undefined
  registry.leave(roomCode, socket.data.userId, socket.id, (participants) => io.to(roomName(roomCode)).emit('presence:participants', participants))
}

