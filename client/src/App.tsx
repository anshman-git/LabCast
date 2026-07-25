import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileUp,
  Hand,
  MessageCircle,
  MonitorUp,
  Play,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from './components/BrandMark'
import { FeatureCard } from './components/FeatureCard'
import { PersonaPanel } from './components/PersonaPanel'
import { ProductPreview } from './components/ProductPreview'
import { TimelineStep } from './components/TimelineStep'
import { useAuth } from './features/auth/auth.context'
import './App.css'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For teachers', href: '#benefits' },
]

const timelineSteps = [
  { number: '01', title: 'Teacher creates a room', description: 'Open a focused session in seconds. Add the class name, set the pace, and bring everyone into the same digital space.', accent: 'cyan' as const },
  { number: '02', title: 'Students join', description: 'One short code takes students straight to the room—no downloads, no account maze, no lost minutes.', accent: 'white' as const },
  { number: '03', title: 'Teacher shares the screen', description: 'Make every cursor movement visible with crisp, low-latency screen sharing built for computer labs.', accent: 'purple' as const },
  { number: '04', title: 'Students collaborate', description: 'Questions, hand raises, screens, notes, and files stay connected while the lesson moves forward.', accent: 'white' as const },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const closeMenu = () => setMenuOpen(false)
  const getStartedPath = user ? '/role-selection' : '/register'
  const joinClassroomPath = user ? '/rooms/join' : '/login'

  return (
    <div className="page-shell">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-sky-aqua focus:px-4 focus:py-3 focus:font-semibold focus:text-ink" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <BrandMark />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {navItems.map((item) => <a key={item.href} className="text-sm text-mist transition-colors hover:text-cloud" href={item.href}>{item.label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link className="px-3 py-2 text-sm font-medium text-mist transition-colors hover:text-cloud" to="/login">Sign in</Link>
            <Link className="secondary-cta rounded-full px-4 py-2.5 text-sm font-semibold" to={getStartedPath}>Get started <ArrowRight className="ml-1 inline-block" size={15} /></Link>
          </div>
          <button className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist md:hidden" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <ChevronDown className="rotate-180" size={18} /> : <span className="flex flex-col gap-1"><span className="h-px w-4 bg-current" /><span className="h-px w-4 bg-current" /></span>}
          </button>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="border-t border-white/10 px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navItems.map((item) => <a key={item.href} className="rounded-xl px-3 py-3 text-sm text-mist hover:bg-white/[0.05] hover:text-cloud" href={item.href} onClick={closeMenu}>{item.label}</a>)}
            <Link className="mt-2 rounded-xl bg-sky-aqua px-3 py-3 text-center text-sm font-semibold text-ink" to={getStartedPath} onClick={closeMenu}>Get started</Link>
          </div>
        </nav>}
      </header>

      <main id="main-content" className="relative z-10">
        <section id="home" className="mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24 lg:px-10 lg:pb-40 lg:pt-32">
          <div className="hero-orbit" aria-hidden="true" />
          <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div className="hero-copy">
              <span className="section-kicker">Live labs, in sync</span>
              <h1 className="hero-title mt-7">Make every <em>screen</em> part of the lesson.</h1>
              <p className="hero-description mt-7">LabCast gives college classrooms a shared point of view—so teachers can guide the room and students can stay in the flow.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="primary-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold" to={getStartedPath}>Start Teaching <ArrowUpRight size={17} /></Link>
                <Link className="secondary-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" to={joinClassroomPath}>Join Classroom <ArrowRight size={17} /></Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-mist/70">
                <span className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-emerald-300/15 text-emerald-200"><Check size={12} /></span> No downloads</span>
                <span className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-full bg-sky-aqua/15 text-sky-aqua"><Check size={12} /></span> Built for campus labs</span>
              </div>
            </div>
            <div className="relative lg:pt-4">
              <div className="absolute -left-5 top-10 hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist backdrop-blur-sm sm:flex sm:items-center sm:gap-2"><span className="size-1.5 rounded-full bg-sky-aqua" /> 1 room / 24 perspectives</div>
              <ProductPreview />
              <div className="absolute -bottom-6 right-5 hidden max-w-[12rem] rounded-2xl border border-white/10 bg-ink/80 p-3 shadow-xl backdrop-blur-xl sm:block"><div className="flex items-center gap-2 text-xs text-cloud"><Sparkles size={13} className="text-fuchsia-300" /> Keep everyone close</div><p className="mt-1 text-[11px] leading-4 text-mist">Clarity for the front row, back row, and every screen between.</p></div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <span className="section-kicker">One room, many signals</span>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium tracking-[-0.06em] text-cloud sm:text-5xl">The tools that make a lab feel <span className="text-sky-aqua">together.</span></h2>
            </div>
            <p className="max-w-sm text-base leading-7 text-mist">Designed for the moments that usually get lost between a teacher&apos;s screen and a student&apos;s question.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard className="min-h-[30rem] lg:col-span-2 lg:row-span-2 lg:min-h-[38rem]" title="Live Screen Sharing" description="Share the exact view you want the room to follow, with enough context left for questions and discussion." tone="cyan" icon={<MonitorUp size={19} />}>
              <div className="mt-7 rounded-xl border border-white/10 bg-ink/60 p-2.5">
                <div className="flex items-center justify-between border-b border-white/10 px-2 pb-2 text-[10px] text-mist"><span>room / lesson-04</span><span className="text-emerald-200">● sharing now</span></div>
                <div className="mt-2 grid grid-cols-[1fr_0.38fr] gap-2">
                  <div className="h-24 rounded-lg bg-gradient-to-br from-sky-aqua/25 via-indigo-ink/45 to-ink sm:h-32"><div className="p-3 font-display text-xs text-white/80">Designing with constraints</div><div className="mx-3 mt-5 h-1.5 w-2/3 rounded-full bg-white/30" /><div className="mx-3 mt-2 h-1.5 w-1/2 rounded-full bg-sky-aqua/55" /></div>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="h-8 rounded-md bg-white/10" /><div className="h-8 rounded-md bg-fuchsia-300/20" /><div className="h-8 rounded-md bg-white/10" /></div>
                </div>
              </div>
            </FeatureCard>
            <FeatureCard title="Raise Hand" description="Let questions surface without breaking the rhythm." tone="purple" icon={<Hand size={19} />}>
              <div className="mt-7 flex items-center justify-between rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-3"><span className="text-xs text-mist">3 students are waiting</span><span className="grid size-8 place-items-center rounded-full bg-fuchsia-300/15 text-lg">✋</span></div>
            </FeatureCard>
            <FeatureCard title="Student Screen Sharing" description="See the work, not just the final answer." tone="violet" icon={<Users size={19} />}>
              <div className="mt-7 flex -space-x-2"><span className="grid size-8 place-items-center rounded-full border-2 border-charcoal-blue bg-cyan-300 text-[10px] font-bold text-ink">AM</span><span className="grid size-8 place-items-center rounded-full border-2 border-charcoal-blue bg-violet-300 text-[10px] font-bold text-ink">JR</span><span className="grid size-8 place-items-center rounded-full border-2 border-charcoal-blue bg-pink-300 text-[10px] font-bold text-ink">SK</span><span className="grid size-8 place-items-center rounded-full border-2 border-charcoal-blue bg-white/10 text-[10px] font-bold text-cloud">+8</span></div>
            </FeatureCard>
            <FeatureCard title="Attendance" description="Know who is present before the first slide lands." tone="green" icon={<ClipboardCheck size={19} />}>
              <div className="mt-7 flex items-end justify-between"><div><p className="font-display text-3xl text-cloud">96<span className="text-lg text-emerald-200">%</span></p><p className="mt-1 text-xs text-mist">checked in</p></div><BarChart3 size={60} className="text-emerald-200/70" strokeWidth={1.2} /></div>
            </FeatureCard>
            <FeatureCard title="Live Chat" description="Keep side questions visible, searchable, and kind." tone="blue" icon={<MessageCircle size={19} />}>
              <div className="mt-7 space-y-2 text-[11px]"><div className="ml-auto w-4/5 rounded-lg rounded-br-sm bg-sky-aqua/15 px-3 py-2 text-sky-100">Can you revisit that example?</div><div className="w-3/4 rounded-lg rounded-bl-sm bg-white/[0.07] px-3 py-2 text-mist">Absolutely — let&apos;s zoom in.</div></div>
            </FeatureCard>
            <FeatureCard title="File Sharing" description="Put notes, datasets, and next steps in one reliable place." tone="cyan" icon={<FileUp size={19} />}>
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"><span className="grid size-8 place-items-center rounded-lg bg-sky-aqua/10 text-sky-aqua">↗</span><span className="min-w-0"><span className="block truncate text-xs text-cloud">lab-notes.pdf</span><span className="text-[10px] text-mist">Shared just now</span></span></div>
            </FeatureCard>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-y border-white/[0.07] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
            <div>
              <span className="section-kicker">From first click to flow</span>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-medium tracking-[-0.06em] text-cloud sm:text-5xl">A simpler way to move through the room.</h2>
              <p className="mt-6 max-w-md text-base leading-7 text-mist">LabCast keeps the setup quiet so the teaching can be visible. Four moves, one shared point of view.</p>
              <a className="mt-8 inline-flex items-center gap-2 font-display text-sm font-semibold text-sky-aqua transition-colors hover:text-white" href="#cta">See it in action <ArrowRight size={16} /></a>
            </div>
            <div className="relative pl-1 sm:pl-3"><div className="timeline-line" aria-hidden="true" />{timelineSteps.map((step) => <TimelineStep key={step.number} {...step} />)}</div>
          </div>
        </section>

        <section id="benefits" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
          <div className="max-w-2xl"><span className="section-kicker">Built around the people</span><h2 className="mt-5 font-display text-4xl font-medium tracking-[-0.06em] text-cloud sm:text-5xl">More room for the work that matters.</h2></div>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <PersonaPanel tone="teachers" label="For teachers" title="Lead the lab without losing the room." description="See where attention is, make questions easy to ask, and give every student a clear next step." image="https://images.pexels.com/photos/5530441/pexels-photo-5530441.jpeg?auto=compress&cs=tinysrgb&w=1200" imageAlt="Students working at desktop computers in a bright computer lab, photographed by Thành Đỗ on Pexels." benefits={['Stay in control of the pace', 'Spot blockers earlier', 'Keep resources attached']} />
            <PersonaPanel tone="students" label="For students" title="Stay close to the lesson, wherever you sit." description="Follow the same screen, speak up without interrupting, and share progress before the deadline." image="https://images.pexels.com/photos/6636118/pexels-photo-6636118.jpeg?auto=compress&cs=tinysrgb&w=1200" imageAlt="A college student focused on a laptop in a quiet study space, photographed by cottonbro studio on Pexels." benefits={['Ask without the spotlight', 'See every important detail', 'Share work in context']} />
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-aqua/30 bg-gradient-to-br from-sky-aqua via-[#3bb9ed] to-indigo-ink p-7 shadow-aqua sm:p-12 lg:p-16">
            <div className="absolute -right-16 -top-20 size-72 rounded-full border border-white/25 opacity-70" aria-hidden="true" /><div className="absolute -bottom-28 right-24 size-64 rounded-full border border-white/15 opacity-60" aria-hidden="true" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Your next lab starts here</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-[-0.065em] text-ink sm:text-6xl">Make space for every voice in the room.</h2><p className="mt-5 max-w-xl text-base leading-7 text-ink/70">Bring the whole class into focus with one calm, connected workspace.</p></div><Link className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-cloud transition-transform hover:-translate-y-1" to={getStartedPath}>Start a LabCast <Play size={15} fill="currentColor" /></Link></div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-5 pb-6 sm:px-8 lg:px-10">
        <div className="floating-footer mx-auto flex max-w-7xl flex-col gap-5 rounded-[1.5rem] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><BrandMark /><div className="flex flex-wrap gap-x-5 gap-y-2 text-sm"><a className="footer-link" href="#features">Features</a><a className="footer-link" href="#how-it-works">How it works</a><a className="footer-link" href="#benefits">Benefits</a></div><p className="text-xs text-mist/60">© 2025 LabCast. Made for the lab.</p></div>
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-1 pt-5 text-[11px] leading-5 text-mist/45 sm:flex-row sm:items-center sm:justify-between"><span>Clear screens. Better questions. Stronger classrooms.</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-300" /> All systems learning</span></div>
      </footer>
    </div>
  )
}

export default App
