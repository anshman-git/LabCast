import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { firebaseAuth } from '../../lib/firebase'
import { useAuth } from '../auth/auth.context'
import { createPresenceSocket } from './presence.socket'
import type { JoinResponse, PresenceParticipant, PresenceRole, PresenceStatus } from './presence.types'

type PresenceState = { participants: PresenceParticipant[]; status: PresenceStatus; error: string | null; isConnected: boolean }
const initialState: PresenceState = { participants: [], status: 'idle', error: null, isConnected: false }

export function useRoomPresence(
  roomCode: string | null,
  role: PresenceRole,
  guestName?: string,
  guestId?: string
) {
  const { user } = useAuth()
  const [state, setState] = useState<PresenceState>(initialState)
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null)

  useEffect(() => {
    if (!roomCode) {
      setState(initialState)
      return
    }

    const isStudent = role === 'student'
    if (!isStudent && !user) {
      setState(initialState)
      return
    }

    let disposed = false
    let joinAttempted = false

    const studentName = guestName || sessionStorage.getItem('labcast_student_name') || 'Student'
    const studentId = guestId || sessionStorage.getItem('labcast_guest_id') || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

    const socket = createPresenceSocket(
      user
        ? async () => {
            const currentUser = firebaseAuth?.currentUser
            if (currentUser) return currentUser.getIdToken()
            return 'guest'
          }
        : undefined,
      { guestName: studentName, guestId: studentId }
    )

    const displayName = user
      ? user.displayName || user.email?.split('@')[0] || 'Teacher'
      : studentName

    const emitPresenceJoin = () => {
      if (disposed || joinAttempted) return
      joinAttempted = true
      console.log('[PRESENCE] Socket connected, attempting to join room:', { roomCode, role, displayName })
      setState((current) => ({ ...current, status: 'connecting', error: null }))
      console.log('[PRESENCE] Emitting presence:join event with payload:', { roomCode, role, displayName, guestId: studentId })
      socket.emit(
        'presence:join',
        { roomCode, role, displayName, guestId: studentId },
        (response: JoinResponse) => {
          console.log('[PRESENCE] Received join response:', response)
          if (disposed) return
          if (response.ok) {
            console.log('[PRESENCE] Join successful, participants count:', response.participants.length, 'Participants:', response.participants)
            setState({
              participants: response.participants,
              status: 'joined',
              error: null,
              isConnected: true,
            })
          } else {
            console.error('[PRESENCE] Join failed:', response.code, response.message)
            setState({
              participants: [],
              status: 'error',
              error: response.message,
              isConnected: false,
            })
          }
        }
      )
    }

    const handlePresenceParticipants = (participants: PresenceParticipant[]) => {
      console.log('[PRESENCE] Received presence:participants broadcast, count:', participants.length, 'Participants:', participants)
      if (!disposed) {
        setState((current) => ({
          ...current,
          participants,
          status: 'joined',
          error: null,
          isConnected: true,
        }))
      }
    }

    const handleConnect = () => {
      if (!disposed && !joinAttempted) {
        emitPresenceJoin()
      }
    }

    const handleConnectError = (err: Error) => {
      if (!disposed) {
        console.error('Presence socket connection error:', err.message)
        setState((current) => ({
          ...current,
          status: 'error',
          error: err.message || 'Connection failed',
          isConnected: false,
        }))
      }
    }

    const handleDisconnect = (reason: string) => {
      if (!disposed) {
        console.warn('Presence socket disconnected:', reason)
        setState((current) => ({
          ...current,
          status: 'disconnected',
          isConnected: false,
          error: reason,
        }))
        joinAttempted = false
      }
    }

    socket.on('connect', handleConnect)
    socket.on('presence:participants', handlePresenceParticipants)
    socket.on('connect_error', handleConnectError)
    socket.on('disconnect', handleDisconnect)

    setSocketInstance(socket)
    socket.connect()

    if (socket.connected) {
      emitPresenceJoin()
    }

    return () => {
      disposed = true
      socket.emit('presence:leave')
      socket.off('connect', handleConnect)
      socket.off('presence:participants', handlePresenceParticipants)
      socket.off('connect_error', handleConnectError)
      socket.off('disconnect', handleDisconnect)
    }
  }, [role, roomCode, user, guestName, guestId])

  return { ...state, socket: socketInstance }
}
