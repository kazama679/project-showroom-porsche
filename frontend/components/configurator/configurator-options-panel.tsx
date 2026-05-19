'use client'

import Image from 'next/image'
import { ChevronRight, Info, Search } from 'lucide-react'
import {
  ConfigSection,
  ConfigOption,
  ConfigSubGroup,
  getSubGroupPriceLabel,
  getOptionPriceLabel,
} from '@/lib/configurator-data'

type ConfiguratorOptionsPanelProps = {
  sections: ConfigSection[]
  selections: Record<string, string>
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
        selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-[#d2d2d2]'
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col text-left rounded-lg border bg-white overflow-hidden transition-all h-full ${
        selected
          ? 'border-black ring-1 ring-black shadow-sm'
          : 'border-[#e5e5e5] hover:border-[#b0b0b0] hover:shadow-sm'
      }`}
    >
      <div className="relative aspect-[4/3] w-full bg-[#eef1f5]">
        <Image src={option.image!} alt={option.name} fill unoptimized className="object-cover" />
        <span
          className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
          aria-hidden="true"
        >
          <Info size={14} className="text-[#555]" strokeWidth={1.5} />
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="text-[13px] font-light text-[#181818] leading-snug line-clamp-3 min-h-[2.75rem]">
          {option.name}
        </p>
        {option.description && (
          <p className="text-[11px] text-[#888] font-light line-clamp-2 -mt-1">{option.description}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <span
            className={`text-[13px] font-light leading-none ${
              option.isStandard ? 'text-[#888]' : 'text-[#181818]'
            }`}
          >
            {getOptionPriceLabel(option)}
          </span>
          <span
            className={`w-[18px] h-[18px] rounded-[3px] border flex-shrink-0 flex items-center justify-center ${
              selected ? 'bg-black border-black' : 'border-[#999] bg-white'
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
  onSelectOption,
}: {
  subGroup: ConfigSubGroup
  section: ConfigSection
  selections: Record<string, string>
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
}) {
  const selectedId = selections[subGroup.id]
  const isColor = isColorSubGroup(section, subGroup)

  if (isColor) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-light text-[#181818]">{subGroup.title}</h3>
          <span className="text-sm text-[#666] font-light">{getSubGroupPriceLabel(subGroup)}</span>
          <button
            type="button"
            aria-label={`Info about ${subGroup.title}`}
            className="text-[#666] hover:text-black"
          >
            <Info size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {subGroup.options.map((option) => (
            <ColorSwatch
              key={option.id}
              option={option}
              selected={selectedId === option.id}
              onSelect={() => onSelectOption(section.id, option.id, subGroup.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-light text-[#181818]">{subGroup.title}</h3>
        <span className="text-sm text-[#666] font-light">{getSubGroupPriceLabel(subGroup)}</span>
        <button
          type="button"
          aria-label={`Info about ${subGroup.title}`}
          className="text-[#666] hover:text-black"
        >
          <Info size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {subGroup.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            onSelect={() => onSelectOption(section.id, option.id, subGroup.id)}
          />
        ))}
      </div>
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
      <div className="mb-6 p-4 bg-[#f5f5f5] rounded-xl flex items-center gap-3">
        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
          <Image
            src={modelImageUrl || DEFAULT_RECOMMENDATION_IMAGE}
            alt="Recommendation"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-light text-[#181818]">Discover configuration recommendations</p>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-light text-[#3860BE] mt-1 hover:underline"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm các tùy chọn thiết bị"
          aria-label="Tìm kiếm các tùy chọn thiết bị"
          id="configurator-option-search"
          className="w-full pl-10 pr-4 py-3 border border-[#d2d2d2] rounded-lg text-sm font-light focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 space-y-1">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false

          return (
            <div key={section.id} className="border-b border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => onToggleSection(section.id)}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-[#fafafa] px-1 transition-colors"
              >
                <h2 className="text-base font-light text-[#181818]">{section.title}</h2>
                <span className="text-xl text-[#999] font-light leading-none">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="pb-4 px-1">
                  {section.subGroups.map((subGroup) => (
                    <SubGroupOptions
                      key={subGroup.id}
                      subGroup={subGroup}
                      section={section}
                      selections={selections}
                      onSelectOption={onSelectOption}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filteredSections.length === 0 && (
          <p className="text-sm text-[#666] font-light py-8 text-center">
            No equipment options match your search.
          </p>
        )}
      </div>
    </div>
  )
}
