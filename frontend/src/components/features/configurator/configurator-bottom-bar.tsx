'use client'

import { Search } from 'lucide-react'
import { formatPrice, MSRP_DISCLAIMER } from '@/utils/configurator-data'

type ConfiguratorBottomBarProps = {
  totalPrice: number
  modelName: string
  onSelectDealer: () => void
  onShowSearch: () => void
  onTestDrive?: () => void
}

export function ConfiguratorBottomBar({
  totalPrice,
  modelName,
  onSelectDealer,
  onShowSearch,
  onTestDrive,
}: ConfiguratorBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden md:block min-w-[180px]">
            <p className="text-2xl font-light text-near-black">{formatPrice(totalPrice)}</p>
            <p className="text-[10px] text-neutral-400 font-light line-clamp-1 max-w-[220px]">
              {MSRP_DISCLAIMER.slice(0, 60)}...
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-3 px-5 py-2.5 bg-gray-100 rounded-full hover:bg-neutral-200 transition-colors min-w-0"
          >
            <div className="w-8 h-5 bg-[#ddd] rounded-sm flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-light text-near-black truncate">{modelName}</span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={onSelectDealer}
              className="px-6 md:px-8 py-3 bg-black text-white text-sm font-light rounded-full hover:bg-dark-surface transition-colors whitespace-nowrap"
            >
              Select a dealer
            </button>
            <button
              type="button"
              onClick={onTestDrive}
              className="px-6 md:px-8 py-3 bg-brand-red text-white text-sm font-light rounded-full hover:bg-red-800 transition-colors whitespace-nowrap"
            >
              Đăng ký lái thử
            </button>
            <button
              type="button"
              onClick={onShowSearch}
              aria-label="Show search"
              className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-neutral-200 transition-colors flex-shrink-0"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="md:hidden text-xl font-light text-near-black mt-2">{formatPrice(totalPrice)}</p>
      </div>
    </div>
  )
}
