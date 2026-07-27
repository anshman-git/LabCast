import React, { useState } from 'react'
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
import { useClassroomStore } from '../classroom.store'
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

  const {
    raisedHands,
    raiseHand,
    lowerHand,
    messages,
    sendMessage,
    micEnabled,
    toggleMic,
  } = useClassroomStore()

  const [inputMessage, setInputMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'participants' | 'chat'>('participants')

  const guestId = sessionStorage.getItem('labcast_guest_id') || `guest_${roomCode}_user`
  const isHandRaised = raisedHands.some((h) => h.userId === guestId)

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Room code copied', roomCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleHand = () => {
    if (isHandRaised) {
      lowerHand(guestId)
      toast.info('Hand lowered')
    } else {
      raiseHand(guestId, guestName)
      toast.success('Hand raised ✋', 'Teacher notified')
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage({
      senderId: guestId,
      senderName: guestName,
      senderRole: 'student',
      text: inputMessage.trim(),
    })
    setInputMessage('')
  }

  const leaveRoom = () => {
    toast.info('Left Classroom')
    navigate('/join')
  }

  // Participants list representation
  const participantsList = [
    { id: 'teacher-host', name: 'Prof. Anderson (Teacher)', role: 'teacher' },
    { id: guestId, name: `${guestName} (You)`, role: 'student', isHandRaised },
    ...raisedHands.filter(h => h.userId !== guestId).map(h => ({ id: h.userId, name: h.userName, role: 'student', isHandRaised: true }))
  ]

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 shrink-0 border-b border-zinc-800/80 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <BrandMark compact />
          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-semibold text-zinc-100">CS 401 Systems Lab</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Broadcast
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Teacher: Prof. Anderson • Room Code: <strong className="font-mono text-zinc-200">{roomCode}</strong></p>
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

          {/* Connected badge */}
          <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] border border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-400">
            <Users size={14} className="text-blue-400" />
            <span>{participantsList.length} participants</span>
          </div>
        </div>
      </header>

      {/* Main Classroom Viewport: Center (75%) + Right Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-3 gap-3">
        {/* Center Screen Share Area (~75%) */}
        <div className="flex-1 flex flex-col rounded-[10px] border border-zinc-800 bg-zinc-900/40 min-w-0 overflow-hidden relative">
          <div className="flex-1 relative">
            <ScreenShareStream isTeacher={false} />
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
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">Connected Classmates</div>
                {participantsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[8px] border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300">
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-zinc-200">{p.name}</span>
                    </div>

                    {p.isHandRaised && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        <Hand size={11} /> Raised
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className={`font-medium ${m.senderRole === 'teacher' ? 'text-blue-400' : 'text-zinc-200'}`}>
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
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-zinc-800 bg-zinc-950 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 h-9 rounded-[8px] border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
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

      {/* Bottom Toolbar (40px controls) */}
      <footer className="h-14 shrink-0 border-t border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          {/* Mic Button (future) */}
          <button
            type="button"
            onClick={toggleMic}
            className={`h-10 px-3 rounded-[10px] border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              micEnabled
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {micEnabled ? <Mic size={15} /> : <MicOff size={15} />}
            <span className="hidden sm:inline">{micEnabled ? 'Mic On' : 'Mic Off'}</span>
          </button>
        </div>

        {/* Center Control Actions */}
        <div className="flex items-center gap-3">
          {/* Raise Hand Button */}
          <button
            type="button"
            onClick={handleToggleHand}
            className={`h-10 px-4 rounded-[10px] text-xs font-medium flex items-center gap-2 transition-all ${
              isHandRaised
                ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Hand size={15} />
            {isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}
          </button>
        </div>

        {/* Leave Classroom Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={leaveRoom}
            className="h-10 px-4 rounded-[10px] bg-rose-600/90 text-white font-medium text-xs hover:bg-rose-500 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={15} /> Leave
          </button>
        </div>
      </footer>
    </div>
  )
}
