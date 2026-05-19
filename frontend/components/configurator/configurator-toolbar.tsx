'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  Heart,
  Share2,
  Info,
  Calculator,
  Search,
} from 'lucide-react'
import { formatPrice } from '@/lib/configurator-data'
import { cn } from '@/lib/utils'

export type ConfiguratorToolbarProps = {
  modelId: number
  modelName: string
  totalPrice: number
  saved: boolean
  onToggleSave: () => void
  onSummary: () => void
  onSelectDealer: () => void
  onSearch?: () => void
  className?: string
}

/** Rough monthly estimate (display only) */
function estimateMonthly(total: number): number {
  if (total <= 0) return 0
  return Math.round(total / 83)
}

export function ConfiguratorToolbar({
  modelId,
  modelName,
  totalPrice,
  saved,
  onToggleSave,
  onSummary,
  onSelectDealer,
  onSearch,
  className,
}: ConfiguratorToolbarProps) {
  const monthly = estimateMonthly(totalPrice)

  return (
    <div
      className={cn(
        'sticky top-0 z-40 bg-white border-b border-[#e5e5e5]',
        className
      )}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-2.5 md:py-3 flex items-center justify-between gap-3 md:gap-4">
        {/* Left: back + save + share */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink">
          <Link
            href={`/models/${modelId}`}
            className="p-1.5 hover:bg-[#f5f5f5] rounded-full transition-colors flex-shrink-0"
            aria-label="Quay lại"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={onToggleSave}
            className="flex items-center gap-1.5 text-sm font-light hover:opacity-70 whitespace-nowrap"
          >
            <Heart size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{saved ? 'Đã lưu' : 'Cứu'}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-light hover:opacity-70 whitespace-nowrap hidden md:flex"
          >
            <Share2 size={16} strokeWidth={1.5} />
            <span>Tạo mã Porsche</span>
          </button>
        </div>

        {/* Center-right: pricing (hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-end min-w-0">
          <div className="text-right min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              <Calculator size={14} className="text-[#666] flex-shrink-0" />
              <span className="text-sm font-light text-[#181818] whitespace-nowrap">
                {formatPrice(monthly)}/tháng
              </span>
              <button type="button" aria-label="Thông tin thanh toán" className="text-[#999] hover:text-black">
                <Info size={14} strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[10px] text-[#999] font-light truncate max-w-[200px]">
              Tính toán khoản thanh toán hàng tháng
            </p>
          </div>

          <div className="text-right min-w-0 border-l border-[#e5e5e5] pl-6 xl:pl-8">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-sm md:text-base font-light text-[#181818] whitespace-nowrap">
                {formatPrice(totalPrice)}
              </span>
              <button type="button" aria-label="Thông tin giá" className="text-[#999] hover:text-black">
                <Info size={14} strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[10px] text-[#999] font-light truncate max-w-[180px]">
              {modelName}
            </p>
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onSummary}
            className="px-3 md:px-5 py-2 text-sm font-light border border-[#d2d2d2] rounded-full hover:border-black transition-colors whitespace-nowrap"
          >
            Bản tóm tắt
          </button>
          <button
            type="button"
            onClick={onSelectDealer}
            className="px-3 md:px-5 py-2 text-sm font-light bg-black text-white rounded-full hover:bg-[#303030] transition-colors whitespace-nowrap"
          >
            Chọn đại lý
          </button>
          <button
            type="button"
            onClick={onSearch}
            aria-label="Tìm kiếm"
            className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-[#ebebeb] transition-colors flex-shrink-0"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Mobile price strip */}
      <div className="lg:hidden border-t border-[#f0f0f0] px-4 py-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-light text-[#181818]">{formatPrice(totalPrice)}</p>
          <p className="text-[10px] text-[#999] font-light">
            ~{formatPrice(monthly)}/tháng
          </p>
        </div>
        <p className="text-xs text-[#666] font-light truncate max-w-[50%]">{modelName}</p>
      </div>
    </div>
  )
}
