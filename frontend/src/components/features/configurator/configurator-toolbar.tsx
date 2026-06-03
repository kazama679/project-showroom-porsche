'use client'

import { Link } from '@/i18n/navigation';
import {
  ChevronLeft,
  Heart,
  Share2,
  Info,
  Calculator,
  Search,
} from 'lucide-react'
import { formatPrice } from '@/utils/configurator-data'
import { cn } from '@/utils/cn'

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

import { useLocale, useTranslations } from 'next-intl'

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
  const t = useTranslations('configurator')
  const tc = useTranslations('common')
  const locale = useLocale()
  const monthly = estimateMonthly(totalPrice)

  return (
    <div className={cn('sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur', className)}>
      <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex min-w-0 flex-shrink items-center gap-2 md:gap-4">
          <Link
            href={`/models/${modelId}`}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label={tc('back')}
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={onToggleSave}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-light hover:bg-gray-100"
          >
            <Heart size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{saved ? tc('saved') : tc('save')}</span>
          </button>
          <button
            type="button"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-light hover:bg-gray-100 md:flex"
          >
            <Share2 size={16} strokeWidth={1.5} />
            <span>{t('generateCode')}</span>
          </button>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-6 lg:flex xl:gap-8">
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-medium text-near-black">911 Carrera</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">Porsche Code</p>
          </div>
          <div className="text-right min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              <Calculator size={14} className="text-dark-gray flex-shrink-0" />
              <span className="whitespace-nowrap text-sm font-light text-near-black">
                {formatPrice(monthly, locale)}/{tc('month')}
              </span>
              <button type="button" aria-label={t('paymentInfo')} className="text-neutral-400 hover:text-black">
                <Info size={14} strokeWidth={1.5} />
              </button>
            </div>
            <p className="max-w-[200px] truncate text-[10px] font-light text-neutral-400">
              {t('calculateMonthly')}
            </p>
          </div>

          <div className="min-w-0 border-l border-gray-200 pl-6 text-right xl:pl-8">
            <div className="flex items-center justify-end gap-1.5">
              <span className="whitespace-nowrap text-sm font-light text-near-black md:text-base">
                {formatPrice(totalPrice, locale)}
              </span>
              <button type="button" aria-label={t('priceInfo')} className="text-neutral-400 hover:text-black">
                <Info size={14} strokeWidth={1.5} />
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 font-light truncate max-w-[180px]">
              {modelName}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onSummary}
            className="whitespace-nowrap rounded-full border border-neutral-300 px-3 py-2 text-sm font-light transition-colors hover:border-black md:px-5"
          >
            {t('summary')}
          </button>
          <button
            type="button"
            onClick={onSelectDealer}
            className="whitespace-nowrap rounded-full bg-black px-3 py-2 text-sm font-light text-white transition-colors hover:bg-dark-surface md:px-5"
          >
            {t('selectDealer')}
          </button>
          <button
            type="button"
            onClick={onSearch}
            aria-label={tc('search')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-neutral-200"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-2 lg:hidden">
        <div>
          <p className="text-base font-light text-near-black">{formatPrice(totalPrice, locale)}</p>
          <p className="text-[10px] text-neutral-400 font-light">
            ~{formatPrice(monthly, locale)}/{tc('month')}
          </p>
        </div>
        <p className="text-xs text-dark-gray font-light truncate max-w-[50%]">{modelName}</p>
      </div>
    </div>
  )
}
