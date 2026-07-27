import {
  ArrowRight,
  Cast,
  CheckCircle2,
  Hand,
  Laptop,
  MessageSquare,
  Monitor,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import { useAuth } from './features/auth/auth.context'

export function App() {
  const { user } = useAuth()
  const teacherDashPath = user ? '/teacher/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandMark />
          <nav className="hidden items-center gap-6 text-xs font-medium text-zinc-400 md:flex">
            <a href="#overview" className="hover:text-zinc-100 transition-colors">Overview</a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-zinc-100 transition-colors">Workflow</a>
            <a href="#audience" className="hover:text-zinc-100 transition-colors">Who it's for</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to={teacherDashPath}
              className="h-8 px-3.5 rounded-[8px] border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all inline-flex items-center justify-center"
            >
              Teacher Login
            </Link>
            <Link
              to="/join"
              className="h-8 px-3.5 rounded-[8px] bg-zinc-100 text-xs font-medium text-zinc-950 hover:bg-white transition-all inline-flex items-center justify-center gap-1.5"
            >
              Join Room <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero Section */}
        <section className="py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 mb-6">
            <Sparkles size={13} />
            Real-time Computer Lab Screen Broadcasting
          </div>

          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl leading-tight">
            Mirror teacher displays directly onto student screens.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-400">
            LabCast eliminates projector glare and back-row visibility issues in computer labs.
            The instructor shares screen once—every student's screen syncs instantly with zero lag.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={teacherDashPath}
              className="h-10 px-5 rounded-[10px] bg-blue-600 text-sm font-medium text-white hover:bg-blue-500 transition-all inline-flex items-center justify-center gap-2 shadow-sm"
            >
              Start Broadcast <Cast size={15} />
            </Link>
            <Link
              to="/join"
              className="h-10 px-5 rounded-[10px] border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-all inline-flex items-center justify-center gap-2"
            >
              Join as Student <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* What LabCast Is */}
        <section id="overview" className="py-12 border-t border-zinc-800/80">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-medium">The Classroom Problem</span>
              <h2 className="mt-2 text-base font-semibold text-zinc-100">
                Back-row students crowd around monitors or struggle with low-res projectors.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                In 40 to 100 student computer labs, reading small IDE code lines or complex terminal output on a distant projector leads to confusion and lost focus.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-medium">The LabCast Solution</span>
              <h2 className="mt-2 text-base font-semibold text-zinc-100">
                Direct 1-to-Many WebRTC high-definition screen mirroring.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                LabCast streams the instructor's screen over ultra-low latency WebRTC. Students open a browser, enter the 6-character room code, and watch on their desk screen.
              </p>
            </div>
          </div>
        </section>

        {/* Simple Workflow */}
        <section id="workflow" className="py-16 border-t border-zinc-800/80">
          <div className="mb-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-medium">Simple 5-Step Workflow</span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100">
              How a LabCast session works in practice.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">01</span>
                <Cast size={15} className="text-zinc-500" />
              </div>
              <h3 className="mt-3 text-xs font-semibold text-zinc-100">Teacher Creates Room</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Log into dashboard and start a room session with a unique code.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">02</span>
                <Users size={15} className="text-zinc-500" />
              </div>
              <h3 className="mt-3 text-xs font-semibold text-zinc-100">Students Join</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Students enter name & room code. No registration required.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">03</span>
                <Monitor size={15} className="text-zinc-500" />
              </div>
              <h3 className="mt-3 text-xs font-semibold text-zinc-100">Teacher Shares Screen</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Instructor clicks Share Screen to stream IDE or slides.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">04</span>
                <Laptop size={15} className="text-zinc-500" />
              </div>
              <h3 className="mt-3 text-xs font-semibold text-zinc-100">Students Watch</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Students follow along crystal-clear on their local lab monitor.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-blue-400 font-bold">05</span>
                <Hand size={15} className="text-zinc-500" />
              </div>
              <h3 className="mt-3 text-xs font-semibold text-zinc-100">Ask Doubts & End</h3>
              <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                Students raise hands or chat. Teacher ends class when done.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 border-t border-zinc-800/80">
          <div className="mb-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-medium">Key Capabilities</span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100">
              Designed specifically for institutional computer labs.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-blue-400 mb-3.5">
                <Monitor size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">Real WebRTC Screen Stream</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                High-definition browser display capture streamed to all student devices without installing software.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-amber-400 mb-3.5">
                <Hand size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">Real-time Raise Hand</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Students signal for help with one click. Teachers get instant notifications with student names.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-cyan-400 mb-3.5">
                <MessageSquare size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">Live Classroom Chat</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Instant text channel for code snippets, link sharing, and class questions.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-emerald-400 mb-3.5">
                <Users size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">Real-time Presence</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Live list of connected students with instant join and leave detection.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-purple-400 mb-3.5">
                <CheckCircle2 size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">No Student Login Required</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Shared computer lab computers need frictionless access. Students enter Name and Room Code to join.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-8 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-rose-400 mb-3.5">
                <Shield size={17} />
              </div>
              <h3 className="text-xs font-semibold text-zinc-100">Teacher Control Center</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Full host authority to manage broadcast status, mute mic, dismiss hands, and end sessions cleanly.
              </p>
            </div>
          </div>
        </section>

        {/* Who It Is For */}
        <section id="audience" className="py-16 border-t border-zinc-800/80">
          <div className="mb-10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-medium">Target Audience</span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100">
              Built for university and college computer labs.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-xs font-semibold text-zinc-100">Computer Science Labs</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Ideal for programming, data structures, systems, and algorithms practical classes where students need to inspect code syntax line by line.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-xs font-semibold text-zinc-100">Design & Engineering Labs</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Demonstrate CAD modeling, software architecture, UI design, or data analytics software live across 40–100 student monitors simultaneously.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="text-xs font-semibold text-zinc-100">IT Workshops & Bootcamps</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Conduct technical training with zero setup time. Students join instantly using a simple web link or room code.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 border-t border-zinc-800/80 mb-12">
          <div className="rounded-[10px] border border-zinc-800 bg-zinc-900 p-8 text-center sm:p-12">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              Ready for your next lab broadcast session?
            </h2>
            <p className="mt-1.5 text-xs text-zinc-400">
              No installation or complex network configuration required. Works in modern web browsers.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to={teacherDashPath}
                className="h-9 px-4 rounded-[8px] bg-blue-600 text-xs font-medium text-white hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
              >
                Teacher Dashboard
              </Link>
              <Link
                to="/join"
                className="h-9 px-4 rounded-[8px] border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
              >
                Student Join
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandMark compact />
          <p>© {new Date().getFullYear()} LabCast. Classroom broadcasting for computer labs.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
