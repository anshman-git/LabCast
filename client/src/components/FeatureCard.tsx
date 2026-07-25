import type { ReactNode } from 'react'

export type FeatureTone = 'cyan' | 'purple' | 'violet' | 'blue' | 'green'

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  tone: FeatureTone
  className?: string
  children?: ReactNode
}

export function FeatureCard({ title, description, icon, tone, className = '', children }: FeatureCardProps) {
  return (
    <article className={`feature-card feature-card-${tone} rounded-panel p-5 sm:p-6 ${className}`}>
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-8 flex items-start justify-between gap-4">
          <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-cloud">{icon}</span>
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-mist/60">LabCast tool</span>
        </div>
        <div className="mt-auto">
          <h3 className="font-display text-xl font-medium tracking-[-0.04em] text-cloud">{title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-mist">{description}</p>
          {children}
        </div>
      </div>
    </article>
  )
}
