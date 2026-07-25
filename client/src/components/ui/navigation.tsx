import { useId, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Bell, Check, ChevronLeft, ChevronRight, Menu, Search, X } from 'lucide-react'
import { Avatar, Button, Input } from './primitives'
import { cn } from './utils'

export interface TabItem {
  value: string
  label: ReactNode
  content: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Tabs({ items, value, defaultValue, onValueChange, orientation = 'horizontal', className }: TabsProps) {
  const firstEnabled = items.find((item) => !item.disabled)?.value ?? ''
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? firstEnabled)
  const selectedValue = value ?? uncontrolledValue
  const selectedItem = items.find((item) => item.value === selectedValue) ?? items[0]
  const tabsId = useId()
  const setValue = (next: string) => {
    if (value === undefined) setUncontrolledValue(next)
    onValueChange?.(next)
  }
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled)
    const currentEnabledIndex = enabled.findIndex(({ index }) => index === currentIndex)
    let nextEnabledIndex = currentEnabledIndex
    if (event.key === 'ArrowRight' || (orientation === 'vertical' && event.key === 'ArrowDown')) nextEnabledIndex = (currentEnabledIndex + 1) % enabled.length
    if (event.key === 'ArrowLeft' || (orientation === 'vertical' && event.key === 'ArrowUp')) nextEnabledIndex = (currentEnabledIndex - 1 + enabled.length) % enabled.length
    if (event.key === 'Home') nextEnabledIndex = 0
    if (event.key === 'End') nextEnabledIndex = enabled.length - 1
    if (nextEnabledIndex !== currentEnabledIndex && enabled[nextEnabledIndex]) {
      event.preventDefault()
      setValue(enabled[nextEnabledIndex].item.value)
      document.getElementById(`${tabsId}-tab-${enabled[nextEnabledIndex].item.value}`)?.focus()
    }
  }

  return <div className={cn('min-w-0', orientation === 'vertical' && 'grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)]', className)}>
    <div className={cn('flex min-w-0 gap-1 border-b border-glass-line', orientation === 'horizontal' ? 'overflow-x-auto' : 'flex-col border-b-0 md:border-r md:pr-4')} role="tablist" aria-orientation={orientation}>
      {items.map((item, index) => {
        const isSelected = item.value === selectedValue
        return <button key={item.value} id={`${tabsId}-tab-${item.value}`} type="button" role="tab" aria-selected={isSelected} aria-controls={`${tabsId}-panel-${item.value}`} tabIndex={isSelected ? 0 : -1} disabled={item.disabled} onClick={() => setValue(item.value)} onKeyDown={(event) => handleKeyDown(event, index)} className={cn('relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-3 text-sm font-semibold text-mist outline-none transition-colors hover:text-cloud focus-visible:text-cloud disabled:pointer-events-none disabled:opacity-40', orientation === 'horizontal' ? 'rounded-t-control' : 'justify-start rounded-control md:rounded-r-none', isSelected && 'text-sky-aqua', isSelected && orientation === 'horizontal' && 'after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-sky-aqua', isSelected && orientation === 'vertical' && 'bg-sky-aqua/10 text-sky-aqua md:after:absolute md:after:inset-y-2 md:-right-[1.0625rem] md:w-0.5 md:bg-sky-aqua')}>
          {item.icon && <span aria-hidden="true">{item.icon}</span>}{item.label}{isSelected && <Check size={14} className="sr-only" aria-hidden="true" />}
        </button>
      })}
    </div>
    {selectedItem && <div id={`${tabsId}-panel-${selectedItem.value}`} role="tabpanel" aria-labelledby={`${tabsId}-tab-${selectedItem.value}`} tabIndex={0} className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-sky-aqua/40">{selectedItem.content}</div>}
  </div>
}

export interface SearchBarProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  label?: string
  className?: string
}

export function SearchBar({ value, defaultValue = '', onChange, onSubmit, onClear, placeholder = 'Search rooms, people, files…', label = 'Search', className }: SearchBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const searchValue = value ?? uncontrolledValue
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setUncontrolledValue(event.target.value)
    onChange?.(event.target.value)
  }
  return <form className={cn('relative min-w-0', className)} role="search" onSubmit={(event) => { event.preventDefault(); onSubmit?.(searchValue) }}>
    <Input aria-label={label} value={searchValue} onChange={update} placeholder={placeholder} startAdornment={<Search size={17} />} endAdornment={searchValue ? <button type="button" className="pointer-events-auto rounded p-1 text-mist hover:text-cloud focus-visible:outline-2 focus-visible:outline-sky-aqua" aria-label="Clear search" onClick={() => { if (value === undefined) setUncontrolledValue(''); onClear?.() }}><X size={15} /></button> : undefined} />
  </form>
}

export interface SidebarItem {
  id: string
  label: ReactNode
  icon: ReactNode
  href?: string
  badge?: ReactNode
  disabled?: boolean
}

export interface SidebarGroup {
  label: ReactNode
  items: SidebarItem[]
}

export interface SidebarProps {
  groups: SidebarGroup[]
  activeId?: string
  onSelect?: (item: SidebarItem) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  brand?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Sidebar({ groups, activeId, onSelect, collapsed = false, onCollapsedChange, mobileOpen = false, onMobileOpenChange, brand, footer, className }: SidebarProps) {
  const renderItems = (mobile = false) => <nav className="grid gap-6" aria-label="Primary navigation">{groups.map((group) => <div key={String(group.label)} className="grid gap-2"><p className={cn('px-3 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/70', collapsed && !mobile && 'sr-only')}>{group.label}</p><div className="grid gap-1">{group.items.map((item) => {
    const active = item.id === activeId
    const content = <><span className={cn('shrink-0', active ? 'text-sky-aqua' : 'text-mist')}>{item.icon}</span><span className={cn('min-w-0 flex-1 truncate', collapsed && !mobile && 'sr-only')}>{item.label}</span>{item.badge && !(collapsed && !mobile) && <span className="shrink-0">{item.badge}</span>}</>
    const itemClass = cn('group relative flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-semibold text-mist outline-none transition-colors hover:bg-white/5 hover:text-cloud focus-visible:ring-2 focus-visible:ring-sky-aqua/50 disabled:pointer-events-none disabled:opacity-40', active && 'bg-sky-aqua/10 text-cloud before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-pill before:bg-sky-aqua', collapsed && !mobile && 'justify-center px-2')
    if (item.href) return <a key={item.id} href={item.href} className={itemClass} aria-current={active ? 'page' : undefined} aria-label={collapsed && !mobile ? String(item.label) : undefined} title={collapsed && !mobile ? String(item.label) : undefined} onClick={() => { onSelect?.(item); if (mobile) onMobileOpenChange?.(false) }}>{content}</a>
    return <button key={item.id} type="button" className={itemClass} aria-current={active ? 'page' : undefined} aria-label={collapsed && !mobile ? String(item.label) : undefined} title={collapsed && !mobile ? String(item.label) : undefined} disabled={item.disabled} onClick={() => { onSelect?.(item); if (mobile) onMobileOpenChange?.(false) }}>{content}</button>
  })}</div></div>)}</nav>

  return <>
    <aside className={cn('hidden h-dvh shrink-0 flex-col border-r border-glass-line bg-sidebar-ink px-3 py-5 md:flex', collapsed ? 'w-20' : 'w-64', className)}>
      <div className={cn('mb-8 flex min-h-11 items-center', collapsed ? 'justify-center' : 'px-2')}>{brand}</div>
      <div className="min-h-0 flex-1 overflow-y-auto">{renderItems()}</div>
      <div className="mt-6 grid gap-3">{footer}{onCollapsedChange && <Button variant="quiet" size="sm" className={cn('w-full', collapsed && 'px-0')} onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse</span></>}</Button>}</div>
    </aside>
    {mobileOpen && <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" className="absolute inset-0 bg-ink/75 backdrop-blur-sm" aria-label="Close navigation menu" onClick={() => onMobileOpenChange?.(false)} />
      <aside className="relative z-10 flex h-full w-[min(19rem,88vw)] flex-col border-r border-glass-line bg-sidebar-ink px-3 py-5 shadow-glass">
        <div className="mb-8 flex min-h-11 items-center justify-between px-2">{brand}<Button variant="quiet" size="sm" onClick={() => onMobileOpenChange?.(false)} aria-label="Close navigation menu"><X size={18} /></Button></div>
        <div className="min-h-0 flex-1 overflow-y-auto">{renderItems(true)}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </aside>
    </div>}
  </>
}

export interface NavbarProps {
  brand?: ReactNode
  title?: ReactNode
  leading?: ReactNode
  actions?: ReactNode
  onMenuClick?: () => void
  notificationCount?: number
  onNotificationsClick?: () => void
  user?: { name: string; src?: string }
  className?: string
}

export function Navbar({ brand, title, leading, actions, onMenuClick, notificationCount = 0, onNotificationsClick, user, className }: NavbarProps) {
  return <header className={cn('flex min-h-16 items-center gap-3 border-b border-glass-line bg-ink/70 px-4 backdrop-blur-xl sm:px-6', className)}>
    {onMenuClick && <Button className="md:hidden" variant="quiet" size="sm" onClick={onMenuClick} aria-label="Open navigation menu"><Menu size={20} /></Button>}
    {brand && <div className="shrink-0">{brand}</div>}
    {leading && <div className="hidden min-w-0 items-center sm:flex">{leading}</div>}
    {title && <h1 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-cloud sm:text-lg">{title}</h1>}
    {!title && <div className="flex-1" />}
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      {actions}
      {onNotificationsClick && <Button variant="quiet" size="sm" className="relative" onClick={onNotificationsClick} aria-label={notificationCount ? `Notifications, ${notificationCount} unread` : 'Notifications'}><Bell size={18} />{notificationCount > 0 && <span className="absolute right-1 top-1 grid min-w-4 translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill bg-sky-aqua px-1 text-[9px] font-bold text-ink" aria-hidden="true">{notificationCount > 9 ? '9+' : notificationCount}</span>}</Button>}
      {user && <Avatar name={user.name} src={user.src} size="sm" />}
    </div>
  </header>
}
