import { ArrowUpRight, Check } from 'lucide-react'

interface PersonaPanelProps {
  label: string
  title: string
  description: string
  image: string
  imageAlt: string
  benefits: string[]
  tone: 'teachers' | 'students'
}

export function PersonaPanel({ label, title, description, image, imageAlt, benefits, tone }: PersonaPanelProps) {
  return (
    <article className={`persona-panel rounded-panel ${tone === 'students' ? 'persona-panel-students' : ''}`}>
      <img src={image} alt={imageAlt} loading="lazy" />
      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8 lg:p-10">
        <div className="mb-auto flex items-start justify-between">
          <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">{label}</span>
          <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/20 text-white/80 backdrop-blur-sm"><ArrowUpRight size={16} /></span>
        </div>
        <div>
          <h3 className="max-w-md font-display text-3xl font-medium tracking-[-0.055em] text-white sm:text-4xl">{title}</h3>
          <p className="mt-3 max-w-lg text-base leading-7 text-white/70">{description}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-white/85"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-sky-aqua"><Check size={12} strokeWidth={2.5} /></span>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
