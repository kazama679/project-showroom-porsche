'use client'

import { Search } from 'lucide-react'
import { formatPrice, MSRP_DISCLAIMER } from '@/lib/configurator-data'

type ConfiguratorBottomBarProps = {
  totalPrice: number
  modelName: string
  onSelectDealer: () => void
  onShowSearch: () => void
}

export function ConfiguratorBottomBar({
  totalPrice,
  modelName,
  onSelectDealer,
  onShowSearch,
}: ConfiguratorBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e5e5] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden md:block min-w-[180px]">
            <p className="text-2xl font-light text-[#181818]">{formatPrice(totalPrice)}</p>
            <p className="text-[10px] text-[#999] font-light line-clamp-1 max-w-[220px]">
              {MSRP_DISCLAIMER.slice(0, 60)}...
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-3 px-5 py-2.5 bg-[#f5f5f5] rounded-full hover:bg-[#ebebeb] transition-colors min-w-0"
          >
            <div className="w-8 h-5 bg-[#ddd] rounded-sm flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-light text-[#181818] truncate">{modelName}</span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={onSelectDealer}
              className="px-6 md:px-8 py-3 bg-black text-white text-sm font-light rounded-full hover:bg-[#303030] transition-colors whitespace-nowrap"
            >
              Select a dealer
            </button>
            <button
              type="button"
              onClick={onShowSearch}
              aria-label="Show search"
              className="w-11 h-11 rounded-full bg-[#f5f5f5] flex items-center justify-center hover:bg-[#ebebeb] transition-colors flex-shrink-0"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="md:hidden text-xl font-light text-[#181818] mt-2">{formatPrice(totalPrice)}</p>
      </div>
    </div>
  )
}
