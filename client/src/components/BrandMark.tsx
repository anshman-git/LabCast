import { RadioTower } from 'lucide-react'

interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <a className="group inline-flex items-center gap-2.5" href="#home" aria-label="LabCast home">
      <span className="grid size-9 place-items-center rounded-xl border border-sky-aqua/35 bg-sky-aqua/10 text-sky-aqua transition-colors group-hover:border-sky-aqua/70 group-hover:bg-sky-aqua/15">
        <RadioTower size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      {!compact && <span className="font-display text-lg font-semibold tracking-[-0.04em] text-cloud">LabCast</span>}
    </a>
  )
}
