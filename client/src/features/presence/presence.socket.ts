import { io, type Socket } from 'socket.io-client'

export function createPresenceSocket(
  tokenProvider?: () => Promise<string>,
  guestDetails?: { guestName: string; guestId: string }
) {
  const serverUrl = import.meta.env.VITE_PRESENCE_SERVER_URL || 'http://localhost:3001'
  return io(serverUrl, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    auth: (callback) => {
      if (tokenProvider) {
        tokenProvider()
          .then((token) => callback({ token }))
          .catch(() => callback({
            token: 'guest',
            guestName: guestDetails?.guestName || 'Student',
            guestId: guestDetails?.guestId,
          }))
      } else {
        callback({
          token: 'guest',
          guestName: guestDetails?.guestName || 'Student',
          guestId: guestDetails?.guestId,
        })
      }
    },
  }) as Socket
}

