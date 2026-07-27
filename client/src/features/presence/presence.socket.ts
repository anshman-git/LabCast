import { io, type Socket } from 'socket.io-client'

// Global socket instance - prevents multiple instances from being created
let globalSocket: Socket | null = null

export function createPresenceSocket(
  tokenProvider?: () => Promise<string>,
  guestDetails?: { guestName: string; guestId: string }
) {
  // SINGLETON PATTERN: Return existing connected socket if available
  if (globalSocket && globalSocket.connected) {
    return globalSocket
  }

  const serverUrl = import.meta.env.VITE_PRESENCE_SERVER_URL || 'http://localhost:3001'
  const socket = io(serverUrl, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
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

  globalSocket = socket
  return socket
}

// Clear global socket on disconnect
export function clearPresenceSocket() {
  if (globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}

