'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  width?: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyState?: React.ReactNode
  pagination?: {
    pageSize: number
    currentPage: number
    onPageChange: (page: number) => void
    total: number
  }
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  loading,
  emptyState,
  pagination,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDesc, setSortDesc] = useState(false)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(false)
    }
  }

  if (loading) {
    return (
      <div className="border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#D2D2D2] dark:border-[#303030] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-ferrari-label text-[#666666] dark:text-[#D2D2D2]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr
                key={i}
                className="border-b border-[#D2D2D2] dark:border-[#303030]"
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-[#E5E5E5] dark:bg-[#404040] rounded w-24 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data.length) {
    return (
      emptyState || (
        <div className="border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-8 text-center">
          <p className="text-[#8F8F8F] dark:text-[#D2D2D2]">No data available</p>
        </div>
      )
    )
  }

  const paginatedData = pagination
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
      )
    : data

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1

  return (
    <div className="space-y-4">
      <div className="border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#D2D2D2] dark:border-[#303030] bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-ferrari-label text-[#666666] dark:text-[#D2D2D2] ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  }`}
                  onClick={() =>
                    col.sortable && handleSort(String(col.key))
                  }
                  style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                >
                  <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col gap-0.5">
                        <ChevronUp
                          size={12}
                          className={
                            sortKey === col.key && !sortDesc
                              ? 'text-[#DA291C]'
                              : 'text-[#D2D2D2] dark:text-[#303030]'
                          }
                        />
                        <ChevronDown
                          size={12}
                          className={
                            sortKey === col.key && sortDesc
                              ? 'text-[#DA291C]'
                              : 'text-[#D2D2D2] dark:text-[#303030]'
                          }
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="border-b border-[#D2D2D2] dark:border-[#303030] hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] transition-colors"
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-sm text-[#181818] dark:text-white ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    }`}
                  >
                    {col.render
                      ? col.render((row as any)[col.key as any], row)
                      : (row as any)[col.key as any]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-3 border-t border-[#D2D2D2] dark:border-[#303030]">
          <div className="text-sm text-[#8F8F8F] dark:text-[#D2D2D2]">
            Page {pagination.currentPage} of {totalPages} · {pagination.total}{' '}
            items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
              }
              disabled={pagination.currentPage === 1}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                pagination.onPageChange(
                  Math.min(totalPages, pagination.currentPage + 1)
                )
              }
              disabled={pagination.currentPage === totalPages}
              className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
