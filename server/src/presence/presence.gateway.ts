import type { Server, Socket } from 'socket.io'
import type { AuthenticatedSocketData, JoinPresencePayload, Participant, PresenceResponse } from './presence.types.js'
import { PresenceRegistry } from './presence.registry.js'

interface ClientToServerEvents {
  'presence:join': (payload: JoinPresencePayload, acknowledge: (response: PresenceResponse) => void) => void
  'presence:leave': (acknowledge?: () => void) => void
}

interface ServerToClientEvents {
  'presence:participants': (participants: Participant[]) => void
}

type PresenceSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, AuthenticatedSocketData>
type PresenceServer = Server<ClientToServerEvents, ServerToClientEvents, object, AuthenticatedSocketData>

const PRESENCE_JOIN_EVENT = 'presence:join' as const
const PRESENCE_LEAVE_EVENT = 'presence:leave' as const

const ROOM_CODE_PATTERN = /^[A-Z2-9]{6}$/
const roomName = (roomCode: string) => `presence:${roomCode}`

function error(code: string, message: string): PresenceResponse { return { ok: false, code, message } }

export function registerPresenceGateway(io: PresenceServer, registry: PresenceRegistry) {
  io.on('connection', (socket: PresenceSocket) => {
    socket.on(PRESENCE_JOIN_EVENT, (payload: JoinPresencePayload, acknowledge: (response: PresenceResponse) => void) => {
      const roomCode = payload.roomCode?.trim().toUpperCase()
      if (!roomCode || !ROOM_CODE_PATTERN.test(roomCode)) return acknowledge(error('INVALID_ROOM_CODE', 'Room code must be six characters.'))
      if (payload.role !== 'teacher' && payload.role !== 'student') return acknowledge(error('INVALID_ROLE', 'A valid presence role is required.'))
      if (payload.role === 'student' && !registry.hasTeacher(roomCode)) return acknowledge(error('ROOM_NOT_ACTIVE', 'This room is not currently active.'))

      const previousRoom = socket.data.activeRoomCode
      if (previousRoom && previousRoom !== roomCode) leaveSocketRoom(io, registry, socket, previousRoom)
      socket.join(roomName(roomCode))
      socket.data.activeRoomCode = roomCode
      const participants = registry.join(roomCode, { userId: socket.data.userId, displayName: payload.displayName?.trim() || socket.data.displayName, role: payload.role }, socket.id)
      acknowledge({ ok: true, participants })
      io.to(roomName(roomCode)).emit('presence:participants', participants)
    })

    socket.on(PRESENCE_LEAVE_EVENT, (acknowledge?: () => void) => {
      if (socket.data.activeRoomCode) leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode)
      acknowledge?.()
    })

    socket.on('disconnect', () => {
      if (socket.data.activeRoomCode) leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode)
    })
  })
}

function leaveSocketRoom(io: PresenceServer, registry: PresenceRegistry, socket: PresenceSocket, roomCode: string) {
  socket.leave(roomName(roomCode))
  socket.data.activeRoomCode = undefined
  registry.leave(roomCode, socket.data.userId, socket.id, (participants) => io.to(roomName(roomCode)).emit('presence:participants', participants))
}
