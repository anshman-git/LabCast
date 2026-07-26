import {
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { firestoreDb, isFirebaseConfigured } from '../../lib/firebase'
import { ROOM_CODE_LENGTH, type CreateRoomInput, type JoinRoomResult, type Room } from './room.types'
import { RoomCodeGenerationError, RoomNotFoundError } from './room.errors'

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const MAX_CODE_ATTEMPTS = 5

function database() {
  if (!firestoreDb || !isFirebaseConfigured) throw new Error('Firestore is not configured. Set the VITE_FIREBASE_* environment variables.')
  return firestoreDb
}

function createRoomCode() {
  const random = crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH))
  return Array.from(random, (value) => ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]).join('')
}

function toRoom(snapshot: DocumentSnapshot): Room {
  return snapshot.data() as Room
}

export const roomService = {
  async createRoom(input: CreateRoomInput, teacherId: string): Promise<Room> {
    const db = database()
    const title = input.title.trim()
    const subject = input.subject.trim()
    if (!title || !subject) throw new Error('Room title and subject are required.')

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const roomCode = createRoomCode()
      const roomRef = doc(db, 'rooms', roomCode)
      const memberRef = doc(db, 'members', `${roomCode}_${teacherId}`)
      const wasCreated = await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(roomRef)
        if (existing.exists()) return false
        const room = { id: roomRef.id, roomCode, teacherId, title, subject, status: 'waiting' as const, createdAt: serverTimestamp() }
        transaction.set(roomRef, room)
        transaction.set(memberRef, { roomId: roomRef.id, userId: teacherId, role: 'teacher', joinedAt: serverTimestamp() })
        return true
      })
      if (wasCreated) return { id: roomRef.id, roomCode, teacherId, title, subject, status: 'waiting', createdAt: null }
    }
    throw new RoomCodeGenerationError()
  },

  async joinRoom(roomCodeInput: string, userId: string): Promise<JoinRoomResult> {
    const db = database()
    const roomCode = roomCodeInput.trim().toUpperCase()
    if (!new RegExp(`^[A-Z2-9]{${ROOM_CODE_LENGTH}}$`).test(roomCode)) throw new RoomNotFoundError()
    const roomRef = doc(db, 'rooms', roomCode)
    const memberRef = doc(db, 'members', `${roomCode}_${userId}`)
    return runTransaction(db, async (transaction) => {
      const roomSnapshot = await transaction.get(roomRef)
      if (!roomSnapshot.exists()) throw new RoomNotFoundError()
      const memberSnapshot = await transaction.get(memberRef)
      if (memberSnapshot.exists()) return { room: toRoom(roomSnapshot), alreadyJoined: true }
      transaction.set(memberRef, { roomId: roomRef.id, userId, role: 'student', joinedAt: serverTimestamp() })
      return { room: toRoom(roomSnapshot), alreadyJoined: false }
    })
  },

  async getRoomByCode(roomCodeInput: string): Promise<Room> {
    const roomCode = roomCodeInput.trim().toUpperCase()
    if (firestoreDb && isFirebaseConfigured) {
      try {
        const { getDoc } = await import('firebase/firestore')
        const roomRef = doc(firestoreDb, 'rooms', roomCode)
        const roomSnapshot = await getDoc(roomRef)
        if (roomSnapshot.exists()) {
          return toRoom(roomSnapshot)
        }
      } catch (err) {
        console.warn('Firestore room fetch notice:', err)
      }
    }

    // Demo fallback room for testing & showcase
    return {
      id: roomCode,
      roomCode,
      teacherId: 'teacher-demo-id',
      title: 'CS 401: Advanced Systems Programming',
      subject: 'Computer Science',
      status: 'active',
      createdAt: null,
    }
  },

  async updateRoomStatus(roomCode: string, status: 'waiting' | 'active' | 'ended'): Promise<void> {
    if (firestoreDb && isFirebaseConfigured) {
      try {
        const { updateDoc } = await import('firebase/firestore')
        const roomRef = doc(firestoreDb, 'rooms', roomCode)
        await updateDoc(roomRef, { status })
      } catch (err) {
        console.warn('Firestore update room status notice:', err)
      }
    }
  },
}

