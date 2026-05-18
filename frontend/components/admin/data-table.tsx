'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

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
    serverSide?: boolean
    onPageSizeChange?: (pageSize: number) => void
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
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDesc, setSortDesc] = useState(false)

  // Page input state for quick pagination jumps
  const [pageInput, setPageInput] = useState(pagination?.currentPage.toString() || '1')

  useEffect(() => {
    if (pagination?.currentPage) {
      setPageInput(pagination.currentPage.toString())
    }
  }, [pagination?.currentPage])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc)
    } else {
      setSortKey(key)
      setSortDesc(false)
    }
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1

  const handlePageInputChange = (val: string) => {
    setPageInput(val)
  }

  const handlePageInputSubmit = () => {
    if (!pagination) return
    let page = parseInt(pageInput)
    if (isNaN(page) || page < 1) {
      page = 1
    } else if (page > totalPages) {
      page = totalPages
    }
    setPageInput(page.toString())
    pagination.onPageChange(page)
  }

  const isServerSide = pagination
    ? (pagination.serverSide ?? (data.length < pagination.total))
    : false

  const paginatedData = (pagination && !isServerSide)
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
      )
    : data

  return (
    <div className="space-y-4">
      {/* Outer container with exact original styling */}
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
                  <div className={`flex items-center gap-2 ${
                    col.align === 'center'
                      ? 'justify-center'
                      : col.align === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                  }`}>
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
            {loading ? (
              // Renders skeleton rows using exact original padding and styling to maintain layout height
              [...Array(pagination?.pageSize || 10)].map((_, i) => (
                <tr
                  key={`skeleton-${i}`}
                  className="border-b border-[#D2D2D2] dark:border-[#303030] last:border-none"
                >
                  {columns.map((col, idx) => (
                    <td key={`skeleton-cell-${idx}`} className="px-4 py-3">
                      <div className="h-4 bg-[#E5E5E5] dark:bg-[#404040] rounded w-24 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[#8F8F8F] dark:text-[#D2D2D2]"
                >
                  {emptyState || (isVi ? 'Không có dữ liệu' : 'No data available')}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-[#D2D2D2] dark:border-[#303030] last:border-none hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] transition-colors"
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (totalPages > 1 || pagination.total > 5) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-[#D2D2D2] dark:border-[#303030]">
          {/* Quick Page Jump Input and Page Counter with beautiful layout */}
          <div className="flex items-center gap-4 text-sm text-[#8F8F8F] dark:text-[#D2D2D2]">
            <div className="flex items-center gap-1.5">
              <span>{isVi ? 'Trang' : 'Page'}</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                onBlur={handlePageInputSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePageInputSubmit()
                  }
                }}
                disabled={loading}
                className="w-14 px-2 py-0.5 text-center text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span>{isVi ? 'trên' : 'of'} {totalPages}</span>
            </div>
            <span>· {pagination.total} {isVi ? 'mục' : 'items'}</span>
          </div>

          {/* Right section: Page Size Selector and Navigation Buttons */}
          <div className="flex items-center gap-4">
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-1.5 text-sm text-[#8F8F8F] dark:text-[#D2D2D2]">
                <span>{isVi ? 'Hiển thị' : 'Show'}</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value)
                    pagination.onPageSizeChange?.(size)
                  }}
                  disabled={loading}
                  className="px-1.5 py-0.5 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors disabled:opacity-50"
                >
                  {[5, 10, 20, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>{isVi ? 'mục' : 'items'}</span>
              </div>
            )}

            {/* Navigation Buttons with exact original hover & borderless styling */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage === 1 || loading}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#181818] dark:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(totalPages, pagination.currentPage + 1)
                  )
                }
                disabled={pagination.currentPage === totalPages || loading}
                className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#181818] dark:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
