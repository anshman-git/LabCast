import { Link } from 'react-router-dom'
import type { PropsWithChildren } from 'react'

export function AuthLayout({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  return <main className="grid min-h-screen place-items-center bg-ink px-5 py-10"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur sm:p-9"><Link className="font-display text-xl font-bold tracking-tight text-sky-aqua" to="/">LabCast</Link><h1 className="mt-8 font-display text-3xl font-semibold text-cloud">{title}</h1><p className="mt-2 text-sm leading-6 text-mist">{subtitle}</p>{children}</section></main>
}
