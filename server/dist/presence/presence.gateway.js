const PRESENCE_JOIN_EVENT = 'presence:join';
const PRESENCE_LEAVE_EVENT = 'presence:leave';
const ROOM_CODE_PATTERN = /^[A-Z2-9]{6}$/;
const roomName = (roomCode) => `presence:${roomCode}`;
function error(code, message) { return { ok: false, code, message }; }
export function registerPresenceGateway(io, registry) {
    io.on('connection', (socket) => {
        socket.on(PRESENCE_JOIN_EVENT, (payload, acknowledge) => {
            const roomCode = payload.roomCode?.trim().toUpperCase();
            if (!roomCode || !ROOM_CODE_PATTERN.test(roomCode))
                return acknowledge(error('INVALID_ROOM_CODE', 'Room code must be six characters.'));
            if (payload.role !== 'teacher' && payload.role !== 'student')
                return acknowledge(error('INVALID_ROLE', 'A valid presence role is required.'));
            if (payload.role === 'student' && !registry.hasTeacher(roomCode))
                return acknowledge(error('ROOM_NOT_ACTIVE', 'This room is not currently active.'));
            const previousRoom = socket.data.activeRoomCode;
            if (previousRoom && previousRoom !== roomCode)
                leaveSocketRoom(io, registry, socket, previousRoom);
            socket.join(roomName(roomCode));
            socket.data.activeRoomCode = roomCode;
            const participants = registry.join(roomCode, { userId: socket.data.userId, displayName: payload.displayName?.trim() || socket.data.displayName, role: payload.role }, socket.id);
            acknowledge({ ok: true, participants });
            io.to(roomName(roomCode)).emit('presence:participants', participants);
        });
        socket.on(PRESENCE_LEAVE_EVENT, (acknowledge) => {
            if (socket.data.activeRoomCode)
                leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode);
            acknowledge?.();
        });
        socket.on('disconnect', () => {
            if (socket.data.activeRoomCode)
                leaveSocketRoom(io, registry, socket, socket.data.activeRoomCode);
        });
    });
}
function leaveSocketRoom(io, registry, socket, roomCode) {
    socket.leave(roomName(roomCode));
    socket.data.activeRoomCode = undefined;
    registry.leave(roomCode, socket.data.userId, socket.id, (participants) => io.to(roomName(roomCode)).emit('presence:participants', participants));
}
