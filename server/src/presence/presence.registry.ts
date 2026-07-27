import type { Participant, PresenceRole } from './presence.types.js'

type PresenceRecord = Participant & { socketIds: Set<string>; disconnectTimer?: ReturnType<typeof setTimeout> }

export class PresenceRegistry {
  private readonly rooms = new Map<string, Map<string, PresenceRecord>>()
  constructor(private readonly reconnectGraceMs: number) {}

  join(roomCode: string, participant: Participant, socketId: string) {
    const room = this.rooms.get(roomCode) ?? new Map<string, PresenceRecord>()
    this.rooms.set(roomCode, room)
    const record = room.get(participant.userId) ?? { ...participant, socketIds: new Set<string>() }
    if (record.disconnectTimer) clearTimeout(record.disconnectTimer)
    record.disconnectTimer = undefined
    record.displayName = participant.displayName
    record.role = participant.role
    record.socketIds.add(socketId)
    room.set(participant.userId, record)
    // FIX #1: Always return participants WITH socketIds so they're preserved for WebRTC
    return this.participants(roomCode, true)
  }

  leave(roomCode: string, userId: string, socketId: string, onExpired: (participants: Participant[]) => void) {
    const room = this.rooms.get(roomCode)
    const record = room?.get(userId)
    if (!room || !record) return
    record.socketIds.delete(socketId)
    if (record.socketIds.size > 0 || record.disconnectTimer) return
    record.disconnectTimer = setTimeout(() => {
      const activeRoom = this.rooms.get(roomCode)
      const activeRecord = activeRoom?.get(userId)
      if (!activeRoom || !activeRecord || activeRecord.socketIds.size > 0) return
      activeRoom.delete(userId)
      if (activeRoom.size === 0) this.rooms.delete(roomCode)
      onExpired(this.participants(roomCode))
    }, this.reconnectGraceMs)
  }

  hasTeacher(roomCode: string) {
    return [...(this.rooms.get(roomCode)?.values() ?? [])].some((participant) => participant.role === 'teacher')
  }

  participants(roomCode: string, includeSocketIds = false): Participant[] {
    return [...(this.rooms.get(roomCode)?.values() ?? [])]
      .map(({ userId, displayName, role, socketIds }) => ({ 
        userId, 
        displayName, 
        role,
        // FIX #10: Include socket ID for WebRTC signaling
        socketId: includeSocketIds ? [...socketIds][0] : undefined,
      }))
      .sort((a, b) => (a.role === b.role ? a.displayName.localeCompare(b.displayName) : a.role === 'teacher' ? -1 : 1))
  }
}
