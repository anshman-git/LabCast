import type { PropsWithChildren, ReactNode } from 'react'

export function DashboardCard({ title, action, children, className = '' }: PropsWithChildren<{ title: string; action?: ReactNode; className?: string }>) {
  return <section className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 ${className}`}><header className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold text-cloud">{title}</h2>{action}</header><div className="mt-5">{children}</div></section>
}
