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
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="mx-auto max-w-[1760px] px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden min-w-[180px] md:block">
            <p className="text-2xl font-light text-near-black">{formatPrice(totalPrice)}</p>
            <p className="line-clamp-1 max-w-[220px] text-[10px] font-light text-neutral-400">
              {MSRP_DISCLAIMER.slice(0, 60)}...
            </p>
          </div>

          <button
            type="button"
            className="flex min-w-0 items-center gap-3 rounded-full bg-gray-100 px-5 py-2.5 transition-colors hover:bg-neutral-200"
          >
            <div className="h-5 w-8 flex-shrink-0 rounded-sm bg-[#ddd]" aria-hidden="true" />
            <span className="truncate text-sm font-light text-near-black">{modelName}</span>
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={onSelectDealer}
              className="whitespace-nowrap rounded-full bg-black px-6 py-3 text-sm font-light text-white transition-colors hover:bg-dark-surface md:px-8"
            >
              Select a dealer
            </button>
            <button
              type="button"
              onClick={onTestDrive}
              className="hidden whitespace-nowrap rounded-full bg-neutral-100 px-6 py-3 text-sm font-light text-near-black transition-colors hover:bg-neutral-200 md:inline-flex md:px-8"
            >
              Test drive
            </button>
            <button
              type="button"
              onClick={onShowSearch}
              aria-label="Show search"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-neutral-200"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-xl font-light text-near-black md:hidden">{formatPrice(totalPrice)}</p>
      </div>
    </div>
  )
}
