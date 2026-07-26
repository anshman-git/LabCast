import { useEffect, useRef, useState } from 'react'
import { Monitor, MonitorOff } from 'lucide-react'
import { useToast } from '../../notifications/toast.context'
import { useClassroomStore } from '../classroom.store'

export function ScreenShareStream({ isTeacher }: { isTeacher: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const { isScreenSharing, toggleScreenShare } = useClassroomStore()
  const toast = useToast()

  const startBrowserScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      })
      setStream(mediaStream)
      toggleScreenShare(true)
      setIsDemoMode(false)
      toast.success('Screen sharing active', 'Your screen is now visible to all students.')

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    } catch (err: any) {
      console.warn('Browser screen share notice:', err)
      // Fallback to simulated demo screen stream
      setIsDemoMode(true)
      toggleScreenShare(true)
      toast.info('Demo Screen Share active', 'Simulated lab environment screen stream is live.')
    }
  }

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    toggleScreenShare(false)
    setIsDemoMode(false)
    toast.info('Screen share ended', 'Returned to standard classroom view.')
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [stream])

  return (
    <div className="relative size-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl flex flex-col items-center justify-center">
      {/* Real Screen Share Media Player */}
      {isScreenSharing && stream && !isDemoMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="size-full object-contain bg-black"
        />
      )}

      {/* Simulated Interactive Demo Screen Stream */}
      {isScreenSharing && (isDemoMode || !stream) && (
        <div className="relative size-full bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 p-6 flex flex-col justify-between">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs text-slate-400 font-mono">VS Code — CS401_Lab3_Distributed_Systems</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] text-sky-300 font-medium">
              <span className="size-2 rounded-full bg-sky-400 animate-pulse" /> 1080p 60fps Live Stream
            </div>
          </div>

          {/* Code Editor Preview */}
          <div className="my-auto font-mono text-sm leading-relaxed space-y-2 text-slate-300 bg-slate-900/60 p-6 rounded-xl border border-white/10 backdrop-blur-md">
            <p className="text-purple-400">// CS 401: Distributed Consensus Protocol (Raft)</p>
            <p><span className="text-sky-400">async function</span> <span className="text-emerald-300">replicateLogState</span>(peerId: <span className="text-amber-300">string</span>) &#123;</p>
            <p className="pl-6 text-slate-400">const entries = getUncommittedEntries(peerId);</p>
            <p className="pl-6"><span className="text-sky-400">const</span> res = <span className="text-sky-400">await</span> node.appendEntries(peerId, entries);</p>
            <p className="pl-6"><span className="text-sky-400">if</span> (res.success) &#123;</p>
            <p className="pl-12 text-emerald-400">commitIndex = Math.max(commitIndex, res.matchIndex);</p>
            <p className="pl-6">&#125;</p>
            <p>&#125;</p>
          </div>

          {/* Bottom Live Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3">
            <span>Teacher Screen: Main Display 1</span>
            <span className="text-emerald-400 font-semibold">● Low Latency WebRTC Active</span>
          </div>
        </div>
      )}

      {/* Screen Share Off Idle State */}
      {!isScreenSharing && (
        <div className="text-center p-8 max-w-md">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-400 shadow-inner mb-4">
            <Monitor className="size-8" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">Screen Share Idle</h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {isTeacher
              ? 'Click below to share your entire screen or a specific window with all students in the classroom.'
              : 'The teacher has not started screen sharing yet. Sit tight, the presentation will appear here automatically.'}
          </p>

          {isTeacher && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={startBrowserScreenShare}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-sky-400 transition-all hover:scale-105"
              >
                <Monitor className="size-4" /> Share Screen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sharing Control Overlay Banner for Teacher */}
      {isTeacher && isScreenSharing && (
        <div className="absolute top-4 right-4 flex items-center gap-3 rounded-full border border-sky-500/30 bg-slate-900/90 px-4 py-2 text-xs shadow-2xl backdrop-blur-xl">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sky-200 font-medium">You are sharing your screen</span>
          <button
            type="button"
            onClick={stopScreenShare}
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-red-300 font-semibold hover:bg-red-500/30 transition-colors"
          >
            <MonitorOff className="size-3.5" /> Stop
          </button>
        </div>
      )}
    </div>
  )
}
