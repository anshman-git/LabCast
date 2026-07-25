import { createPortal } from 'react-dom'
import { cloneElement, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactElement, type ReactNode, type RefObject } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from './primitives'
import type { Placement } from './types'
import { cn } from './utils'

function useModalFocus(open: boolean, containerRef: RefObject<HTMLElement | null>, initialFocusRef?: RefObject<HTMLElement | null>, onClose?: () => void) {
  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement as HTMLElement | null
    const container = containerRef.current
    const focusable = () => Array.from(container?.querySelectorAll<HTMLElement>('[data-autofocus],button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? [])
    const first = initialFocusRef?.current ?? focusable()[0] ?? container
    const focusTimer = window.setTimeout(() => first?.focus(), 0)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusable()
      if (elements.length === 0) {
        event.preventDefault()
        container?.focus()
        return
      }
      const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
      const nextIndex = event.shiftKey ? (currentIndex <= 0 ? elements.length - 1 : currentIndex - 1) : (currentIndex === elements.length - 1 ? 0 : currentIndex + 1)
      if (currentIndex === -1 || nextIndex !== currentIndex) {
        event.preventDefault()
        elements[nextIndex]?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [containerRef, initialFocusRef, onClose, open])
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeLabel?: string
  showClose?: boolean
  initialFocusRef?: RefObject<HTMLElement | null>
  className?: string
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', closeLabel = 'Close dialog', showClose = true, initialFocusRef, className }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  useModalFocus(open, dialogRef, initialFocusRef, onClose)
  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  const modal = (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} className={cn('w-full rounded-panel border border-glass-line bg-panel-blue/95 shadow-glass outline-none backdrop-blur-xl', sizes[size], className)} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-describedby={description ? descriptionId : undefined} tabIndex={-1}>
        {(title || showClose) && <div className="flex items-start justify-between gap-4 border-b border-glass-line p-5 sm:p-6">
          <div className="min-w-0">
            {title && <h2 id={titleId} className="font-display text-xl font-semibold text-cloud">{title}</h2>}
            {description && <p id={descriptionId} className="mt-1 text-sm leading-6 text-mist">{description}</p>}
          </div>
          {showClose && <Button variant="quiet" size="sm" onClick={onClose} aria-label={closeLabel}><X size={18} /></Button>}
        </div>}
        <div className="p-5 sm:p-6">{children}</div>
        {footer && <div className="border-t border-glass-line p-5 sm:p-6">{footer}</div>}
      </div>
    </div>
  )
  return createPortal(modal, document.body)
}

export interface DialogProps extends Omit<ModalProps, 'children'> {
  children?: ReactNode
}

export function Dialog({ children, ...props }: DialogProps) {
  return <Modal {...props}>{children}</Modal>
}

export interface DropdownItem {
  id: string
  label: ReactNode
  icon?: ReactNode
  shortcut?: ReactNode
  disabled?: boolean
  destructive?: boolean
  selected?: boolean
  onSelect?: () => void
}

export interface DropdownMenuItemProps extends Omit<DropdownItem, 'id'> {
  onClick?: () => void
}

export function DropdownMenuItem({ label, icon, shortcut, disabled, destructive, selected, onClick }: DropdownMenuItemProps) {
  return <button type="button" data-dropdown-item="true" className={cn('flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm text-fog outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/10 disabled:pointer-events-none disabled:opacity-40', destructive ? 'text-error hover:bg-error/10' : 'hover:text-cloud')} disabled={disabled} onClick={onClick}>
    {icon && <span className="shrink-0 text-mist" aria-hidden="true">{icon}</span>}
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {selected && <Check size={16} className="shrink-0 text-sky-aqua" aria-label="Selected" />}
    {shortcut && <span className="shrink-0 font-mono text-[10px] text-mist">{shortcut}</span>}
  </button>
}

export interface DropdownProps {
  trigger: ReactElement
  items?: DropdownItem[]
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'start' | 'end'
  className?: string
  menuClassName?: string
  label?: string
}

export function Dropdown({ trigger, items, children, open, defaultOpen = false, onOpenChange, align = 'start', className, menuClassName, label = 'Menu' }: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = open ?? uncontrolledOpen
  const menuRef = useRef<HTMLDivElement>(null)
  const setOpen = useCallback((next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [onOpenChange, open])

  useEffect(() => {
    if (!isOpen) return undefined
    const focusFirst = window.setTimeout(() => menuRef.current?.querySelector<HTMLButtonElement>('[data-dropdown-item]')?.focus(), 0)
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.parentElement?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.clearTimeout(focusFirst)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen, setOpen])

  const triggerProps = {
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      const original = (trigger.props as { onClick?: (event: React.MouseEvent<HTMLElement>) => void }).onClick
      original?.(event)
      setOpen(!isOpen)
    },
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const options = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[data-dropdown-item]:not(:disabled)') ?? [])
    const current = options.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (!options.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); options[current < options.length - 1 ? current + 1 : 0]?.focus() }
    if (event.key === 'ArrowUp') { event.preventDefault(); options[current > 0 ? current - 1 : options.length - 1]?.focus() }
    if (event.key === 'Home') { event.preventDefault(); options[0]?.focus() }
    if (event.key === 'End') { event.preventDefault(); options[options.length - 1]?.focus() }
  }

  return <div className={cn('relative inline-flex', className)}>
    {cloneElement(trigger, triggerProps)}
    {isOpen && <div ref={menuRef} className={cn('absolute top-[calc(100%+0.5rem)] z-40 min-w-52 rounded-control border border-glass-line bg-panel-blue/98 p-1.5 shadow-glass backdrop-blur-xl', align === 'end' ? 'right-0' : 'left-0', menuClassName)} role="menu" aria-label={label} onKeyDown={handleKeyDown}>
      {items?.map((item) => <DropdownMenuItem key={item.id} {...item} onClick={() => { item.onSelect?.(); setOpen(false) }} />)}
      {children}
    </div>}
  </div>
}

export interface TooltipProps {
  content: ReactNode
  children: ReactElement
  side?: Placement
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const sideClasses = { top: 'bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2', bottom: 'top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2', left: 'right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2', right: 'left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2' }
  const childProps = { 'aria-describedby': open ? tooltipId : undefined, onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false) }
  return <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>{cloneElement(children, childProps)}{open && <span id={tooltipId} className={cn('pointer-events-none absolute z-50 max-w-64 rounded-control border border-glass-line bg-sidebar-ink px-2.5 py-1.5 text-center text-xs text-cloud shadow-glass', sideClasses[side], className)} role="tooltip">{content}</span>}</span>
}
