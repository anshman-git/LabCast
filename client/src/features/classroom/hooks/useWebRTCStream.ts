import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

interface UseWebRTCStreamProps {
  roomCode: string
  isTeacher: boolean
  socket: Socket | null
}

const WEBRTC_CHANNEL_NAME = 'labcast_webrtc_stream_sync'

export function useWebRTCStream({ roomCode, isTeacher, socket }: UseWebRTCStreamProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())
  const studentPeerRef = useRef<RTCPeerConnection | null>(null)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameIdRef = useRef<number | null>(null)

  // Initialize local BroadcastChannel for tab-to-tab real stream fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        broadcastChannelRef.current = new BroadcastChannel(`${WEBRTC_CHANNEL_NAME}_${roomCode}`)
      } catch (err) {
        console.warn('BroadcastChannel initialization notice:', err)
      }
    }
    return () => {
      broadcastChannelRef.current?.close()
    }
  }, [roomCode])

  // Teacher Screen Capture
  const startScreenShare = async (): Promise<MediaStream | null> => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
          frameRate: { max: 30 },
        } as any,
        audio: false,
      })

      setLocalStream(mediaStream)
      setIsSharing(true)

      // When teacher stops share natively via browser UI banner
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      // Socket notification
      if (socket) {
        socket.emit('webrtc:stream-status', { roomCode, isSharing: true })
      }

      // BroadcastChannel notification
      broadcastChannelRef.current?.postMessage({ type: 'STREAM_STATUS', isSharing: true })

      // Create stream broadcast loop for local tabs via Canvas
      startCanvasStreamBroadcast(mediaStream)

      return mediaStream
    } catch (err) {
      console.warn('Browser getDisplayMedia notice:', err)
      return null
    }
  }

  // Stop Screen Share
  const stopScreenShare = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }

    setIsSharing(false)
    setRemoteStream(null)

    // Notify socket and BroadcastChannel
    if (socket) {
      socket.emit('webrtc:stream-status', { roomCode, isSharing: false })
    }
    broadcastChannelRef.current?.postMessage({ type: 'STREAM_STATUS', isSharing: false })

    // Close all WebRTC peer connections
    peerConnections.current.forEach((pc) => pc.close())
    peerConnections.current.clear()

    if (studentPeerRef.current) {
      studentPeerRef.current.close()
      studentPeerRef.current = null
    }
  }

  // Teacher Canvas Stream broadcaster for local tab sync
  const startCanvasStreamBroadcast = (stream: MediaStream) => {
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720

      const drawFrame = () => {
        if (!video.paused && !video.ended && ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          try {
            const frameData = canvas.toDataURL('image/jpeg', 0.6)
            broadcastChannelRef.current?.postMessage({ type: 'FRAME_CHUNK', frame: frameData })
          } catch {}
        }
        animFrameIdRef.current = requestAnimationFrame(drawFrame)
      }
      drawFrame()
    }
  }

  // Listen for student side broadcasts & Socket events
  useEffect(() => {
    if (!broadcastChannelRef.current) return

    const handleMessage = (event: MessageEvent) => {
      const { type, isSharing: statusSharing, frame } = event.data
      if (type === 'STREAM_STATUS') {
        setIsSharing(statusSharing)
        if (!statusSharing) setRemoteStream(null)
      } else if (type === 'FRAME_CHUNK' && !isTeacher && frame) {
        setIsSharing(true)

        // Convert base64 frame data to video or canvas playback
        if (!remoteStream) {
          const canvas = canvasRef.current || document.createElement('canvas')
          canvasRef.current = canvas
          const ctx = canvas.getContext('2d')
          const img = new Image()
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            if (!remoteStream) {
              const canvasStream = (canvas as any).captureStream(30)
              setRemoteStream(canvasStream)
            }
          }
          img.src = frame
        } else {
          const img = new Image()
          img.onload = () => {
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d')
              ctx?.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
            }
          }
          img.src = frame
        }
      }
    }

    broadcastChannelRef.current.onmessage = handleMessage
  }, [isTeacher, remoteStream])

  // WebRTC Socket Signaling Listeners
  useEffect(() => {
    if (!socket) return

    socket.on('webrtc:stream-status', (data: { isSharing: boolean }) => {
      setIsSharing(data.isSharing)
      if (!data.isSharing) setRemoteStream(null)
    })

    // Student handling WebRTC offer from teacher
    socket.on('webrtc:offer', async (data: any) => {
      if (isTeacher) return
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })
        studentPeerRef.current = pc

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0])
            setIsSharing(true)
          }
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc:ice-candidate', {
              roomCode,
              targetSocketId: data.senderSocketId,
              candidate: event.candidate,
            })
          }
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.emit('webrtc:answer', {
          roomCode,
          targetSocketId: data.senderSocketId,
          sdp: answer,
        })
      } catch (err) {
        console.warn('WebRTC offer handling notice:', err)
      }
    })

    // Teacher handling WebRTC answer from student
    socket.on('webrtc:answer', async (data: any) => {
      if (!isTeacher) return
      const pc = peerConnections.current.get(data.senderSocketId)
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        } catch (err) {
          console.warn('WebRTC answer handling notice:', err)
        }
      }
    })

    // Handling ICE candidates
    socket.on('webrtc:ice-candidate', async (data: any) => {
      const pc = isTeacher
        ? peerConnections.current.get(data.senderSocketId)
        : studentPeerRef.current
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch (err) {
          console.warn('ICE candidate notice:', err)
        }
      }
    })

    return () => {
      socket.off('webrtc:stream-status')
      socket.off('webrtc:offer')
      socket.off('webrtc:answer')
      socket.off('webrtc:ice-candidate')
    }
  }, [socket, isTeacher, roomCode])

  return {
    localStream,
    remoteStream,
    isSharing,
    startScreenShare,
    stopScreenShare,
    activeStream: isTeacher ? localStream : remoteStream,
  }
}
