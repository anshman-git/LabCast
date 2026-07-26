import React, { useState } from 'react'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'

const TODAY_STUDENT_SESSIONS = [
  { id: '1', title: 'CS 401: Advanced Systems Programming', time: '10:00 AM - 11:30 AM', roomCode: 'LAB401', instructor: 'Prof. Anderson', status: 'live' },
  { id: '2', title: 'CS 302: Data Structures & Algorithms', time: '02:00 PM - 03:30 PM', roomCode: 'DSA302', instructor: 'Dr. Emily Vance', status: 'upcoming' },
  { id: '3', title: 'CS 210: Discrete Mathematics', time: '04:00 PM - 05:15 PM', roomCode: 'MATH21', instructor: 'Prof. Marcus Chen', status: 'upcoming' },
]

const RECENT_NOTIFICATIONS = [
  { id: 'n1', title: 'Lab Assignment #4 Published', time: '10 mins ago', desc: 'Prof. Anderson uploaded lab-notes.pdf to room LAB401.' },
  { id: 'n2', title: 'Attendance Confirmed', time: 'Yesterday', desc: 'Your check-in for CS 302 was recorded automatically.' },
  { id: 'n3', title: 'New Room Invited', time: '2 days ago', desc: 'Dr. Emily Vance invited you to Join room DSA302.' },
]

export function StudentDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const code = roomCodeInput.trim().toUpperCase()
    if (!code || code.length < 4) {
      toast.warning('Invalid Room Code', 'Please enter a valid 6-character room code.')
      return
    }
    setIsJoining(true)
    toast.success('Joining Classroom...', `Connecting to room ${code}`)
    setTimeout(() => {
      navigate(`/room/${code}`)
    }, 600)
  }

  const joinDirectly = (code: string) => {
    toast.success('Entering Live Class', `Connecting to ${code}...`)
    navigate(`/room/${code}`)
  }

  const studentName = user?.displayName || user?.email?.split('@')[0] || 'Alex Student'
  const studentInitials = studentName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navbar Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <BrandMark />
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{studentName}</p>
              <p className="text-xs text-sky-400">Computer Science • B.S. Senior</p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-sky-500/20 border border-sky-500/30 text-sm font-bold text-sky-300">
              {studentInitials}
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 space-y-8">
        {/* Welcome Kicker */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Student Portal</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {studentName.split(' ')[0]}.
            </h1>
            <p className="mt-2 text-sm text-slate-400">Here is your live classroom schedule and attendance summary.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md">
            <Calendar className="size-4 text-sky-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Top Hero Section: Quick Join & Active Class Prompt */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Quick Join Card */}
          <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Sparkles className="size-4" /> Real-time Classroom Access
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-white">Join a Live LabCast</h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-md">
              Enter your professor's 6-character room code to instantly connect to live screen shares, presentations, and whiteboards.
            </p>

            <form onSubmit={handleQuickJoin} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. LAB401)"
                className="flex-1 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-4 py-3.5 font-mono text-base font-bold tracking-widest text-sky-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="submit"
                disabled={isJoining}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-sky-400 transition-all shadow-lg hover:scale-105"
              >
                Join Room <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          {/* Attendance Stats Gauge Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attendance Gauge</span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                Good Standing
              </span>
            </div>

            <div className="my-4 flex items-center gap-6">
              <div className="relative grid size-24 place-items-center rounded-full border-4 border-sky-500/30 bg-sky-500/10 text-center">
                <div>
                  <span className="font-display text-2xl font-bold text-white">94%</span>
                  <span className="block text-[9px] uppercase font-semibold text-slate-400">Rate</span>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">16 of 17 Labs Attended</p>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Automatic check-in is enabled. Joining a live room logs your participation instantly.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>Semester Goal: 90%+</span>
              <span className="text-emerald-400 font-semibold">● On Track</span>
            </div>
          </div>
        </div>

        {/* Schedule & Notifications Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Classes */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="size-5 text-sky-400" /> Today's Sessions
              </h3>
              <span className="text-xs text-slate-400">{TODAY_STUDENT_SESSIONS.length} classes</span>
            </div>

            <div className="mt-4 space-y-3">
              {TODAY_STUDENT_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition-all hover:border-sky-500/30"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{session.title}</span>
                      {session.status === 'live' && (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {session.instructor} • {session.time}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => joinDirectly(session.roomCode)}
                    className="inline-flex items-center gap-1 rounded-xl bg-sky-500/15 border border-sky-500/30 px-3.5 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/25 transition-all"
                  >
                    Enter <ChevronRight className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications & Recent Activity */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Bell className="size-5 text-sky-400" /> Notifications & Activity
              </h3>
              <span className="text-xs text-slate-400">Updated live</span>
            </div>

            <div className="mt-4 space-y-3">
              {RECENT_NOTIFICATIONS.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
