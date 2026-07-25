import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { Server } from 'socket.io';
import { config } from './config.js';
import { PresenceRegistry } from './presence/presence.registry.js';
import { registerPresenceGateway } from './presence/presence.gateway.js';
if (!getApps().length)
    initializeApp({ credential: applicationDefault() });
const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: config.clientOrigin, methods: ['GET', 'POST'] }, transports: ['websocket', 'polling'] });
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (typeof token !== 'string' || !token)
            return next(new Error('UNAUTHORIZED'));
        const decoded = await getAuth().verifyIdToken(token);
        socket.data.userId = decoded.uid;
        socket.data.displayName = typeof decoded.name === 'string' ? decoded.name : decoded.email ?? 'LabCast user';
        next();
    }
    catch {
        next(new Error('UNAUTHORIZED'));
    }
});
registerPresenceGateway(io, new PresenceRegistry(config.reconnectGraceMs));
httpServer.listen(config.port, () => console.info(`Presence server listening on ${config.port}`));
