import {
  Activity,
  Check,
  Maximize2,
  Mic,
  MoreHorizontal,
  MonitorPlay,
  Paperclip,
  ScreenShare,
  Users,
} from 'lucide-react'

const students = [
  { initials: 'AM', color: 'bg-cyan-400/80' },
  { initials: 'JR', color: 'bg-violet-400/80' },
  { initials: 'SK', color: 'bg-pink-400/80' },
  { initials: 'TC', color: 'bg-emerald-400/80' },
]

export function ProductPreview() {
  return (
    <div className="product-frame rounded-panel p-2.5 sm:p-3">
      <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3 text-xs text-mist">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
          <span className="font-display font-medium text-cloud">LabCast / Design Systems 204</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="flex items-center gap-1.5"><Users size={13} /> 24 students</span>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">Live</span>
        </div>
      </div>

      <div className="grid min-h-[24rem] grid-cols-[3.5rem_1fr] gap-2.5 pt-2.5 sm:grid-cols-[5.25rem_1fr] sm:gap-3">
        <aside className="product-sidebar flex flex-col items-center justify-between rounded-xl px-2 py-3 sm:items-stretch sm:px-3">
          <div className="space-y-3">
            <div className="mx-auto grid size-8 place-items-center rounded-lg bg-sky-aqua text-ink sm:mx-0"><MonitorPlay size={16} /></div>
            <div className="space-y-2">
              {[Activity, ScreenShare, Users].map((Icon, index) => (
                <div key={index} className={`grid size-8 place-items-center rounded-lg ${index === 0 ? 'bg-white/10 text-sky-aqua' : 'text-mist/70'} sm:w-full`}>
                  <Icon size={15} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-sky-aqua to-indigo-ink font-display text-[10px] font-semibold text-cloud sm:size-9">RB</div>
        </aside>

        <div className="product-window rounded-xl p-2.5 sm:p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-display text-xs font-medium text-cloud sm:text-sm">Today&apos;s session</p>
              <p className="mt-0.5 text-[10px] text-mist">Tuesday, 10:02 AM</p>
            </div>
            <button className="rounded-lg p-1.5 text-mist transition-colors hover:bg-white/10 hover:text-cloud" aria-label="More classroom options"><MoreHorizontal size={16} /></button>
          </div>

          <div className="mini-screen min-h-[11.5rem] rounded-xl p-3 sm:min-h-[13rem] sm:p-4">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="rounded-full bg-black/20 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-100">Screen sharing</span>
                <h3 className="mt-4 max-w-[10rem] font-display text-base font-semibold leading-tight text-white sm:text-xl">Intro to UX Systems</h3>
              </div>
              <Maximize2 size={14} className="text-white/70" aria-hidden="true" />
            </div>
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between text-[10px] text-white/70 sm:inset-x-4 sm:bottom-4">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-300" /> Instructor is sharing</span>
              <span>38:24</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {students.map((student) => (
              <div key={student.initials} className="aspect-[1.35] rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
                <div className="flex h-full flex-col justify-between rounded-md bg-gradient-to-br from-white/10 to-transparent p-1.5">
                  <div className={`grid size-5 place-items-center rounded-full ${student.color} font-display text-[8px] font-bold text-ink`}>{student.initials}</div>
                  <span className="flex items-center gap-1 text-[8px] text-mist"><Mic size={9} /> listening</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[10px] text-mist sm:px-3">
            <div className="flex items-center gap-2"><span className="grid size-5 place-items-center rounded-md bg-white/10 text-mist"><Paperclip size={11} /></span> shared-notes.pdf</div>
            <span className="flex items-center gap-1 text-emerald-200"><Check size={12} /> synced</span>
          </div>
        </div>
      </div>
    </div>
  )
}
