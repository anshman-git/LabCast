import { create } from 'zustand'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'teacher' | 'student'
  text: string
  timestamp: string
}

export interface FloatingReaction {
  id: string
  emoji: string
  senderName: string
  leftOffsetPercent: number
}

export interface ClassroomState {
  roomCode: string | null
  roomStatus: 'waiting' | 'active' | 'ended'
  activeTab: 'screen' | 'presentation' | 'whiteboard' | 'students'
  isScreenSharing: boolean
  screenShareStreamUrl: string | null
  currentSlideIndex: number
  raisedHands: { userId: string; userName: string; timestamp: string }[]
  messages: ChatMessage[]
  reactions: FloatingReaction[]
  micEnabled: boolean
  cameraEnabled: boolean
  whiteboardStrokes: Array<{ type: string; points: Array<{ x: number; y: number }>; color: string; width: number }>

  // Actions
  setRoomCode: (code: string) => void
  setRoomStatus: (status: 'waiting' | 'active' | 'ended') => void
  setActiveTab: (tab: 'screen' | 'presentation' | 'whiteboard' | 'students') => void
  toggleScreenShare: (isSharing: boolean) => void
  setSlideIndex: (index: number) => void
  raiseHand: (userId: string, userName: string) => void
  lowerHand: (userId: string) => void
  sendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  sendReaction: (emoji: string, senderName: string) => void
  toggleMic: () => void
  toggleCamera: () => void
  addWhiteboardStroke: (stroke: { type: string; points: Array<{ x: number; y: number }>; color: string; width: number }) => void
  clearWhiteboard: () => void
}

const BROADCAST_CHANNEL_NAME = 'labcast_classroom_sync'
let broadcastChannel: BroadcastChannel | null = null

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  } catch (err) {
    console.warn('BroadcastChannel initialization notice:', err)
  }
}

export const useClassroomStore = create<ClassroomState>((set, get) => {
  // Listen for broadcast messages from other tabs (Teacher <-> Student)
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data
      if (type === 'SYNC_STATE') {
        set(payload)
      } else if (type === 'RAISE_HAND') {
        const currentHands = get().raisedHands
        if (!currentHands.some((h) => h.userId === payload.userId)) {
          set({ raisedHands: [payload, ...currentHands] })
        }
      } else if (type === 'LOWER_HAND') {
        set({ raisedHands: get().raisedHands.filter((h) => h.userId !== payload) })
      } else if (type === 'SEND_MESSAGE') {
        set({ messages: [...get().messages, payload] })
      } else if (type === 'SEND_REACTION') {
        set({ reactions: [...get().reactions, payload] })
      } else if (type === 'SCREEN_SHARE_TOGGLE') {
        set({ isScreenSharing: payload.isSharing, activeTab: payload.isSharing ? 'screen' : get().activeTab })
      } else if (type === 'SLIDE_CHANGE') {
        set({ currentSlideIndex: payload })
      } else if (type === 'ROOM_STATUS') {
        set({ roomStatus: payload })
      } else if (type === 'WHITEBOARD_STROKE') {
        set({ whiteboardStrokes: [...get().whiteboardStrokes, payload] })
      } else if (type === 'WHITEBOARD_CLEAR') {
        set({ whiteboardStrokes: [] })
      }
    }
  }

  const broadcast = (type: string, payload: any) => {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type, payload })
      } catch (err) {
        console.warn('Broadcast error:', err)
      }
    }
  }

  return {
    roomCode: null,
    roomStatus: 'active',
    activeTab: 'screen',
    isScreenSharing: false,
    screenShareStreamUrl: null,
    currentSlideIndex: 0,
    raisedHands: [],
    messages: [],
    reactions: [],
    micEnabled: false,
    cameraEnabled: false,
    whiteboardStrokes: [],

    setRoomCode: (code) => set({ roomCode: code }),
    setRoomStatus: (status) => {
      set({ roomStatus: status })
      broadcast('ROOM_STATUS', status)
    },
    setActiveTab: (tab) => set({ activeTab: tab }),
    toggleScreenShare: (isSharing) => {
      set({ isScreenSharing: isSharing, activeTab: isSharing ? 'screen' : get().activeTab })
      broadcast('SCREEN_SHARE_TOGGLE', { isSharing })
    },
    setSlideIndex: (index) => {
      set({ currentSlideIndex: index })
      broadcast('SLIDE_CHANGE', index)
    },
    raiseHand: (userId, userName) => {
      const item = { userId, userName, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      const current = get().raisedHands
      if (!current.some((h) => h.userId === userId)) {
        const next = [item, ...current]
        set({ raisedHands: next })
        broadcast('RAISE_HAND', item)
      }
    },
    lowerHand: (userId) => {
      const next = get().raisedHands.filter((h) => h.userId !== userId)
      set({ raisedHands: next })
      broadcast('LOWER_HAND', userId)
    },
    sendMessage: (msg) => {
      const fullMsg: ChatMessage = {
        ...msg,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      set({ messages: [...get().messages, fullMsg] })
      broadcast('SEND_MESSAGE', fullMsg)
    },
    sendReaction: (emoji, senderName) => {
      const reaction: FloatingReaction = {
        id: Math.random().toString(36).substring(2, 9),
        emoji,
        senderName,
        leftOffsetPercent: Math.floor(Math.random() * 70) + 15,
      }
      set({ reactions: [...get().reactions, reaction] })
      broadcast('SEND_REACTION', reaction)

      setTimeout(() => {
        set({ reactions: get().reactions.filter((r) => r.id !== reaction.id) })
      }, 3500)
    },
    toggleMic: () => set((state) => ({ micEnabled: !state.micEnabled })),
    toggleCamera: () => set((state) => ({ cameraEnabled: !state.cameraEnabled })),
    addWhiteboardStroke: (stroke) => {
      set((state) => ({ whiteboardStrokes: [...state.whiteboardStrokes, stroke] }))
      broadcast('WHITEBOARD_STROKE', stroke)
    },
    clearWhiteboard: () => {
      set({ whiteboardStrokes: [] })
      broadcast('WHITEBOARD_CLEAR', null)
    },
  }
})
