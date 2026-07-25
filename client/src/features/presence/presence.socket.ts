import { io, type Socket } from 'socket.io-client'

export function createPresenceSocket(tokenProvider: () => Promise<string>) {
  const serverUrl = import.meta.env.VITE_PRESENCE_SERVER_URL
  if (!serverUrl) throw new Error('Presence server is not configured. Set VITE_PRESENCE_SERVER_URL.')
  return io(serverUrl, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    auth: (callback) => { void tokenProvider().then((token) => callback({ token })).catch(() => callback({})) },
  }) as Socket
}
