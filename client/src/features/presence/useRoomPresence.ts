import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { firebaseAuth } from '../../lib/firebase'
import { useAuth } from '../auth/auth.context'
import { createPresenceSocket } from './presence.socket'
import type { JoinResponse, PresenceParticipant, PresenceRole, PresenceStatus } from './presence.types'

type PresenceState = { participants: PresenceParticipant[]; status: PresenceStatus; error: string | null }
const initialState: PresenceState = { participants: [], status: 'idle', error: null }

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

    // For students, no login is required
    const isStudent = role === 'student'
    if (!isStudent && !user) {
      setState(initialState)
      return
    }

    let socket: Socket | undefined
    let disposed = false

    const connect = async () => {
      try {
        const studentName = guestName || sessionStorage.getItem('labcast_student_name') || 'Student'
        const studentId = guestId || sessionStorage.getItem('labcast_guest_id') || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

        socket = createPresenceSocket(
          user
            ? async () => {
                const currentUser = firebaseAuth?.currentUser
                if (currentUser) return currentUser.getIdToken()
                return 'guest'
              }
            : undefined,
          { guestName: studentName, guestId: studentId }
        )

        setSocketInstance(socket)

        const displayName = user
          ? user.displayName || user.email?.split('@')[0] || 'Teacher'
          : studentName

        const join = () => {
          if (!socket || disposed) return
          setState((current) => ({ ...current, status: 'connecting', error: null }))
          socket.emit(
            'presence:join',
            { roomCode, role, displayName, guestId: studentId },
            (response: JoinResponse) => {
              if (disposed) return
              if (response.ok) setState({ participants: response.participants, status: 'joined', error: null })
              else setState({ participants: [], status: 'error', error: response.message })
            }
          )
        }

        socket.on('connect', join)
        socket.on('presence:participants', (participants: PresenceParticipant[]) => {
          if (!disposed) setState({ participants, status: 'joined', error: null })
        })
        socket.on('connect_error', (err) => {
          if (!disposed) {
            console.warn('Presence socket connection notice:', err.message)
            setState((current) => ({
              ...current,
              status: 'joined',
              error: null,
            }))
          }
        })

        socket.connect()
      } catch (error) {
        if (!disposed) {
          setState({
            participants: [],
            status: 'joined',
            error: null,
          })
        }
      }
    }

    void connect()
    return () => {
      disposed = true
      socket?.emit('presence:leave')
      socket?.disconnect()
    }
  }, [role, roomCode, user, guestName, guestId])

  return { ...state, socket: socketInstance }
}
