'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight, Info, Search } from 'lucide-react'
import {
  ConfigSection,
  ConfigOption,
  ConfigSubGroup,
  getSubGroupPriceLabel,
  getOptionPriceLabel,
} from '@/utils/configurator-data'

type ConfiguratorOptionsPanelProps = {
  sections: ConfigSection[]
  selections: Record<string, string[]>
  expandedSections: Record<string, boolean>
  searchQuery: string
  modelImageUrl?: string
  onSearchChange: (query: string) => void
  onToggleSection: (sectionId: string) => void
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
}

function isColorSubGroup(section: ConfigSection, subGroup: ConfigSubGroup): boolean {
  const combined = `${section.title} ${subGroup.title}`.toLowerCase()
  return (
    combined.includes('sơn') ||
    combined.includes('màu') ||
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
      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-md border-2 overflow-hidden transition-all hover:scale-105 ${
        selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-light-gray-surface'
      }`}
      style={!option.image ? { backgroundColor: option.color ?? '#ccc' } : undefined}
    >
      {option.image && (
        <Image src={option.image} alt={option.name} fill unoptimized className="object-cover" />
      )}
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
          <svg viewBox="0 0 12 12" className="w-4 h-4" aria-hidden="true">
            <path
              d="M2 6l3 3 5-5"
              fill="none"
              stroke={option.color === '#FFFFFF' || option.color === '#D1D5DB' ? '#000' : '#fff'}
              strokeWidth="1.5"
            />
          </svg>
        </span>
      )}
    </button>
  )
}

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: ConfigOption
  selected: boolean
  onSelect: () => void
}) {
  const [aspect, setAspect] = useState<number | null>(null)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col text-left rounded-lg border bg-white overflow-hidden transition-all h-full ${
        selected
          ? 'border-black ring-1 ring-black shadow-sm'
          : 'border-gray-200 hover:border-[#b0b0b0] hover:shadow-sm'
      }`}
    >
      <div className="relative aspect-[4/3] w-full bg-white border-b border-neutral-100">
        <Image 
          src={option.image || 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp'} 
          alt={option.name} 
          fill 
          unoptimized 
          className={aspect && aspect > 1.35 ? "object-cover" : "object-contain p-2"} 
          onLoad={(e) => {
            const img = e.target as HTMLImageElement
            if (img.naturalWidth && img.naturalHeight) {
              setAspect(img.naturalWidth / img.naturalHeight)
            }
          }}
        />
        <span
          className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <Info size={14} className="text-neutral-600" strokeWidth={1.5} />
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="text-[13px] font-light text-near-black leading-snug line-clamp-3 min-h-[2.75rem]">
          {option.name}
        </p>
        {option.description && (
          <p className="text-[11px] text-neutral-500 font-light line-clamp-2 -mt-1">{option.description}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span
            className={`text-[13px] font-light leading-none ${
              option.isStandard ? 'text-neutral-500' : 'text-near-black'
            }`}
          >
            {getOptionPriceLabel(option)}
          </span>
          <span
            className={`w-[18px] h-[18px] rounded-[3px] border flex-shrink-0 flex items-center justify-center ${
              selected ? 'bg-black border-black' : 'border-neutral-400 bg-white'
            }`}
            aria-hidden="true"
          >
            {selected && (
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
                <path d="M2 6l3 3 5-5" fill="none" stroke="#fff" strokeWidth="1.5" />
              </svg>
            )}
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
}: {
  subGroup: ConfigSubGroup
  section: ConfigSection
  selections: Record<string, string[]>
  isExpanded: boolean
  onToggle: () => void
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
}) {
  const selectedIds = selections[subGroup.id] ?? []
  const isColor = isColorSubGroup(section, subGroup)

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-near-black">{subGroup.title}</h3>
          <span className="text-xs text-dark-gray font-light">{getSubGroupPriceLabel(subGroup)}</span>
        </div>
        <span className="text-lg text-neutral-400 font-light leading-none mr-1">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="pt-2 pb-4">
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
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const DEFAULT_RECOMMENDATION_IMAGE =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png'

export function ConfiguratorOptionsPanel({
  sections,
  selections,
  expandedSections,
  searchQuery,
  modelImageUrl,
  onSearchChange,
  onToggleSection,
  onSelectOption,
}: ConfiguratorOptionsPanelProps) {
  const [expandedSubGroups, setExpandedSubGroups] = useState<Record<string, boolean>>({})

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

  return (
    <div className="flex flex-col h-full min-h-0">
      
      <div className="relative mb-7">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-gray" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm các tùy chọn thiết bị"
          aria-label="Tìm kiếm các tùy chọn thiết bị"
          id="configurator-option-search"
          className="w-full pl-10 pr-4 py-3 border border-light-gray-surface rounded-lg text-sm font-light focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 space-y-1">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false

          return (
            <div key={section.id} className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => onToggleSection(section.id)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-neutral-50 px-1 transition-colors"
              >
                <h2 className="text-base font-light text-near-black">{section.title}</h2>
                <span className="text-xl text-neutral-400 font-light leading-none">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="pb-4 px-1 divide-y divide-neutral-100">
                  {section.subGroups.map((subGroup) => (
                    <SubGroupOptions
                      key={subGroup.id}
                      subGroup={subGroup}
                      section={section}
                      selections={selections}
                      isExpanded={expandedSubGroups[subGroup.id] !== false}
                      onToggle={() => handleToggleSubGroup(subGroup.id)}
                      onSelectOption={onSelectOption}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredSections.length === 0 && (
          <p className="text-sm text-dark-gray font-light py-8 text-center">
            No equipment options match your search.
          </p>
        )}
      </div>
    </div>
  )
}
