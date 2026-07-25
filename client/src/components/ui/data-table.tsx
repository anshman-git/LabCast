import { useEffect, useRef, type ReactNode } from 'react'
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { EmptyState } from './feedback'
import { Skeleton } from './primitives'
import { cn } from './utils'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render?: (row: T, index: number) => ReactNode
  sortable?: boolean
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  caption?: string
  getRowId?: (row: T, index: number) => string
  loading?: boolean
  loadingRowCount?: number
  emptyState?: ReactNode
  error?: ReactNode
  selectable?: boolean
  selectedRowIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void
  className?: string
}

export function DataTable<T>({ columns, data, caption = 'Data table', getRowId = (_, index) => String(index), loading = false, loadingRowCount = 4, emptyState, error, selectable = false, selectedRowIds = [], onSelectionChange, sortKey, sortDirection, onSortChange, className }: DataTableProps<T>) {
  const selectAllRef = useRef<HTMLInputElement>(null)
  const ids = data.map(getRowId)
  const allSelected = ids.length > 0 && ids.every((id) => selectedRowIds.includes(id))
  const someSelected = !allSelected && ids.some((id) => selectedRowIds.includes(id))

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected
  }, [someSelected])

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return
    onSelectionChange(selectedRowIds.includes(id) ? selectedRowIds.filter((selectedId) => selectedId !== id) : [...selectedRowIds, id])
  }

  const toggleAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? selectedRowIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...selectedRowIds, ...ids])))
  }

  const getSortIcon = (column: DataTableColumn<T>) => {
    if (!column.sortable) return null
    if (sortKey !== column.key) return <ChevronsUpDown size={14} aria-hidden="true" />
    return sortDirection === 'desc' ? <ChevronDown size={14} aria-hidden="true" /> : <ChevronUp size={14} aria-hidden="true" />
  }

  return <div className={cn('min-w-0 overflow-hidden rounded-card border border-glass-line bg-panel-blue/75 shadow-glass backdrop-blur-xl', className)} aria-busy={loading}>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-glass-line bg-white/[0.025] text-xs uppercase tracking-[0.12em] text-mist">
          <tr>
            {selectable && <th scope="col" className="w-12 px-4 py-3"><input ref={selectAllRef} type="checkbox" className="size-4 accent-sky-aqua" checked={allSelected} onChange={toggleAll} aria-label="Select all rows" /></th>}
            {columns.map((column) => {
              const ariaSort = column.sortable && sortKey === column.key ? sortDirection === 'asc' ? 'ascending' : 'descending' : column.sortable ? 'none' : undefined
              return <th key={column.key} scope="col" className={cn('px-4 py-3 font-display font-semibold', column.headerClassName)} aria-sort={ariaSort}>
                {column.sortable ? <button type="button" className="inline-flex min-h-8 items-center gap-2 rounded px-1 text-left transition-colors hover:text-cloud focus-visible:outline-2 focus-visible:outline-sky-aqua" onClick={() => onSortChange?.(column.key, sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc')}>{column.header}{getSortIcon(column)}</button> : column.header}
              </th>
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-glass-line">
          {loading && Array.from({ length: loadingRowCount }, (_, rowIndex) => <tr key={`loading-${rowIndex}`}>{selectable && <td className="px-4 py-4"><Skeleton className="size-4" rounded="control" /></td>}{columns.map((column) => <td key={column.key} className="px-4 py-4"><Skeleton className="h-4 w-3/4" rounded="control" /></td>)}</tr>)}
          {!loading && error && <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="p-6">{error}</td></tr>}
          {!loading && !error && !data.length && <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="p-6">{emptyState ?? <EmptyState title="No results" description="There is no data to display yet." />}</td></tr>}
          {!loading && !error && data.map((row, index) => {
            const id = getRowId(row, index)
            const selected = selectedRowIds.includes(id)
            return <tr key={id} className={cn('text-fog transition-colors hover:bg-white/[0.035]', selected && 'bg-sky-aqua/[0.06]')}>
              {selectable && <td className="px-4 py-4"><input type="checkbox" className="size-4 accent-sky-aqua" checked={selected} onChange={() => toggleRow(id)} aria-label={`Select row ${index + 1}`} /></td>}
              {columns.map((column) => <td key={column.key} className={cn('px-4 py-4 align-middle', column.className)}>{column.render ? column.render(row, index) : String((row as Record<string, unknown>)[column.key] ?? '—')}</td>)}
            </tr>
          })}
        </tbody>
      </table>
    </div>
    {selectable && <div className="flex items-center gap-2 border-t border-glass-line px-4 py-3 text-xs text-mist"><Check size={14} className="text-sky-aqua" aria-hidden="true" />{selectedRowIds.length} selected</div>}
  </div>
}
