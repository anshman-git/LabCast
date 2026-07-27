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
const LOCAL_ROOMS_KEY = 'labcast_created_rooms'

function getLocalRooms(): Record<string, Room> {
  try {
    const raw = localStorage.getItem(LOCAL_ROOMS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalRoom(room: Room) {
  try {
    const rooms = getLocalRooms()
    rooms[room.roomCode] = room
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms))
  } catch {}
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
    const title = input.title.trim()
    const subject = input.subject.trim()
    if (!title || !subject) throw new Error('Room title and subject are required.')

    if (firestoreDb && isFirebaseConfigured) {
      for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
        const roomCode = createRoomCode()
        const roomRef = doc(firestoreDb, 'rooms', roomCode)
        const memberRef = doc(firestoreDb, 'members', `${roomCode}_${teacherId}`)
        const wasCreated = await runTransaction(firestoreDb, async (transaction) => {
          const existing = await transaction.get(roomRef)
          if (existing.exists()) return false
          const room = { id: roomRef.id, roomCode, teacherId, title, subject, status: 'waiting' as const, createdAt: serverTimestamp() }
          transaction.set(roomRef, room)
          transaction.set(memberRef, { roomId: roomRef.id, userId: teacherId, role: 'teacher', joinedAt: serverTimestamp() })
          return true
        })
        if (wasCreated) {
          const createdRoom: Room = { id: roomRef.id, roomCode, teacherId, title, subject, status: 'waiting', createdAt: null }
          saveLocalRoom(createdRoom)
          return createdRoom
        }
      }
      throw new RoomCodeGenerationError()
    }

    // Local runtime creation fallback
    const roomCode = createRoomCode()
    const localRoom: Room = {
      id: `room_${roomCode}`,
      roomCode,
      teacherId,
      title,
      subject,
      status: 'active',
      createdAt: null,
    }
    saveLocalRoom(localRoom)
    return localRoom
  },

  async joinRoom(roomCodeInput: string, userId: string): Promise<JoinRoomResult> {
    const roomCode = roomCodeInput.trim().toUpperCase()

    if (firestoreDb && isFirebaseConfigured) {
      const roomRef = doc(firestoreDb, 'rooms', roomCode)
      const memberRef = doc(firestoreDb, 'members', `${roomCode}_${userId}`)
      return runTransaction(firestoreDb, async (transaction) => {
        const roomSnapshot = await transaction.get(roomRef)
        if (!roomSnapshot.exists()) throw new RoomNotFoundError()
        const memberSnapshot = await transaction.get(memberRef)
        if (memberSnapshot.exists()) return { room: toRoom(roomSnapshot), alreadyJoined: true }
        transaction.set(memberRef, { roomId: roomRef.id, userId, role: 'student', joinedAt: serverTimestamp() })
        return { room: toRoom(roomSnapshot), alreadyJoined: false }
      })
    }

    // Check local room store
    const localRoom = getLocalRooms()[roomCode]
    if (!localRoom) throw new RoomNotFoundError()
    return { room: localRoom, alreadyJoined: false }
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

    // Check local room store
    const localRoom = getLocalRooms()[roomCode]
    if (localRoom) {
      return localRoom
    }

    // No room found -> throw error (NO FAKE DEMO ROOM)
    throw new RoomNotFoundError()
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

    const localRooms = getLocalRooms()
    if (localRooms[roomCode]) {
      localRooms[roomCode].status = status
      localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(localRooms))
    }
  },
}
