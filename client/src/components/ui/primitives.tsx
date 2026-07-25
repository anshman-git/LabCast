import { forwardRef, useId, useState, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { LoaderCircle, TrendingDown, TrendingUp } from 'lucide-react'
import type { ButtonVariant, ControlSize, StatusTone } from './types'
import { cn, getInitials } from './utils'

const controlSizes: Record<ControlSize, string> = {
  sm: 'min-h-10 rounded-control px-3 text-sm',
  md: 'min-h-11 rounded-control px-4 text-sm',
  lg: 'min-h-12 rounded-control px-5 text-base',
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-sky-aqua text-ink shadow-aqua hover:bg-sky-aqua/90',
  secondary: 'border border-glass-line bg-white/5 text-cloud hover:border-sky-aqua/50 hover:bg-sky-aqua/10',
  quiet: 'text-mist hover:bg-white/5 hover:text-cloud',
  destructive: 'bg-error text-ink shadow-[0_12px_40px_rgba(255,102,120,0.18)] hover:bg-error/90',
  ghost: 'bg-transparent text-fog hover:bg-white/5 hover:text-cloud',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ControlSize
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, fullWidth = false, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-display font-semibold transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-aqua disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
        controlSizes[size],
        buttonVariants[variant],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Loader size="sm" label="Loading" />}
      {children}
    </button>
  )
})

export interface LoaderProps {
  size?: ControlSize
  label?: string
  className?: string
}

export function Loader({ size = 'md', label, className }: LoaderProps) {
  const sizes: Record<ControlSize, string> = { sm: 'size-4', md: 'size-5', lg: 'size-6' }

  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', className)} role={label ? 'status' : undefined} aria-label={label}>
      <LoaderCircle className={cn('animate-spin text-current motion-reduce:animate-none', sizes[size])} aria-hidden="true" />
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}

interface FieldAffixProps {
  startAdornment?: ReactNode
  endAdornment?: ReactNode
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldAffixProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, startAdornment, endAdornment, className, containerClassName, required, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? `input-${generatedId}`
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('grid gap-2', containerClassName)}>
      {label && <label className="font-display text-sm font-medium text-fog" htmlFor={fieldId}>{label}{required && <span className="ml-1 text-error" aria-hidden="true">*</span>}</label>}
      <div className="relative flex items-center">
        {startAdornment && <span className="pointer-events-none absolute left-3.5 text-mist" aria-hidden="true">{startAdornment}</span>}
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            'min-h-11 w-full rounded-control border border-glass-line bg-charcoal-blue/70 px-3.5 text-base text-cloud outline-none transition-[border-color,box-shadow,background-color] placeholder:text-mist/70 focus:border-sky-aqua focus:bg-charcoal-blue focus:ring-2 focus:ring-sky-aqua/20 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
            startAdornment && 'pl-10',
            endAdornment && 'pr-10',
            error && 'border-error/70 focus:border-error focus:ring-error/20',
            className,
          )}
          required={required}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={describedBy}
          {...props}
        />
        {endAdornment && <span className="absolute right-3.5 text-mist" aria-hidden={typeof endAdornment !== 'string'}>{endAdornment}</span>}
      </div>
      {hint && !error && <p id={hintId} className="text-xs leading-5 text-mist">{hint}</p>}
      {error && <p id={errorId} className="text-xs leading-5 text-error" role="alert">{error}</p>}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  containerClassName?: string
  characterCount?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, className, containerClassName, required, characterCount, ...props },
  ref,
) {
  const generatedId = useId()
  const fieldId = id ?? `textarea-${generatedId}`
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('grid gap-2', containerClassName)}>
      {label && <label className="font-display text-sm font-medium text-fog" htmlFor={fieldId}>{label}{required && <span className="ml-1 text-error" aria-hidden="true">*</span>}</label>}
      <textarea
        ref={ref}
        id={fieldId}
        className={cn(
          'min-h-28 w-full resize-y rounded-control border border-glass-line bg-charcoal-blue/70 px-3.5 py-3 text-base text-cloud outline-none transition-[border-color,box-shadow,background-color] placeholder:text-mist/70 focus:border-sky-aqua focus:bg-charcoal-blue focus:ring-2 focus:ring-sky-aqua/20 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none',
          error && 'border-error/70 focus:border-error focus:ring-error/20',
          className,
        )}
        required={required}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={describedBy}
        {...props}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          {hint && !error && <p id={hintId} className="text-xs leading-5 text-mist">{hint}</p>}
          {error && <p id={errorId} className="text-xs leading-5 text-error" role="alert">{error}</p>}
        </div>
        {characterCount !== undefined && <span className="shrink-0 font-mono text-xs text-mist" aria-live="polite">{characterCount}</span>}
      </div>
    </div>
  )
})

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'active' | 'subtle'
  interactive?: boolean
}

export function Card({ className, tone = 'default', interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-glass-line bg-panel-blue/75 shadow-glass backdrop-blur-xl',
        tone === 'active' && 'border-sky-aqua/40 shadow-aqua',
        tone === 'subtle' && 'bg-white/[0.035] shadow-none',
        interactive && 'transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-sky-aqua/40 hover:bg-panel-blue motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-start justify-between gap-3 p-5 pb-0 sm:p-6 sm:pb-0', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-3 border-t border-glass-line p-5 sm:p-6', className)} {...props} />
}

const badgeTones: Record<StatusTone, string> = {
  neutral: 'border-glass-line bg-white/5 text-fog',
  info: 'border-sky-aqua/30 bg-sky-aqua/10 text-sky-aqua',
  success: 'border-bio-green/30 bg-bio-green/10 text-bio-green',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-error/30 bg-error/10 text-error',
  live: 'border-sky-aqua/40 bg-sky-aqua/10 text-sky-aqua shadow-[0_0_24px_rgba(0,204,255,0.12)]',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone
  size?: ControlSize
  dot?: boolean
  icon?: ReactNode
}

export function Badge({ className, tone = 'neutral', size = 'sm', dot = false, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex w-fit items-center gap-1.5 rounded-pill border font-display font-semibold', size === 'sm' ? 'px-2.5 py-1 text-[11px]' : size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm', badgeTones[tone], className)} {...props}>
      {dot && <span className={cn('size-1.5 rounded-full bg-current', tone === 'live' && 'animate-pulse motion-reduce:animate-none')} aria-hidden="true" />}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  )
}

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
}

export function Avatar({ name, src, size = 'md', status, className, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const sizes = { xs: 'size-6 text-[9px]', sm: 'size-8 text-[10px]', md: 'size-10 text-xs', lg: 'size-12 text-sm', xl: 'size-16 text-lg' }
  const statusColors = { online: 'bg-bio-green', offline: 'bg-mist', busy: 'bg-error', away: 'bg-warning' }

  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-charcoal-blue font-display font-semibold text-cloud', sizes[size], className)} title={name} {...props}>
      {src && !imageFailed ? <img className="size-full rounded-full object-cover" src={src} alt={name} onError={() => setImageFailed(true)} /> : getInitials(name)}
      {status && <span className={cn('absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-ink', statusColors[status])} aria-label={status} />}
    </span>
  )
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'control' | 'card' | 'pill' | 'full'
}

export function Skeleton({ className, rounded = 'control', ...props }: SkeletonProps) {
  const roundedClasses = { control: 'rounded-control', card: 'rounded-card', pill: 'rounded-pill', full: 'rounded-full' }
  return <div className={cn('animate-pulse bg-white/[0.08] motion-reduce:animate-none', roundedClasses[rounded], className)} aria-hidden="true" {...props} />
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  trend?: ReactNode
  trendDirection?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export function StatCard({ label, value, description, trend, trendDirection = 'neutral', icon, className, ...props }: StatCardProps) {
  return (
    <Card className={cn('min-w-0', className)} {...props}>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-mist">{label}</p>
          {icon && <span className="text-sky-aqua" aria-hidden="true">{icon}</span>}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-cloud">{value}</p>
          {trend && <span className={cn('inline-flex items-center gap-1 pb-1 text-xs font-semibold', trendDirection === 'up' ? 'text-bio-green' : trendDirection === 'down' ? 'text-error' : 'text-mist')}>
            {trendDirection === 'up' && <TrendingUp size={14} aria-hidden="true" />}
            {trendDirection === 'down' && <TrendingDown size={14} aria-hidden="true" />}
            {trend}
          </span>}
        </div>
        {description && <p className="mt-2 text-sm text-mist">{description}</p>}
      </CardContent>
    </Card>
  )
}
