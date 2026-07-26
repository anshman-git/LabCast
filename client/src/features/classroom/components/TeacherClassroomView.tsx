import React, { useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Hand,
  Mic,
  MicOff,
  Monitor,
  Pencil,
  PhoneOff,
  Presentation,
  Radio,
  Send,
  Users,
  Video,
  VideoOff,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'
import { useRoomPresence } from '../../presence/useRoomPresence'
import { useClassroomStore } from '../classroom.store'
import { ScreenShareStream } from './ScreenShareStream'
import { SlideDeckViewer } from './SlideDeckViewer'
import { WhiteboardCanvas } from './WhiteboardCanvas'

export function TeacherClassroomView({ roomCode }: { roomCode: string }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const presence = useRoomPresence(roomCode, 'teacher')

  const {
    activeTab,
    setActiveTab,
    isScreenSharing,
    raisedHands,
    lowerHand,
    messages,
    sendMessage,
    reactions,
    micEnabled,
    cameraEnabled,
    toggleMic,
    toggleCamera,
    setRoomStatus,
  } = useClassroomStore()

  const [inputMessage, setInputMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Live Timer
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
      senderName: user?.displayName || 'Prof. Teacher',
      senderRole: 'teacher',
      text: inputMessage.trim(),
    })
    setInputMessage('')
  }

  const toggleRecording = () => {
    setIsRecording((prev) => !prev)
    if (!isRecording) {
      toast.info('Cloud Recording started', 'Session recording is saving to lab storage.')
    } else {
      toast.success('Recording saved', 'Classroom archive ready.')
    }
  }

  const endSession = () => {
    setRoomStatus('ended')
    toast.warning('Classroom Session Ended', 'All connected students have been notified.')
    navigate('/teacher/dashboard')
  }

  const liveStudents = presence.participants.filter((p) => p.role === 'student')

  return (
    <div className="relative flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Floating Reaction Emojis Overlay */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-20 animate-bounce text-4xl shadow-2xl transition-all duration-1000"
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
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              CS 401: Advanced Systems Programming
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">Computer Science Lab • Room {roomCode}</p>
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

          {/* Session Timer */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300">
            <span className="size-2 rounded-full bg-red-500 animate-ping" />
            {formatTimer(secondsElapsed)}
          </div>

          {/* Live Participants Count */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300">
            <Users className="size-3.5 text-sky-400" />
            {liveStudents.length + 1}
          </div>

          {/* End Session CTA */}
          <button
            type="button"
            onClick={endSession}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/30 px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/30 transition-all"
          >
            <PhoneOff className="size-3.5" /> End Session
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 min-h-0 flex gap-4 p-4 z-20">
        {/* Primary Viewport Area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* View Tab Switcher */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-1.5 backdrop-blur-md">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('screen')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'screen'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="size-3.5" /> Screen Share
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'presentation'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Presentation className="size-3.5" /> Presentation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('whiteboard')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === 'whiteboard'
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Pencil className="size-3.5" /> Whiteboard
              </button>
            </div>

            {raisedHands.length > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300 font-semibold animate-pulse">
                <Hand className="size-3.5" /> {raisedHands.length} Hand Raised
              </div>
            )}
          </div>

          {/* Tab Canvas Content */}
          <div className="flex-1 min-h-0 relative">
            {activeTab === 'screen' && <ScreenShareStream isTeacher={true} />}
            {activeTab === 'presentation' && <SlideDeckViewer isTeacher={true} />}
            {activeTab === 'whiteboard' && <WhiteboardCanvas isReadOnly={false} />}
          </div>
        </div>

        {/* Sidebar Panel: Chat & Students */}
        <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          {/* Sidebar Header Tabs */}
          <div className="flex border-b border-white/10 bg-slate-950/50 p-2 gap-1">
            <button
              type="button"
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 border border-sky-500/20 text-sky-300"
            >
              Class Chat ({messages.length})
            </button>
          </div>

          {/* Raised Hands Priority Alert Box */}
          {raisedHands.length > 0 && (
            <div className="p-3 border-b border-white/10 bg-fuchsia-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                  <Hand className="size-3.5" /> Raised Hands Queue
                </span>
              </div>
              <div className="space-y-1.5">
                {raisedHands.map((h) => (
                  <div
                    key={h.userId}
                    className="flex items-center justify-between rounded-lg border border-fuchsia-500/20 bg-slate-900/80 p-2 text-xs"
                  >
                    <span className="font-semibold text-slate-200">{h.userName}</span>
                    <button
                      type="button"
                      onClick={() => lowerHand(h.userId)}
                      className="rounded-md bg-sky-500/20 px-2 py-1 text-[10px] text-sky-300 hover:bg-sky-500/30"
                    >
                      Answer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
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

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-950/80 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send message to classroom..."
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
      </div>

      {/* Bottom Floating Control Bar */}
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
            title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
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
            title={cameraEnabled ? 'Turn off Camera' : 'Turn on Camera'}
          >
            {cameraEnabled ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </button>
        </div>

        {/* Center Control Group */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('screen')}
            className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-xs font-bold transition-all ${
              isScreenSharing
                ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-lg'
                : 'bg-slate-800/80 border-white/15 text-slate-200 hover:border-sky-400'
            }`}
          >
            <Monitor className="size-4" />
            {isScreenSharing ? 'Sharing Screen' : 'Share Screen'}
          </button>

          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
              isRecording
                ? 'bg-red-500 border-red-400 text-white animate-pulse'
                : 'bg-slate-800/80 border-white/15 text-slate-200 hover:border-red-400'
            }`}
          >
            <Radio className="size-4" />
            {isRecording ? 'Recording...' : 'Record Class'}
          </button>
        </div>

        {/* Right Exit Group */}
        <button
          type="button"
          onClick={endSession}
          className="flex items-center gap-2 rounded-2xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition-all shadow-lg"
        >
          <PhoneOff className="size-4" /> End Session
        </button>
      </footer>
    </div>
  )
}
