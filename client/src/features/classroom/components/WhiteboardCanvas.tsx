import React, { useEffect, useRef, useState } from 'react'
import { Eraser, Pencil, Trash2 } from 'lucide-react'
import { useClassroomStore } from '../classroom.store'

const COLORS = ['#38bdf8', '#a855f7', '#ec4899', '#22c55e', '#eab308', '#ffffff']

export function WhiteboardCanvas({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const currentPointsRef = useRef<Array<{ x: number; y: number }>>([])

  const [color, setColor] = useState('#38bdf8')
  const [lineWidth, setLineWidth] = useState(4)
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil')

  const { whiteboardStrokes, addWhiteboardStroke, clearWhiteboard } = useClassroomStore()

  // Redraw canvas whenever whiteboardStrokes changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear background
    ctx.fillStyle = '#090d16'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid lines for high-end look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw saved strokes
    whiteboardStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    })
  }, [whiteboardStrokes])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    isDrawingRef.current = true
    currentPointsRef.current = [{ x, y }]
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isReadOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const lastPoint = currentPointsRef.current[currentPointsRef.current.length - 1]

    ctx.beginPath()
    ctx.strokeStyle = tool === 'eraser' ? '#090d16' : color
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)
    ctx.stroke()

    currentPointsRef.current.push({ x, y })
  }

  const stopDrawing = () => {
    if (!isDrawingRef.current || isReadOnly) return
    isDrawingRef.current = false

    if (currentPointsRef.current.length > 1) {
      addWhiteboardStroke({
        type: 'path',
        points: currentPointsRef.current,
        color: tool === 'eraser' ? '#090d16' : color,
        width: tool === 'eraser' ? lineWidth * 4 : lineWidth,
      })
    }
    currentPointsRef.current = []
  }

  return (
    <div className="relative size-full overflow-hidden rounded-2xl border border-white/10 bg-[#090d16] shadow-2xl">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={`size-full ${isReadOnly ? 'cursor-default' : tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
      />

      {/* Toolbar for Teacher */}
      {!isReadOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/15 bg-slate-900/90 px-4 py-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1 border-r border-white/15 pr-3">
            <button
              type="button"
              onClick={() => setTool('pencil')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                tool === 'pencil' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
              title="Pencil Tool"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                tool === 'eraser' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-white'
              }`}
              title="Eraser Tool"
            >
              <Eraser className="size-4" />
            </button>
          </div>

          {/* Color Palette */}
          {tool === 'pencil' && (
            <div className="flex items-center gap-1.5 border-r border-white/15 pr-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`size-6 rounded-full border border-white/20 transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-sky-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {/* Stroke Thickness */}
          <div className="flex items-center gap-2 border-r border-white/15 pr-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Size</span>
            <input
              type="range"
              min="2"
              max="16"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-16 accent-sky-400 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={clearWhiteboard}
            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            title="Clear Board"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      {isReadOnly && (
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs text-sky-300 backdrop-blur-md">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Live Whiteboard Sync
        </div>
      )}
    </div>
  )
}
