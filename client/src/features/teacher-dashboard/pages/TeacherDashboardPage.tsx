import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Cast,
  Check,
  Clock,
  Copy,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Radio,
  Share2,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandMark } from '../../../components/BrandMark'
import { useAuth } from '../../auth/auth.context'
import { useToast } from '../../notifications/toast.context'
import { useRoomPresence } from '../../presence/useRoomPresence'
import { teacherDashboardService } from '../teacher-dashboard.service'
import { roomService } from '../../rooms/room.service'

export function TeacherDashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Room Creation state
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('')

  const dashboard = useQuery({
    queryKey: ['teacher-dashboard', user?.uid],
    queryFn: () => teacherDashboardService.getDashboard(user?.uid || ''),
    enabled: Boolean(user?.uid),
  })

  // Only use a real room from the backend — no fallback fake room
  const currentRoom = dashboard.data?.currentRoom || null

  const presence = useRoomPresence(currentRoom?.roomCode || '', 'teacher')
  const liveStudents = presence.participants.filter((p) => p.role === 'student')

  const copyRoomCode = async () => {
    if (!currentRoom) return
    await navigator.clipboard.writeText(currentRoom.roomCode)
    setCopiedCode(true)
    toast.success('Room Code Copied', currentRoom.roomCode)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const shareRoomLink = async () => {
    if (!currentRoom) return
    const link = `${window.location.origin}/join`
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    toast.success('Invite Link Copied', `Share ${link} with your students`)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleStartSession = () => {
    if (!currentRoom) return
    navigate(`/room/${currentRoom.roomCode}`)
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !user?.uid) return
    setIsCreating(true)
    try {
      const created = await roomService.createRoom(
        { title: newTitle.trim(), subject: newSubject.trim() || 'General' },
        user.uid
      )
      toast.success('Room Created', `Room ${created.roomCode} is ready for students.`)
      await queryClient.invalidateQueries({ queryKey: ['teacher-dashboard', user.uid] })
      setShowCreateModal(false)
      setNewTitle('')
      setNewSubject('')
      navigate(`/room/${created.roomCode}`)
    } catch (err) {
      toast.error('Create Failed', 'Could not create room. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const teacherName = user?.displayName || user?.email?.split('@')[0] || 'Teacher'

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Left Sidebar */}
      <aside className="w-56 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between p-3 select-none shrink-0">
        <div className="space-y-4">
          <div className="px-2 py-1">
            <BrandMark />
          </div>

          <nav className="space-y-1">
            <Link
              to="/teacher/dashboard"
              className="flex items-center gap-2.5 rounded-[8px] bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-100"
            >
              <LayoutDashboard size={15} className="text-blue-400" />
              Control Center
            </Link>
            <button
              type="button"
              onClick={handleStartSession}
              className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors text-left"
            >
              <Radio size={15} className="text-emerald-400" />
              Active Session
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors text-left"
            >
              <Plus size={15} className="text-purple-400" />
              Create Room
            </button>
          </nav>
        </div>

        {/* User Account */}
        <div className="border-t border-zinc-800/80 pt-3 space-y-1">
          <div className="px-3 py-1.5 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-[6px] bg-zinc-800 text-xs font-mono text-zinc-200">
              {teacherName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-200">{teacherName}</p>
              <p className="truncate text-[10px] text-zinc-500">Instructor Account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 rounded-[8px] px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-rose-400 transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main Control Center Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-13 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-200 font-medium">Dashboard</span>
            <span>/</span>
            <span className="font-mono text-zinc-400">Control Center</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="h-8 px-3 rounded-[8px] bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> New Room
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
                Classroom Control Center
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage live screen broadcasts and active student presence.
              </p>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid gap-5 md:grid-cols-3">
            {/* Widget 1: Current Active Room */}
            <div className="md:col-span-2 rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between">
              {currentRoom ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Room
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={shareRoomLink}
                          className="h-7 px-2 rounded-[6px] border border-zinc-800 bg-zinc-950 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                        >
                          {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                          Share Link
                        </button>

                        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-[6px]">
                          <span className="font-mono text-xs font-semibold text-zinc-100">
                            {currentRoom.roomCode}
                          </span>
                          <button
                            type="button"
                            onClick={copyRoomCode}
                            className="p-0.5 text-zinc-400 hover:text-zinc-100 transition-colors ml-1"
                            title="Copy Code"
                          >
                            {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-base font-semibold text-zinc-100">{currentRoom.title}</h2>
                    <p className="text-xs text-zinc-400 mt-1">{currentRoom.subject} • Ready for broadcast</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Users size={14} className="text-blue-400" />
                      <span>
                        <strong className="text-zinc-200">{liveStudents.length}</strong> students connected
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartSession}
                      className="h-9 px-4 rounded-[8px] bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Cast size={14} /> Launch Broadcast
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center gap-4">
                  <div className="rounded-full bg-zinc-800/80 p-3">
                    <Radio size={20} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">No active room</p>
                    <p className="text-xs text-zinc-500 mt-1">Create a room to start broadcasting to your students.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 px-4 rounded-[8px] bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Create Room
                  </button>
                </div>
              )}
            </div>

            {/* Widget 2: Quick Create Room */}
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <Plus size={15} className="text-purple-400" /> Quick Create Room
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Generate a code to start streaming immediately.</p>

                <form onSubmit={handleCreateRoom} className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Course Title (e.g. CS101)"
                    className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Subject (e.g. Computer Science)"
                    className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isCreating || !newTitle.trim()}
                    className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-800 text-zinc-100 text-xs font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? <><Loader2 size={12} className="animate-spin" /> Creating...</> : 'Create & Start'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Online Students & Recent Classrooms */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Widget 3: Live Connected Students */}
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <Users size={15} className="text-blue-400" /> Connected Students
                </h3>
                <span className="text-xs text-zinc-400">{liveStudents.length} in room</span>
              </div>

              {liveStudents.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {liveStudents.map((student) => (
                    <div
                      key={student.userId}
                      className="flex items-center justify-between rounded-[8px] border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-medium text-zinc-300">
                          {student.displayName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium text-zinc-200">{student.displayName}</span>
                      </div>
                      <span className="flex size-2 rounded-full bg-emerald-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  {currentRoom ? (
                    <>No students connected to room{' '}
                    <strong className="font-mono text-zinc-300">{currentRoom.roomCode}</strong> yet.
                    <p className="mt-1 text-zinc-600">Students join at /join with this code.</p></>
                  ) : (
                    <>No active room. Create a room first to see connected students.</>
                  )}
                </div>
              )}
            </div>

            {/* Widget 4: Recent Classrooms */}
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <Clock size={15} className="text-purple-400" /> Recent Classrooms
                </h3>
                <span className="text-xs text-zinc-400">History</span>
              </div>

              {dashboard.data?.recentRooms && dashboard.data.recentRooms.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.data.recentRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-[8px] border border-zinc-800/80 bg-zinc-950/60 px-3 py-2 text-xs"
                    >
                      <div>
                        <p className="font-medium text-zinc-200">{room.title}</p>
                        <span className="font-mono text-[10px] text-zinc-500">{room.roomCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/room/${room.roomCode}`)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No rooms created yet.
                  <p className="mt-1 text-zinc-600">Rooms you create will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[10px] border border-zinc-800 bg-zinc-900 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-semibold text-zinc-100">Create New Classroom Room</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Classroom Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Systems Programming"
                  className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full h-9 rounded-[8px] border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-8 px-3 rounded-[8px] border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="h-8 px-4 rounded-[8px] bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? <><Loader2 size={12} className="animate-spin" /> Creating...</> : 'Create & Launch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
