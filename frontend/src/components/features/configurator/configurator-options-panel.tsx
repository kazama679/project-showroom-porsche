'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, GripVertical, Info, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import {
  ConfigOption,
  ConfigSection,
  ConfigSubGroup,
  getOptionPriceLabel,
  getSubGroupPriceLabel,
} from '@/utils/configurator-data'

type ConfiguratorOptionsPanelProps = {
  sections: ConfigSection[]
  selections: Record<string, string[]>
  expandedSections: Record<string, boolean>
  searchQuery: string
  modelName: string
  modelImageUrl?: string
  onSearchChange: (query: string) => void
  onToggleSection: (sectionId: string) => void
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
}

function isColorSubGroup(section: ConfigSection, subGroup: ConfigSubGroup): boolean {
  const combined = `${section.title} ${subGroup.title}`.toLowerCase()
  return (
    combined.includes('son') ||
    combined.includes('mau') ||
    combined.includes('color') ||
    combined.includes('paint')
  )
}

function ColorSwatch({
  option,
  selected,
  onSelect,
}: {
  option: ConfigOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-label={option.name}
      title={option.name}
      onClick={onSelect}
      className={`relative h-12 w-12 overflow-hidden rounded-[3px] border transition-all hover:border-black sm:h-14 sm:w-14 ${
        selected ? 'border-black ring-1 ring-black ring-offset-2' : 'border-neutral-300'
      }`}
      style={!option.image ? { backgroundColor: option.color ?? '#ccc' } : undefined}
    >
      {option.image && (
        <Image src={option.image} alt={option.name} fill unoptimized className="object-cover" />
      )}
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Check
            className="h-4 w-4"
            strokeWidth={1.8}
            color={option.color === '#FFFFFF' || option.color === '#D1D5DB' ? '#000' : '#fff'}
          />
        </span>
      )}
    </button>
  )
}

function OptionCard({
  option,
  selected,
  onSelect,
  locale,
}: {
  option: ConfigOption
  selected: boolean
  onSelect: () => void
  locale?: string
}) {
  const [aspect, setAspect] = useState<number | null>(null)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-full flex-col overflow-hidden rounded-[6px] border bg-white text-left transition-all ${
        selected ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-[#9d9d9d]'
      }`}
    >
      <div className="relative aspect-[4/3] w-full border-b border-neutral-100 bg-[#f6f6f6]">
        <Image
          src={option.image || 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp'}
          alt={option.name}
          fill
          unoptimized
          className={aspect && aspect > 1.35 ? 'object-cover' : 'object-contain p-3'}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement
            if (img.naturalWidth && img.naturalHeight) {
              setAspect(img.naturalWidth / img.naturalHeight)
            }
          }}
        />
        <span
          className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
          aria-hidden="true"
        >
          <Info size={14} className="text-neutral-600" strokeWidth={1.5} />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-3 min-h-[2.75rem] text-[13px] font-light leading-snug text-near-black">
          {option.name}
        </p>
        {option.description && (
          <p className="-mt-1 line-clamp-2 text-[11px] font-light text-neutral-500">
            {option.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span
            className={`text-[13px] font-light leading-none ${
              option.isStandard ? 'text-neutral-500' : 'text-near-black'
            }`}
          >
            {getOptionPriceLabel(option, locale)}
          </span>
          <span
            className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[3px] border ${
              selected ? 'border-black bg-black' : 'border-neutral-400 bg-white'
            }`}
            aria-hidden="true"
          >
            {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={1.8} />}
          </span>
        </div>
      </div>
    </button>
  )
}

function SubGroupOptions({
  subGroup,
  section,
  selections,
  isExpanded,
  onToggle,
  onSelectOption,
  locale,
}: {
  subGroup: ConfigSubGroup
  section: ConfigSection
  selections: Record<string, string[]>
  isExpanded: boolean
  onToggle: () => void
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
  locale?: string
}) {
  const selectedIds = selections[subGroup.id] ?? []
  const isColor = isColorSubGroup(section, subGroup)

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-neutral-50"
      >
        <div className="min-w-0 pr-3">
          <h3 className="truncate text-sm font-medium text-near-black">{subGroup.title}</h3>
          <span className="text-xs font-light text-dark-gray">{getSubGroupPriceLabel(subGroup, locale)}</span>
        </div>
        <span className="mr-1 text-lg font-light leading-none text-neutral-400">
          {isExpanded ? '-' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="pb-5 pt-1">
          {isColor ? (
            <div className="flex flex-wrap gap-2.5">
              {subGroup.options.map((option) => (
                <ColorSwatch
                  key={option.id}
                  option={option}
                  selected={selectedIds.includes(option.id)}
                  onSelect={() => onSelectOption(section.id, option.id, subGroup.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {subGroup.options.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selectedIds.includes(option.id)}
                  onSelect={() => onSelectOption(section.id, option.id, subGroup.id)}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ConfiguratorOptionsPanel({
  sections,
  selections,
  expandedSections,
  searchQuery,
  modelName,
  onSearchChange,
  onToggleSection,
  onSelectOption,
}: ConfiguratorOptionsPanelProps) {
  const locale = useLocale()
  const t = useTranslations('configurator')
  const [expandedSubGroups, setExpandedSubGroups] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startY: number; startScrollTop: number } | null>(null)
  const [scrollHandle, setScrollHandle] = useState({ top: 0, height: 44, visible: false })

  const handleToggleSubGroup = (subGroupId: string) => {
    setExpandedSubGroups((prev) => ({
      ...prev,
      [subGroupId]: prev[subGroupId] === false,
    }))
  }

  const filteredSections = sections.filter((section) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      section.title.toLowerCase().includes(q) ||
      section.subGroups.some(
        (sg) =>
          sg.title.toLowerCase().includes(q) ||
          sg.options.some((o) => o.name.toLowerCase().includes(q))
      )
    )
  })

  const updateScrollHandle = () => {
    const scrollEl = scrollRef.current
    const trackEl = trackRef.current
    if (!scrollEl || !trackEl) return

    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight
    const trackHeight = trackEl.clientHeight
    if (maxScroll <= 0 || trackHeight <= 0) {
      setScrollHandle((prev) => ({ ...prev, top: 0, visible: false }))
      return
    }

    const height = Math.max(44, (scrollEl.clientHeight / scrollEl.scrollHeight) * trackHeight)
    const maxTop = Math.max(0, trackHeight - height)
    const top = (scrollEl.scrollTop / maxScroll) * maxTop
    setScrollHandle({ top, height, visible: true })
  }

  useEffect(() => {
    updateScrollHandle()
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    const resizeObserver = new ResizeObserver(updateScrollHandle)
    resizeObserver.observe(scrollEl)
    resizeObserver.observe(document.body)
    scrollEl.addEventListener('scroll', updateScrollHandle, { passive: true })
    window.addEventListener('resize', updateScrollHandle)

    return () => {
      resizeObserver.disconnect()
      scrollEl.removeEventListener('scroll', updateScrollHandle)
      window.removeEventListener('resize', updateScrollHandle)
    }
  }, [filteredSections.length, expandedSections, expandedSubGroups])

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const scrollEl = scrollRef.current
    const trackEl = trackRef.current
    if (!scrollEl || !trackEl) return

    const rect = trackEl.getBoundingClientRect()
    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight
    const targetRatio = (event.clientY - rect.top - scrollHandle.height / 2) / Math.max(1, rect.height - scrollHandle.height)
    scrollEl.scrollTop = Math.max(0, Math.min(1, targetRatio)) * maxScroll
    updateScrollHandle()
  }

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: scrollEl.scrollTop,
    }
  }

  const handleThumbPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const scrollEl = scrollRef.current
    const trackEl = trackRef.current
    if (!drag || drag.pointerId !== event.pointerId || !scrollEl || !trackEl) return

    const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight
    const maxTop = Math.max(1, trackEl.clientHeight - scrollHandle.height)
    scrollEl.scrollTop = drag.startScrollTop + ((event.clientY - drag.startY) / maxTop) * maxScroll
  }

  const handleThumbPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-neutral-200 pb-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">{t('configure')}</p>
        <h2 className="mt-1 text-2xl font-light text-near-black">{t('yourModel', { model: modelName })}</h2>

        <div className="relative mt-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchEquipment')}
            aria-label={t('searchEquipment')}
            id="configurator-option-search"
            className="w-full rounded-[4px] border border-neutral-300 py-3 pl-10 pr-4 text-sm font-light transition-colors focus:border-black focus:outline-none"
          />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-y-auto pb-32 pr-5">
          {filteredSections.map((section, index) => {
            const isExpanded = expandedSections[section.id] !== false

            return (
              <div key={section.id} className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => onToggleSection(section.id)}
                  className="flex w-full items-center justify-between py-5 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-[11px] text-neutral-400">{String(index + 1).padStart(2, '0')}</p>
                    <h2 className="truncate text-base font-light text-near-black">{section.title}</h2>
                  </div>
                  <span className="text-xl font-light leading-none text-neutral-400">
                    {isExpanded ? '-' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pb-5">
                    {section.subGroups.map((subGroup) => (
                      <SubGroupOptions
                        key={subGroup.id}
                        subGroup={subGroup}
                        section={section}
                        selections={selections}
                        isExpanded={expandedSubGroups[subGroup.id] !== false}
                        onToggle={() => handleToggleSubGroup(subGroup.id)}
                        onSelectOption={onSelectOption}
                        locale={locale}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filteredSections.length === 0 && (
            <p className="py-8 text-center text-sm font-light text-dark-gray">
              {t('noEquipmentMatches')}
            </p>
          )}
        </div>

        <div
          ref={trackRef}
          className={`absolute bottom-24 right-0 top-3 w-5 cursor-pointer rounded-full transition-opacity ${
            scrollHandle.visible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onPointerDown={handleTrackPointerDown}
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 left-2 w-1 rounded-full bg-neutral-200" />
          {scrollHandle.visible && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute left-1/2 flex w-5 -translate-x-1/2 touch-none items-center justify-center rounded-full border border-neutral-400 bg-white text-neutral-700 shadow transition-colors hover:border-black hover:text-black active:cursor-grabbing"
              style={{ top: scrollHandle.top, height: scrollHandle.height }}
              onPointerDown={handleThumbPointerDown}
              onPointerMove={handleThumbPointerMove}
              onPointerUp={handleThumbPointerUp}
              onPointerCancel={handleThumbPointerUp}
            >
              <GripVertical size={14} strokeWidth={1.6} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
