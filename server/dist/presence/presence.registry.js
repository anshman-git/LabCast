export class PresenceRegistry {
    reconnectGraceMs;
    rooms = new Map();
    constructor(reconnectGraceMs) {
        this.reconnectGraceMs = reconnectGraceMs;
    }
    join(roomCode, participant, socketId) {
        const room = this.rooms.get(roomCode) ?? new Map();
        this.rooms.set(roomCode, room);
        const record = room.get(participant.userId) ?? { ...participant, socketIds: new Set() };
        if (record.disconnectTimer)
            clearTimeout(record.disconnectTimer);
        record.disconnectTimer = undefined;
        record.displayName = participant.displayName;
        record.role = participant.role;
        record.socketIds.add(socketId);
        room.set(participant.userId, record);
        // FIX #1: Always return participants WITH socketIds so they're preserved for WebRTC
        return this.participants(roomCode, true);
    }
    leave(roomCode, userId, socketId, onExpired) {
        const room = this.rooms.get(roomCode);
        const record = room?.get(userId);
        if (!room || !record)
            return;
        record.socketIds.delete(socketId);
        if (record.socketIds.size > 0 || record.disconnectTimer)
            return;
        record.disconnectTimer = setTimeout(() => {
            const activeRoom = this.rooms.get(roomCode);
            const activeRecord = activeRoom?.get(userId);
            if (!activeRoom || !activeRecord || activeRecord.socketIds.size > 0)
                return;
            activeRoom.delete(userId);
            if (activeRoom.size === 0)
                this.rooms.delete(roomCode);
            onExpired(this.participants(roomCode));
        }, this.reconnectGraceMs);
    }
    hasTeacher(roomCode) {
        return [...(this.rooms.get(roomCode)?.values() ?? [])].some((participant) => participant.role === 'teacher');
    }
    participants(roomCode, includeSocketIds = false) {
        return [...(this.rooms.get(roomCode)?.values() ?? [])]
            .map(({ userId, displayName, role, socketIds }) => ({
            userId,
            displayName,
            role,
            // FIX #10: Include socket ID for WebRTC signaling
            socketId: includeSocketIds ? [...socketIds][0] : undefined,
        }))
            .sort((a, b) => (a.role === b.role ? a.displayName.localeCompare(b.displayName) : a.role === 'teacher' ? -1 : 1));
    }
}
