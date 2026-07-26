import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react'
import { useClassroomStore } from '../classroom.store'

const DEMO_SLIDES = [
  {
    title: 'CS 401: Distributed Systems & Lab Overview',
    subtitle: 'Module 4 — Real-time State Replication',
    content: [
      '• Understanding Event-Driven Architectures and Consensus',
      '• WebSockets vs WebRTC for low-latency screen casting',
      '• Handling network partitions and offline grace periods',
    ],
    accent: 'from-sky-500/20 via-indigo-500/10 to-slate-900',
  },
  {
    title: 'Architecture Breakdown',
    subtitle: 'Client <-> Socket Gateway <-> Firestore Pipeline',
    content: [
      '1. Client triggers state mutation or stroke drawing',
      '2. Presence Gateway broadcasts JSON event payload',
      '3. Firestore persists state for late-joining students',
      '4. Sub-50ms sync latency achieved across campus network',
    ],
    accent: 'from-purple-500/20 via-indigo-500/10 to-slate-900',
  },
  {
    title: 'Lab Exercise: Raft Consensus Implementation',
    subtitle: 'Hands-on Coding Session',
    content: [
      '• Step 1: Clone lab repository from classroom links',
      '• Step 2: Implement Leader Election RPC in node.ts',
      '• Step 3: Run integration test suite using npm test',
      '• Raise hand anytime if you run into environment errors!',
    ],
    accent: 'from-emerald-500/20 via-sky-500/10 to-slate-900',
  },
]

export function SlideDeckViewer({ isTeacher }: { isTeacher: boolean }) {
  const { currentSlideIndex, setSlideIndex } = useClassroomStore()
  const currentSlide = DEMO_SLIDES[currentSlideIndex] || DEMO_SLIDES[0]

  const nextSlide = () => {
    if (currentSlideIndex < DEMO_SLIDES.length - 1) {
      setSlideIndex(currentSlideIndex + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setSlideIndex(currentSlideIndex - 1)
    }
  }

  return (
    <div className="relative size-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl flex flex-col justify-between p-8">
      {/* Background Ambient Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.accent} opacity-60 pointer-events-none transition-all duration-700`} />

      {/* Slide Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Presentation className="size-5" />
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">Presentation Deck</h4>
            <p className="text-sm font-display font-medium text-slate-200">{currentSlide.subtitle}</p>
          </div>
        </div>

        <span className="rounded-full border border-white/15 bg-slate-900/80 px-3.5 py-1 text-xs font-mono text-slate-300">
          Slide {currentSlideIndex + 1} / {DEMO_SLIDES.length}
        </span>
      </div>

      {/* Slide Main Content */}
      <div className="relative z-10 my-auto py-8 max-w-3xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl leading-tight">
          {currentSlide.title}
        </h2>
        <div className="mt-8 space-y-4">
          {currentSlide.content.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              <span className="mt-1 text-sky-400">▹</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {DEMO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!isTeacher}
              onClick={() => setSlideIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlideIndex === idx ? 'w-8 bg-sky-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {isTeacher ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={prevSlide}
              className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 disabled:opacity-40 hover:border-sky-400 transition-all"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>
            <button
              type="button"
              disabled={currentSlideIndex === DEMO_SLIDES.length - 1}
              onClick={nextSlide}
              className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-40 hover:bg-sky-400 transition-all shadow-lg"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Slides synced with Professor</span>
        )}
      </div>
    </div>
  )
}
