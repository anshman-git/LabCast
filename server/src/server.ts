import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { Server } from 'socket.io'
import { config } from './config.js'
import { PresenceRegistry } from './presence/presence.registry.js'
import { registerPresenceGateway } from './presence/presence.gateway.js'
import type { AuthenticatedSocketData } from './presence/presence.types.js'

if (!getApps().length) initializeApp({ credential: applicationDefault() })

const app = express()
app.use(cors({ origin: config.clientOrigin }))
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }))

const httpServer = createServer(app)
const io = new Server<object, object, object, AuthenticatedSocketData>(httpServer, { cors: { origin: config.clientOrigin, methods: ['GET', 'POST'] }, transports: ['websocket', 'polling'] })

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    const guestName = socket.handshake.auth.guestName
    const guestId = socket.handshake.auth.guestId

    if (token && typeof token === 'string' && token !== 'guest') {
      try {
        const decoded = await getAuth().verifyIdToken(token)
        socket.data.userId = decoded.uid
        socket.data.displayName = typeof decoded.name === 'string' ? decoded.name : decoded.email ?? 'Teacher'
        socket.data.role = 'teacher'
        return next()
      } catch {
        // Token verification failed, fallback to guest if guestName present
      }
    }

    // Guest student auth
    const effectiveName = typeof guestName === 'string' && guestName.trim() ? guestName.trim() : 'Guest Student'
    const effectiveId = typeof guestId === 'string' && guestId.trim() ? guestId.trim() : `guest_${Math.random().toString(36).substring(2, 9)}`

    socket.data.userId = effectiveId
    socket.data.displayName = effectiveName
    socket.data.role = 'student'
    next()
  } catch (err) {
    next(new Error('AUTHENTICATION_FAILED'))
  }
})

registerPresenceGateway(io, new PresenceRegistry(config.reconnectGraceMs))
httpServer.listen(config.port, () => console.info(`Presence server listening on ${config.port}`))
