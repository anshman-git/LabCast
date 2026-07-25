import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Button } from './primitives'
import type { StatusTone } from './types'
import { cn } from './utils'

export interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-52 flex-col items-center justify-center rounded-card border border-dashed border-glass-line bg-white/[0.02] px-6 py-10 text-center', className)}>
      {icon && <div className="mb-4 grid size-12 place-items-center rounded-full border border-glass-line bg-white/5 text-mist" aria-hidden="true">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-cloud">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-mist">{description}</p>}
      {(action || secondaryAction) && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}{secondaryAction}</div>}
    </div>
  )
}

export interface ErrorStateProps {
  title?: ReactNode
  description: ReactNode
  action?: ReactNode
  className?: string
}

export function ErrorState({ title = 'Something went wrong', description, action, className }: ErrorStateProps) {
  return (
    <div className={cn('flex min-h-52 flex-col items-center justify-center rounded-card border border-error/25 bg-error/5 px-6 py-10 text-center', className)} role="alert">
      <div className="mb-4 grid size-12 place-items-center rounded-full border border-error/30 bg-error/10 text-error" aria-hidden="true"><AlertTriangle size={22} /></div>
      <h3 className="font-display text-lg font-semibold text-cloud">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-mist">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

const toastTones: Record<StatusTone, { border: string; icon: ReactNode; iconClass: string }> = {
  neutral: { border: 'border-glass-line', icon: <Info size={18} />, iconClass: 'text-fog' },
  info: { border: 'border-sky-aqua/35', icon: <Info size={18} />, iconClass: 'text-sky-aqua' },
  success: { border: 'border-bio-green/35', icon: <CheckCircle2 size={18} />, iconClass: 'text-bio-green' },
  warning: { border: 'border-warning/35', icon: <AlertTriangle size={18} />, iconClass: 'text-warning' },
  danger: { border: 'border-error/35', icon: <XCircle size={18} />, iconClass: 'text-error' },
  live: { border: 'border-sky-aqua/35', icon: <span className="size-2 rounded-full bg-sky-aqua shadow-[0_0_14px_rgba(0,204,255,0.8)]" />, iconClass: 'text-sky-aqua' },
}

export interface ToastProps {
  open?: boolean
  tone?: StatusTone
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  duration?: number
  onClose?: () => void
  className?: string
}

export function Toast({ open = true, tone = 'info', title, description, action, duration = 5000, onClose, className }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const remainingRef = useRef(duration)
  const toneConfig = toastTones[tone]

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current))
  }, [])

  const startTimer = useCallback(() => {
    if (!onClose || duration === Infinity) return
    startedAtRef.current = Date.now()
    timerRef.current = setTimeout(onClose, remainingRef.current)
  }, [duration, onClose])

  useEffect(() => {
    if (!open) return undefined
    remainingRef.current = duration
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, open, startTimer])

  if (!open) return null

  return (
    <div
      className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border bg-panel-blue/95 p-4 text-left shadow-glass backdrop-blur-xl', toneConfig.border, className)}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      onMouseEnter={stopTimer}
      onFocus={stopTimer}
      onMouseLeave={startTimer}
      onBlur={startTimer}
    >
      <span className={cn('mt-0.5 shrink-0', toneConfig.iconClass)} aria-hidden="true">{toneConfig.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-cloud">{title}</p>
        {description && <p className="mt-1 text-sm leading-5 text-mist">{description}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && <Button className="-mr-2 -mt-2 shrink-0" variant="quiet" size="sm" onClick={onClose} aria-label="Dismiss notification"><X size={16} /></Button>}
    </div>
  )
}

export interface ToastViewportProps {
  children: ReactNode
  className?: string
  label?: string
}

export function ToastViewport({ children, className, label = 'Notifications' }: ToastViewportProps) {
  return <div className={cn('pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:inset-auto sm:right-6 sm:top-6 sm:bottom-auto', className)} aria-label={label}>{children}</div>
}
