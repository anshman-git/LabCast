interface TimelineStepProps {
  number: string
  title: string
  description: string
  accent: 'cyan' | 'purple' | 'white'
}

const accentClasses = {
  cyan: 'border-sky-aqua/45 text-sky-aqua',
  purple: 'border-hyper-magenta/45 text-fuchsia-300',
  white: 'border-white/25 text-cloud',
}

export function TimelineStep({ number, title, description, accent }: TimelineStepProps) {
  return (
    <article className="relative flex gap-5 sm:gap-8">
      <div className={`timeline-dot shrink-0 ${accentClasses[accent]}`}>{number}</div>
      <div className="pb-10 pt-0.5 sm:pb-14">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-mist/60">Step {number}</p>
        <h3 className="mt-2 font-display text-2xl font-medium tracking-[-0.045em] text-cloud sm:text-3xl">{title}</h3>
        <p className="mt-2 max-w-md text-base leading-7 text-mist">{description}</p>
      </div>
    </article>
  )
}
