import React, { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Hand,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useToast } from '../../notifications/toast.context'
import { useRoomPresence } from '../../presence/useRoomPresence'
import { useClassroomStore, type ChatMessage } from '../classroom.store'
import { useWebRTCStream } from '../hooks/useWebRTCStream'
import { ScreenShareStream } from './ScreenShareStream'

export function StudentClassroomView({
  roomCode,
  guestName = 'Student',
}: {
  roomCode: string
  guestName?: string
}) {
  const navigate = useNavigate()
  const toast = useToast()

  const guestId =
    sessionStorage.getItem('labcast_guest_id') ||
    `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`

  const presence = useRoomPresence(roomCode, 'student', guestName, guestId)

  const {
    raisedHands,
    raiseHand,
    lowerHand,
    messages,
    sendMessage,
    micEnabled,
    toggleMic,
  } = useClassroomStore()

  const { isSharing, activeStream } = useWebRTCStream({
    roomCode,
    isTeacher: false,
    socket: presence.socket,
  })

  const [inputMessage, setInputMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'participants' | 'chat'>('participants')

  const isHandRaised = raisedHands.some((h) => h.userId === guestId)

  // Real Socket listener for Chat and Hand Raises
  // FIX #3: Ensure socket is connected AND listeners are properly attached
  useEffect(() => {
    const socket = presence.socket
    // FIX #9: Check that socket is actually connected, not just exists
    if (!socket || !presence.isConnected) return

    const handleChatMessage = (msg: ChatMessage) => {
      // FIX #3: Fix message filtering logic - receive messages from OTHER users
      if (msg.senderId === guestId) {
        // This is our own message being echoed back, don't double-add
        return
      }
      sendMessage(msg)
    }

    const handleHandRaised = (payload: { userId: string; userName: string }) => {
      raiseHand(payload.userId, payload.userName)
    }

    const handleHandLowered = (payload: { userId: string }) => {
      lowerHand(payload.userId)
    }

    socket.on('chat:message', handleChatMessage)
    socket.on('hand:raised', handleHandRaised)
    socket.on('hand:lowered', handleHandLowered)

    return () => {
      socket.off('chat:message', handleChatMessage)
      socket.off('hand:raised', handleHandRaised)
      socket.off('hand:lowered', handleHandLowered)
    }
  }, [presence.socket, presence.isConnected, guestId, sendMessage, raiseHand, lowerHand])

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Room code copied', roomCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleHand = () => {
    if (isHandRaised) {
      lowerHand(guestId)
      if (presence.socket) {
        presence.socket.emit('hand:lower', { roomCode, userId: guestId })
      }
      toast.info('Hand lowered')
    } else {
      raiseHand(guestId, guestName)
      if (presence.socket) {
        presence.socket.emit('hand:raise', { roomCode, userId: guestId, userName: guestName })
      }
      toast.success('Hand raised ✋', 'Teacher notified')
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const msgPayload = {
      senderId: guestId,
      senderName: guestName,
      senderRole: 'student' as const,
      text: inputMessage.trim(),
    }

    sendMessage(msgPayload)

    if (presence.socket) {
      presence.socket.emit('chat:send', { ...msgPayload, roomCode })
    }

    setInputMessage('')
  }

  const leaveRoom = () => {
    toast.info('Left Classroom')
    navigate('/join')
  }

  const liveTeacher = presence.participants.find((p) => p.role === 'teacher')
  const liveStudents = presence.participants.filter((p) => p.role === 'student')

  // Real connected participants list
  const participantsList = [
    ...(liveTeacher
      ? [{ id: liveTeacher.userId, name: `${liveTeacher.displayName} (Teacher)`, role: 'teacher' as const }]
      : [{ id: 'teacher-host', name: 'Teacher', role: 'teacher' as const }]),
    ...liveStudents.map((s) => ({
      id: s.userId,
      name: s.userId === guestId ? `${guestName} (You)` : s.displayName,
      role: 'student' as const,
      isHandRaised: raisedHands.some((h) => h.userId === s.userId),
    })),
  ]

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-13 shrink-0 border-b border-zinc-800/80 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <BrandMark compact />
          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-semibold text-zinc-100">Lab Classroom</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Classroom
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Host: {liveTeacher?.displayName || 'Teacher'} • Room Code:{' '}
              <strong className="font-mono text-zinc-200">{roomCode}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Room Code Badge */}
          <button
            type="button"
            onClick={copyRoomCode}
            className="h-8 px-2.5 rounded-[8px] border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {roomCode}
          </button>

          {/* Connected Participants Count */}
          <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-400">
            <Users size={13} className="text-blue-400" />
            <span>{participantsList.length}</span>
          </div>
        </div>
      </header>

      {/* Main Classroom Viewport: Center Broadcast (~75%) + Right Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-3 gap-3">
        {/* Center Screen Share Area */}
        <div className="flex-1 flex flex-col rounded-[10px] border border-zinc-800 bg-zinc-900/40 min-w-0 overflow-hidden relative">
          <div className="flex-1 relative">
            <ScreenShareStream
              isTeacher={false}
              activeStream={activeStream}
              isSharing={isSharing}
            />
          </div>
        </div>

        {/* Right Sidebar (Participants & Chat) */}
        <div className="w-80 shrink-0 rounded-[10px] border border-zinc-800 bg-zinc-900/70 flex flex-col overflow-hidden">
          {/* Tab Controls */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1.5 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveRightTab('participants')}
              className={`flex-1 h-8 rounded-[6px] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === 'participants'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users size={13} /> Participants ({participantsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('chat')}
              className={`flex-1 h-8 rounded-[6px] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeRightTab === 'chat'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare size={13} /> Chat ({messages.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            {activeRightTab === 'participants' ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  Connected Classmates
                </div>
                {participantsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[8px] border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex size-6 items-center justify-center rounded-full text-[10px] font-medium ${
                          p.role === 'teacher'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-zinc-200">{p.name}</span>
                    </div>

                    {'isHandRaised' in p && p.isHandRaised && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Hand size={11} /> Raised
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-zinc-500 py-8">
                    No messages yet. Ask a question below.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span
                        className={`font-medium ${
                          m.senderRole === 'teacher' ? 'text-blue-400' : 'text-zinc-200'
                        }`}
                      >
                        {m.senderName} {m.senderRole === 'teacher' && '(Teacher)'}
                      </span>
                      <span className="text-[10px] text-zinc-500">{m.timestamp}</span>
                    </div>
                    <div className="rounded-[8px] border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-200 leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Form when chat tab active */}
          {activeRightTab === 'chat' && (
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 border-t border-zinc-800 bg-zinc-950 flex gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 h-9 rounded-[8px] border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-[8px] bg-zinc-100 text-zinc-950 hover:bg-white transition-colors flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <footer className="h-13 shrink-0 border-t border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`h-9 px-3 rounded-[8px] border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              micEnabled
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            <span className="hidden sm:inline">{micEnabled ? 'Mic On' : 'Mic Off'}</span>
          </button>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleHand}
            className={`h-9 px-4 rounded-[8px] text-xs font-medium flex items-center gap-2 transition-all ${
              isHandRaised
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold shadow-sm'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Hand size={14} />
            {isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}
          </button>
        </div>

        {/* Leave Room Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={leaveRoom}
            className="h-9 px-3.5 rounded-[8px] bg-rose-600/90 text-white font-medium text-xs hover:bg-rose-500 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} /> Leave
          </button>
        </div>
      </footer>
    </div>
  )
}
