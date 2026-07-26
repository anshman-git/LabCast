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
  Video,
  VideoOff,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'
import { useClassroomStore } from '../classroom.store'
import { ScreenShareStream } from './ScreenShareStream'
import { SlideDeckViewer } from './SlideDeckViewer'
import { WhiteboardCanvas } from './WhiteboardCanvas'

const REACTION_EMOJIS = ['👏', '👍', '🔥', '💡', '❤️']

export function StudentClassroomView({ roomCode }: { roomCode: string }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const {
    activeTab,
    raisedHands,
    raiseHand,
    lowerHand,
    messages,
    sendMessage,
    reactions,
    sendReaction,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    roomStatus,
  } = useClassroomStore()

  const [inputMessage, setInputMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(true)

  const isHandRaised = raisedHands.some((h) => h.userId === (user?.uid || 'student-uid'))

  // Listen if room ended
  useEffect(() => {
    if (roomStatus === 'ended') {
      toast.info('Session Ended', 'The teacher has ended this classroom session.')
      navigate('/student/dashboard')
    }
  }, [roomStatus, navigate, toast])

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode)
    setCopied(true)
    toast.success('Room code copied', roomCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggleHand = () => {
    const studentName = user?.displayName || user?.email?.split('@')[0] || 'Student'
    const studentId = user?.uid || 'student-uid'
    if (isHandRaised) {
      lowerHand(studentId)
      toast.info('Hand lowered')
    } else {
      raiseHand(studentId, studentName)
      toast.handRaised('You')
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return
    sendMessage({
      senderId: user?.uid || 'student-uid',
      senderName: user?.displayName || user?.email?.split('@')[0] || 'Student',
      senderRole: 'student',
      text: inputMessage.trim(),
    })
    setInputMessage('')
  }

  const handleReactionClick = (emoji: string) => {
    const studentName = user?.displayName || 'Student'
    sendReaction(emoji, studentName)
  }

  const leaveRoom = () => {
    toast.info('Left Room', 'Returned to student dashboard.')
    navigate('/student/dashboard')
  }

  return (
    <div className="relative flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Floating Reaction Emojis Overlay */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-24 animate-bounce text-4xl shadow-2xl transition-all duration-1000"
            style={{ left: `${r.leftOffsetPercent}%` }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="shrink-0 border-b border-white/10 bg-slate-900/90 px-6 py-3.5 backdrop-blur-xl flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <BrandMark />
          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <div>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              CS 401: Advanced Systems Programming
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                Connected
              </span>
            </h1>
            <p className="text-xs text-slate-400">Instructor: Prof. Anderson • Room {roomCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Room Code Badge */}
          <button
            type="button"
            onClick={copyRoomCode}
            className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-mono font-bold text-sky-300 hover:bg-sky-500/20 transition-all"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            {roomCode}
          </button>

          {/* Leave Button */}
          <button
            type="button"
            onClick={leaveRoom}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-red-400 hover:text-red-300 transition-all"
          >
            <LogOut className="size-3.5" /> Leave Room
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex gap-4 p-4 z-20">
        {/* Main Display Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 relative">
            {activeTab === 'screen' && <ScreenShareStream isTeacher={false} />}
            {activeTab === 'presentation' && <SlideDeckViewer isTeacher={false} />}
            {activeTab === 'whiteboard' && <WhiteboardCanvas isReadOnly={true} />}
          </div>
        </div>

        {/* Live Chat Panel */}
        {showChatPanel && (
          <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="border-b border-white/10 bg-slate-950/50 p-3.5 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="size-4 text-sky-400" /> Classroom Discussion
              </span>
              <span className="text-[10px] text-slate-400">{messages.length} messages</span>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className={`font-semibold ${m.senderRole === 'teacher' ? 'text-sky-400' : 'text-purple-300'}`}>
                      {m.senderName} {m.senderRole === 'teacher' && '(Professor)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2.5 text-slate-200 leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-950/80 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <button
                type="submit"
                className="rounded-xl bg-sky-500 px-3 py-2 text-slate-950 hover:bg-sky-400 transition-colors"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Floating Controls Bar */}
      <footer className="shrink-0 border-t border-white/10 bg-slate-900/90 px-6 py-3 backdrop-blur-xl flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-2xl border transition-all ${
              micEnabled
                ? 'bg-slate-800 border-white/15 text-white hover:bg-slate-700'
                : 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30'
            }`}
            title={micEnabled ? 'Mute' : 'Unmute'}
          >
            {micEnabled ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-3 rounded-2xl border transition-all ${
              cameraEnabled
                ? 'bg-slate-800 border-white/15 text-white hover:bg-slate-700'
                : 'bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30'
            }`}
            title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
        </div>

        {/* Center Actions: Raise Hand & Floating Reaction Emojis */}
        <div className="flex items-center gap-3">
          {/* Raise Hand Toggle CTA */}
          <button
            type="button"
            onClick={handleToggleHand}
            className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition-all ${
              isHandRaised
                ? 'bg-fuchsia-500 border-fuchsia-400 text-white shadow-lg animate-pulse'
                : 'bg-slate-800/80 border-white/15 text-slate-200 hover:border-fuchsia-400'
            }`}
          >
            <Hand className="size-4" />
            {isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}
          </button>

          {/* Floating Emoji Reactions Selector */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-slate-800/80 px-3 py-1.5">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReactionClick(emoji)}
                className="p-1 text-lg transition-transform hover:scale-125 active:scale-95"
                title={`Send ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Right Exit Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChatPanel((prev) => !prev)}
            className="p-3 rounded-2xl border border-white/15 bg-slate-800/80 text-slate-200 hover:border-sky-400 transition-all"
            title="Toggle Chat"
          >
            <MessageSquare className="size-5" />
          </button>

          <button
            type="button"
            onClick={leaveRoom}
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-red-400 hover:text-red-300 transition-all"
          >
            <LogOut className="size-4" /> Leave
          </button>
        </div>
      </footer>
    </div>
  )
}
