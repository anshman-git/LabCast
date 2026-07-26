import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  Check,
  Copy,
  LoaderCircle,
  Play,
  Plus,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'
import { useRoomPresence } from '../../presence/useRoomPresence'
import { teacherDashboardService } from '../teacher-dashboard.service'

export function TeacherDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const dashboard = useQuery({
    queryKey: ['teacher-dashboard', user?.uid],
    queryFn: () => teacherDashboardService.getDashboard(user!.uid),
  })

  const roomCode = dashboard.data?.currentRoom.roomCode || 'LAB401'
  const presence = useRoomPresence(roomCode, 'teacher')

  if (dashboard.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">
        <LoaderCircle className="animate-spin text-sky-400 size-8" />
        <span className="sr-only">Loading Teacher Dashboard</span>
      </main>
    )
  }

  const { currentRoom, todaySessions } = dashboard.data || {
    currentRoom: { id: 'r1', roomCode: 'LAB401', title: 'CS 401: Advanced Systems Programming', subject: 'Computer Science', startsAt: '10:00 AM' },
    recentRooms: [],
    todaySessions: [],
  }

  const liveStudents = presence.participants.filter((p) => p.role === 'student')

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(currentRoom.roomCode)
    setCopied(true)
    toast.success('Room Code Copied!', currentRoom.roomCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const startClass = () => {
    toast.success('Launching Live Classroom', `Opening room ${currentRoom.roomCode}`)
    navigate(`/room/${currentRoom.roomCode}`)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    toast.success('Invitation Sent', `Sent room code ${currentRoom.roomCode} to ${inviteEmail}`)
    setInviteEmail('')
    setShowInviteModal(false)
  }

  const teacherName = user?.displayName || user?.email?.split('@')[0] || 'Professor'
  const teacherInitials = teacherName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <BrandMark />
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{teacherName}</p>
              <p className="text-xs text-sky-400">Senior Faculty • Computer Science</p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-sky-500/20 border border-sky-500/30 text-sm font-bold text-sky-300">
              {teacherInitials}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 space-y-8">
        {/* Header Kicker & Create Room CTA */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-400">Faculty Dashboard</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Good morning, {teacherName.split(' ')[0]}.
            </h1>
            <p className="mt-2 text-sm text-slate-400">Here is your live classroom status and student activity.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300 hover:bg-sky-500/20 transition-all"
            >
              <UserPlus className="size-4" /> Invite Students
            </button>
            <Link
              to="/rooms/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-400 transition-all shadow-lg hover:scale-105"
            >
              <Plus className="size-4" /> Create Room
            </Link>
          </div>
        </div>

        {/* Analytics Quick Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Students</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-white">48</span>
              <span className="text-xs font-semibold text-emerald-400">Enrolled</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Live Active Students</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-sky-400">{liveStudents.length}</span>
              <span className="text-xs font-semibold text-sky-300">Connected Now</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Avg Attendance</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-3xl font-bold text-white">96%</span>
              <span className="text-xs font-semibold text-emerald-400">High</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Active Room Code</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-sky-300">{currentRoom.roomCode}</span>
              <button
                type="button"
                onClick={copyRoomCode}
                className="text-xs text-sky-400 hover:text-white font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Live Room Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 animate-pulse">
                  READY TO START
                </span>
                <span className="text-xs text-slate-400">Room Code: <strong className="font-mono text-sky-300">{currentRoom.roomCode}</strong></span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{currentRoom.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{currentRoom.subject} • Scheduled for {currentRoom.startsAt}</p>
              <p className="mt-4 text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Users className="size-4 text-sky-400" /> {liveStudents.length} students currently in waiting lobby
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copyRoomCode}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-200 hover:border-sky-400 transition-all"
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                {copied ? 'Code Copied' : 'Copy Code'}
              </button>

              <button
                type="button"
                onClick={startClass}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-sky-400 transition-all shadow-lg hover:scale-105"
              >
                <Play className="size-4" fill="currentColor" /> Start Live Class
              </button>
            </div>
          </div>
        </div>

        {/* Sessions & Live Participants Split */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Sessions */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="size-5 text-sky-400" /> Today's Classes
              </h3>
              <span className="text-xs text-slate-400">{todaySessions.length} sessions</span>
            </div>

            <div className="mt-4 space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{session.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {session.subject} • {session.time}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      session.status === 'completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-sky-500/15 border border-sky-500/30 text-sky-300'
                    }`}
                  >
                    {session.status === 'completed' ? 'Completed' : `${session.joinedStudents} registered`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Participants List */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Users className="size-5 text-sky-400" /> Live Lobby Participants
              </h3>
              <span className="text-xs text-slate-400">{liveStudents.length} connected</span>
            </div>

            <div className="mt-4 space-y-3">
              {liveStudents.length > 0 ? (
                liveStudents.map((student) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">
                        {student.displayName.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white">{student.displayName}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Joined & Checked In</p>
                      </div>
                    </div>
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No students are connected to room {currentRoom.roomCode} right now.
                  <p className="mt-1 text-slate-500">Share your room code to invite students!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Students Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="size-5 text-sky-400" /> Invite Students
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Send an email invitation containing room code <strong className="text-sky-300 font-mono">{currentRoom.roomCode}</strong> directly to your student.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-all shadow-md"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
