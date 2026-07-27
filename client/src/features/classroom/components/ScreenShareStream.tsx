import { useEffect, useRef } from 'react'
import { Monitor, MonitorOff, Radio } from 'lucide-react'

interface ScreenShareStreamProps {
  isTeacher: boolean
  activeStream: MediaStream | null
  isSharing: boolean
  onStartShare?: () => void
  onStopShare?: () => void
}

export function ScreenShareStream({
  isTeacher,
  activeStream,
  isSharing,
  onStartShare,
  onStopShare,
}: ScreenShareStreamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current && activeStream) {
      videoRef.current.srcObject = activeStream
    }
  }, [activeStream])

  return (
    <div className="relative size-full overflow-hidden rounded-[10px] border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center">
      {/* Active WebRTC Video Stream */}
      {isSharing && activeStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isTeacher}
          className="size-full object-contain bg-black"
        />
      ) : isSharing ? (
        /* Stream connecting / active indicator */
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-[10px] border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Connecting Screen Stream</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {isTeacher
                ? 'Preparing browser screen capture...'
                : 'Receiving live WebRTC video stream from teacher...'}
            </p>
          </div>
        </div>
      ) : (
        /* Elegant Idle Screen Share Placeholder (No giant blue box or fake code) */
        <div className="flex flex-col items-center p-8 max-w-sm text-center">
          <div className="flex size-12 items-center justify-center rounded-[10px] border border-zinc-800 bg-zinc-900 text-zinc-400 mb-4">
            <Monitor size={22} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">
            {isTeacher ? 'Ready to Share Screen' : 'Teacher is Not Sharing'}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            {isTeacher
              ? 'Click below to choose a monitor, window, or browser tab to broadcast to all students.'
              : 'The teacher has not started screen sharing yet. Sit tight, the broadcast will appear here automatically.'}
          </p>

          {isTeacher && onStartShare && (
            <button
              type="button"
              onClick={onStartShare}
              className="mt-5 h-9 px-4 rounded-[8px] bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Monitor size={14} /> Start Screen Share
            </button>
          )}
        </div>
      )}

      {/* Floating Control Badge for Teacher when sharing */}
      {isTeacher && isSharing && onStopShare && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-[8px] border border-zinc-800 bg-zinc-950/90 px-3 py-1.5 text-xs backdrop-blur-md">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-medium">Broadcasting Live</span>
          <button
            type="button"
            onClick={onStopShare}
            className="ml-1 px-2 py-0.5 rounded-[6px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium text-[11px] hover:bg-rose-500/20 transition-colors inline-flex items-center gap-1"
          >
            <MonitorOff size={12} /> Stop
          </button>
        </div>
      )}
    </div>
  )
}
