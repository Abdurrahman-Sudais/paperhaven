import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cx } from '../../lib/format'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: 'left' | 'right'
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  caption: string
  sort?: { key: string; dir: 'asc' | 'desc' }
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  selectedKey?: string
  empty?: ReactNode
}

export function DataTable<T>({ rows, columns, rowKey, caption, sort, onSort, onRowClick, selectedKey, empty }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-paper-2/70 text-left">
            {columns.map((c) => {
              const active = sort?.key === c.key
              const ariaSort = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined
              return (
                <th key={c.key} scope="col" aria-sort={ariaSort}
                  className={cx('px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate', c.align === 'right' && 'text-right', c.className)}>
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(c.key)}
                      className={cx('inline-flex items-center gap-1 uppercase hover:text-ink', active && 'text-ink')}>
                      {c.header}
                      {active ? (sort!.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-50" />}
                    </button>
                  ) : c.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-slate">{empty ?? 'No rows.'}</td></tr>
          )}
          {rows.map((r) => {
            const k = rowKey(r)
            return (
              <tr key={k}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cx('border-b border-line/70 last:border-0', onRowClick && 'cursor-pointer hover:bg-paper-2/60', selectedKey === k && 'bg-forest-soft/60')}>
                {columns.map((c) => (
                  <td key={c.key} className={cx('px-3 py-2.5 align-top tabular', c.align === 'right' && 'text-right', c.className)}>{c.cell(r)}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
