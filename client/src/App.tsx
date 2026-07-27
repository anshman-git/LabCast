import {
  ArrowRight,
  Cast,
  CheckCircle2,
  Hand,
  MessageCircle,
  MonitorUp,
  Shield,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import { useAuth } from './features/auth/auth.context'

export function App() {
  const { user } = useAuth()
  const teacherDashPath = user ? '/teacher/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <BrandMark />
          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to={teacherDashPath}
              className="h-10 px-3.5 rounded-[10px] border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all inline-flex items-center justify-center"
            >
              Teacher Login
            </Link>
            <Link
              to="/join"
              className="h-10 px-4 rounded-[10px] bg-zinc-100 text-xs font-medium text-zinc-950 hover:bg-white transition-all inline-flex items-center justify-center gap-1.5"
            >
              Join Classroom <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero Section */}
        <section className="py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs text-zinc-400 mb-6">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            Computer Lab Collaboration Platform
          </div>

          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            Broadcast teacher screens directly to student displays.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            LabCast gives computer lab classrooms a shared point of view. Teacher shares screen once—every student watches from their own computer with zero delay.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={teacherDashPath}
              className="h-10 px-5 rounded-[10px] bg-zinc-100 text-sm font-medium text-zinc-950 hover:bg-white transition-all inline-flex items-center justify-center gap-2"
            >
              Start Teaching <Cast size={15} />
            </Link>
            <Link
              to="/join"
              className="h-10 px-5 rounded-[10px] border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-all inline-flex items-center justify-center gap-2"
            >
              Join Classroom <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="py-12 border-t border-zinc-800/80">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/50 p-6">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400">Problem</span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">
                Back-row students cannot clearly see the projector.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                In computer labs, long distances, small code fonts, and low projector resolution cause students to lose track during practical sessions.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/50 p-6">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Solution</span>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">
                Direct 1-to-many high-definition screen broadcast.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                The teacher broadcasts their screen over local WebRTC/socket streams. Students open their web browser and follow along on their own desk screen.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 border-t border-zinc-800/80">
          <div className="mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400">Capabilities</span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
              Built for real classroom workflows.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-blue-400 mb-4">
                <MonitorUp size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Live Screen Sharing</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                High-definition screen capture stream directly to student displays with zero software installation.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-amber-400 mb-4">
                <Hand size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Raise Hand</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Students can signal for help discreetly without interrupting the ongoing lecture flow.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-purple-400 mb-4">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Student Screen Sharing</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Teachers can inspect or broadcast a student&apos;s solution to demonstrate progress.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-emerald-400 mb-4">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Attendance</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Automatic active session log of joined student participants upon entering the room code.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-rose-400 mb-4">
                <Shield size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Teacher Controls</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Host controls to manage stream broadcast, student permissions, and room sessions.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex size-9 items-center justify-center rounded-[8px] border border-zinc-800 bg-zinc-950 text-cyan-400 mb-4">
                <MessageCircle size={18} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Classroom Chat</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Instant text channel for code snippets, link sharing, and class discussions.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 border-t border-zinc-800/80">
          <div className="mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Workflow</span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
              How LabCast works in 4 steps.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <span className="font-mono text-xs text-zinc-500 font-medium">01</span>
              <h3 className="mt-2 text-sm font-semibold text-zinc-100">Teacher Creates Room</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Log into dashboard, create a session, and generate a 6-character room code.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <span className="font-mono text-xs text-zinc-500 font-medium">02</span>
              <h3 className="mt-2 text-sm font-semibold text-zinc-100">Students Join</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Students enter their name & room code. No registration or email needed.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <span className="font-mono text-xs text-zinc-500 font-medium">03</span>
              <h3 className="mt-2 text-sm font-semibold text-zinc-100">Start Screen Share</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Teacher clicks share screen to instantly stream IDE or slides to all devices.
              </p>
            </div>

            <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/40 p-5">
              <span className="font-mono text-xs text-zinc-500 font-medium">04</span>
              <h3 className="mt-2 text-sm font-semibold text-zinc-100">Collaborate & Ask</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Students follow along on their display, raise hands, or post in chat.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-zinc-800/80 mb-12">
          <div className="rounded-[10px] border border-zinc-800 bg-zinc-900 p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              Ready for your next lab session?
            </h2>
            <p className="mt-2 text-xs text-zinc-400 sm:text-sm">
              No software setup required. Works in any desktop web browser.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to={teacherDashPath}
                className="h-10 px-5 rounded-[10px] bg-zinc-100 text-sm font-medium text-zinc-950 hover:bg-white transition-all inline-flex items-center justify-center gap-2"
              >
                Start Teaching
              </Link>
              <Link
                to="/join"
                className="h-10 px-5 rounded-[10px] border border-zinc-800 bg-zinc-950 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-all inline-flex items-center justify-center gap-2"
              >
                Join Classroom
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandMark compact />
          <p>© {new Date().getFullYear()} LabCast. Built for modern computer labs.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
