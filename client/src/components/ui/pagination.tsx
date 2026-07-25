import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from './primitives'
import type { ControlSize } from './types'
import { cn } from './utils'

export interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  showFirstLast?: boolean
  size?: ControlSize
  className?: string
  label?: string
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  const totalPageNumbers = siblingCount * 2 + 5
  if (pageCount <= totalPageNumbers) return Array.from({ length: pageCount }, (_, index) => index + 1)
  const leftSibling = Math.max(page - siblingCount, 1)
  const rightSibling = Math.min(page + siblingCount, pageCount)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < pageCount - 1
  if (!showLeftEllipsis && showRightEllipsis) return [...Array.from({ length: 3 + siblingCount * 2 }, (_, index) => index + 1), 'ellipsis-end', pageCount]
  if (showLeftEllipsis && !showRightEllipsis) return [1, 'ellipsis-start', ...Array.from({ length: 3 + siblingCount * 2 }, (_, index) => pageCount - (2 + siblingCount * 2) + index)]
  return [1, 'ellipsis-start', ...Array.from({ length: siblingCount * 2 + 1 }, (_, index) => leftSibling + index), 'ellipsis-end', pageCount]
}

export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, showFirstLast = true, size = 'sm', className, label = 'Pagination' }: PaginationProps) {
  if (pageCount < 2) return null
  const items = getPageItems(page, pageCount, siblingCount)
  const goTo = (nextPage: number) => onPageChange(Math.min(pageCount, Math.max(1, nextPage)))
  return <nav className={cn('flex flex-wrap items-center justify-center gap-1', className)} aria-label={label}>
    {showFirstLast && <Button variant="quiet" size={size} onClick={() => goTo(1)} disabled={page === 1} aria-label="First page"><ChevronsLeft size={16} /></Button>}
    <Button variant="quiet" size={size} onClick={() => goTo(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={16} /></Button>
    {items.map((item) => item === 'ellipsis-start' || item === 'ellipsis-end' ? <span key={item} className="grid min-h-10 min-w-8 place-items-center px-1 text-sm text-mist" aria-hidden="true">…</span> : <Button key={item} variant={item === page ? 'secondary' : 'quiet'} size={size} onClick={() => goTo(item)} aria-current={item === page ? 'page' : undefined} aria-label={`Page ${item}`}>{item}</Button>)}
    <Button variant="quiet" size={size} onClick={() => goTo(page + 1)} disabled={page === pageCount} aria-label="Next page"><ChevronRight size={16} /></Button>
    {showFirstLast && <Button variant="quiet" size={size} onClick={() => goTo(pageCount)} disabled={page === pageCount} aria-label="Last page"><ChevronsRight size={16} /></Button>}
  </nav>
}
