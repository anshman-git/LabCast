import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { firebaseAuth } from '../../lib/firebase'
import { useAuth } from '../auth/auth.context'
import { createPresenceSocket } from './presence.socket'
import type { JoinResponse, PresenceParticipant, PresenceRole, PresenceStatus } from './presence.types'

type PresenceState = { participants: PresenceParticipant[]; status: PresenceStatus; error: string | null }
const initialState: PresenceState = { participants: [], status: 'idle', error: null }

export function useRoomPresence(roomCode: string | null, role: PresenceRole) {
  const { user } = useAuth()
  const [state, setState] = useState<PresenceState>(initialState)

  useEffect(() => {
    if (!roomCode || !user) { setState(initialState); return }
    let socket: Socket | undefined
    let disposed = false
    const connect = async () => {
      try {
        socket = createPresenceSocket(async () => {
          const currentUser = firebaseAuth?.currentUser
          if (!currentUser) throw new Error('Your authentication session has expired.')
          return currentUser.getIdToken()
        })
        const join = () => {
          if (!socket || disposed) return
          setState((current) => ({ ...current, status: 'connecting', error: null }))
          socket.emit('presence:join', { roomCode, role, displayName: user.displayName ?? user.email ?? undefined }, (response: JoinResponse) => {
            if (disposed) return
            if (response.ok) setState({ participants: response.participants, status: 'joined', error: null })
            else setState({ participants: [], status: 'error', error: response.message })
          })
        }
        socket.on('connect', join)
        socket.on('presence:participants', (participants: PresenceParticipant[]) => { if (!disposed) setState({ participants, status: 'joined', error: null }) })
        socket.on('connect_error', () => { if (!disposed) setState((current) => ({ ...current, status: 'error', error: 'Unable to connect to live room presence.' })) })
        socket.connect()
      } catch (error) {
        if (!disposed) setState({ participants: [], status: 'error', error: error instanceof Error ? error.message : 'Unable to connect to live room presence.' })
      }
    }
    void connect()
    return () => { disposed = true; socket?.emit('presence:leave'); socket?.disconnect() }
  }, [role, roomCode, user?.displayName, user?.email, user?.uid])

  return state
}
