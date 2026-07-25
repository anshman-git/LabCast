import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = { label: string; description: string; icon: ReactNode; to?: string; onClick?: () => void }
export function QuickAction({ label, description, icon, to, onClick }: Props) {
  const content = <><span className="grid size-10 place-items-center rounded-xl bg-sky-aqua/15 text-sky-aqua">{icon}</span><span><span className="block text-sm font-semibold text-cloud">{label}</span><span className="mt-0.5 block text-xs text-mist">{description}</span></span></>
  const classes = 'flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-ink/30 p-3 text-left transition hover:border-sky-aqua/60 hover:bg-sky-aqua/10'
  return to ? <Link to={to} className={classes}>{content}</Link> : <button type="button" onClick={onClick} className={classes}>{content}</button>
}
