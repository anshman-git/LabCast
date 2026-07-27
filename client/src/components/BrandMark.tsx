import { Cast } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BrandMarkProps {
  compact?: boolean
  href?: string
}

export function BrandMark({ compact = false, href = '/' }: BrandMarkProps) {
  return (
    <Link className="group inline-flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors" to={href} aria-label="LabCast home">
      <span className="flex size-7 items-center justify-center rounded-[8px] border border-zinc-700/60 bg-zinc-800/80 text-zinc-200 group-hover:border-zinc-600 group-hover:bg-zinc-700/80 transition-colors">
        <Cast size={15} strokeWidth={2} aria-hidden="true" />
      </span>
      {!compact && (
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-sm font-semibold tracking-tight text-zinc-100">LabCast</span>
          <span className="rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">LAB</span>
        </div>
      )}
    </Link>
  )
}
