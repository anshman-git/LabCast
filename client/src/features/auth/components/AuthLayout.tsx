import { Link } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { BrandMark } from '../../../components/BrandMark'

export function AuthLayout({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-[10px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-sm">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <BrandMark />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h1>
            <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px] text-zinc-600">
          For students: <Link to="/join" className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2">Join a classroom without an account →</Link>
        </p>
      </div>
    </main>
  )
}
