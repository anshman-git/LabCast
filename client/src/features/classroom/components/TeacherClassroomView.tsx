import React, { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Hand,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Radio,
  Send,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'
import { useRoomPresence } from '../../presence/useRoomPresence'
import { useClassroomStore } from '../classroom.store'
import { ScreenShareStream } from './ScreenShareStream'

export function TeacherClassroomView({ roomCode }: { roomCode: string }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const presence = useRoomPresence(roomCode, 'teacher')

  const {
    isScreenSharing,
    raisedHands,
    lowerHand,
    messages,
    sendMessage,
    micEnabled,
    toggleMic,
    setRoomStatus,
  } = useClassroomStore()

  const [inputMessage, setInputMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeRightTab, setActiveRightTab] = useState<'participants' | 'chat'>('participants')
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Room code copied', roomCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage({
      senderId: user?.uid || 'teacher-id',
      senderName: user?.displayName || 'Teacher',
      senderRole: 'teacher',
      text: inputMessage.trim(),
    })
    setInputMessage('')
  }

  const endSession = () => {
    setRoomStatus('ended')
    toast.info('Session Ended', 'Students have been notified.')
    navigate('/teacher/dashboard')
  }

  const liveStudents = presence.participants.filter((p) => p.role === 'student')
  const teacherName = user?.displayName || user?.email?.split('@')[0] || 'Teacher'

  // Participants list
  const participantsList = [
    { id: 'teacher-self', name: `${teacherName} (You)`, role: 'teacher' as const },
    ...liveStudents.map(s => ({ id: s.userId, name: s.displayName, role: 'student' as const, isHandRaised: raisedHands.some(h => h.userId === s.userId) }))
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
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Room Code: <strong className="font-mono text-zinc-200">{roomCode}</strong> • {liveStudents.length} students</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timer */}
          <div className="h-8 px-2.5 rounded-[8px] border border-zinc-800/80 bg-zinc-900/50 text-xs font-mono text-zinc-300 hidden sm:flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
            {formatTimer(secondsElapsed)}
          </div>

          {/* Room Code Copy */}
          <button
            type="button"
            onClick={copyRoomCode}
            className="h-8 px-2.5 rounded-[8px] border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {roomCode}
          </button>

          {/* Participant Count */}
          <div className="hidden sm:flex h-8 px-2.5 rounded-[8px] border border-zinc-800/80 bg-zinc-900/50 items-center gap-1.5 text-xs text-zinc-400">
            <Users size={13} className="text-blue-400" />
            <span>{liveStudents.length + 1}</span>
          </div>

          {/* End Session */}
          <button
            type="button"
            onClick={endSession}
            className="h-8 px-3 rounded-[8px] bg-rose-600/90 text-white font-medium text-xs hover:bg-rose-500 transition-colors flex items-center gap-1.5"
          >
            <PhoneOff size={13} /> End Session
          </button>
        </div>
      </header>

      {/* Main Classroom Viewport: Center (~75%) + Right Sidebar */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-3 gap-3">
        {/* Center Screen Share Area (~75%) */}
        <div className="flex-1 flex flex-col rounded-[10px] border border-zinc-800 bg-zinc-900/40 min-w-0 overflow-hidden relative">
          {/* Raised Hands Alert Banner */}
          {raisedHands.length > 0 && (
            <div className="shrink-0 flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/8 px-4 py-2">
              <Hand size={13} className="text-amber-400 shrink-0" />
              <span className="text-xs text-amber-300 font-medium">
                {raisedHands.length} student{raisedHands.length > 1 ? 's' : ''} raised hand:&nbsp;
                {raisedHands.map(h => h.userName).join(', ')}
              </span>
            </div>
          )}
          {/* Screen Share Stream */}
          <div className="flex-1 relative">
            <ScreenShareStream isTeacher={true} />
          </div>
        </div>

        {/* Right Sidebar (Participants & Chat) */}
        <div className="w-80 shrink-0 rounded-[10px] border border-zinc-800 bg-zinc-900/70 flex flex-col overflow-hidden">
          {/* Sidebar Tab Controls */}
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
              <Users size={13} /> Participants ({liveStudents.length + 1})
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

          {/* Sidebar Content */}
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            {activeRightTab === 'participants' ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  In this session
                </div>
                {participantsList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-[8px] border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex size-6 items-center justify-center rounded-full text-[10px] font-medium ${p.role === 'teacher' ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-300'}`}>
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-zinc-200">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.role === 'teacher' && (
                        <span className="text-[10px] text-blue-400 font-medium">Host</span>
                      )}
                      {'isHandRaised' in p && p.isHandRaised && (
                        <button
                          type="button"
                          onClick={() => lowerHand(p.id)}
                          className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full hover:bg-amber-500/20 transition-colors"
                          title="Dismiss hand"
                        >
                          <Hand size={10} /> ✋
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {liveStudents.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No students connected yet.
                    <p className="mt-1 text-zinc-600">Share code <strong className="font-mono text-zinc-400">{roomCode}</strong> to invite them.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-zinc-500 py-8">
                    No messages yet. Start the conversation.
                  </p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${m.senderRole === 'teacher' ? 'text-blue-400' : 'text-zinc-300'}`}>
                        {m.senderName}
                        {m.senderRole === 'teacher' && <span className="ml-1 text-blue-500/70 font-normal">(You)</span>}
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

          {/* Chat Input (only in chat tab) */}
          {activeRightTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-zinc-800 bg-zinc-950 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Send message to class..."
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
      <footer className="h-14 shrink-0 border-t border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between z-30">
        {/* Left: Mic Control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={`h-10 px-3 rounded-[10px] border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              micEnabled
                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
            title={micEnabled ? 'Mute mic' : 'Unmute mic'}
          >
            {micEnabled ? <Mic size={15} /> : <MicOff size={15} />}
            <span className="hidden sm:inline">{micEnabled ? 'Mic On' : 'Mic Off'}</span>
          </button>
        </div>

        {/* Center: Share Screen + Record */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className={`h-10 px-4 rounded-[10px] text-xs font-medium flex items-center gap-2 transition-all ${
              isScreenSharing
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Monitor size={15} />
            {isScreenSharing ? 'Sharing...' : 'Share Screen'}
          </button>

          <button
            type="button"
            className="h-10 px-3.5 rounded-[10px] border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center gap-1.5 hover:text-white hover:border-zinc-600 transition-colors"
          >
            <Radio size={15} className="text-rose-400" /> Record
          </button>
        </div>

        {/* Right: End Session */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={endSession}
            className="h-10 px-4 rounded-[10px] bg-rose-600/90 text-white font-medium text-xs hover:bg-rose-500 transition-colors flex items-center gap-1.5"
          >
            <LogOut size={15} /> End Session
          </button>
        </div>
      </footer>
    </div>
  )
}
