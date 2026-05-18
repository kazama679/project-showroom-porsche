'use client'

import Image from 'next/image'
import { ChevronRight, Info, Search } from 'lucide-react'
import {
  ConfigSection,
  ConfigOption,
  ConfigSubGroup,
  getSubGroupPriceLabel,
  getOptionPriceLabel,
  formatPrice,
} from '@/lib/configurator-data'

type ConfiguratorOptionsPanelProps = {
  sections: ConfigSection[]
  selections: Record<string, string>
  expandedSections: Record<string, boolean>
  searchQuery: string
  onSearchChange: (query: string) => void
  onToggleSection: (sectionId: string) => void
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
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
      className={`relative w-10 h-10 rounded-md border-2 transition-all hover:scale-105 ${
        selected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-[#d2d2d2]'
      }`}
      style={{ backgroundColor: option.color ?? '#ccc' }}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center">
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
  variant = 'default',
}: {
  option: ConfigOption
  selected: boolean
  onSelect: () => void
  variant?: 'default' | 'package'
}) {
  const isPackage = variant === 'package'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border transition-all overflow-hidden ${
        selected
          ? 'border-black shadow-md'
          : 'border-[#e5e5e5] hover:border-[#999] hover:shadow-sm'
      } ${isPackage ? 'bg-white' : ''}`}
    >
      {option.image && (
        <div className="relative h-32 bg-[#f0f4f8]">
          <Image src={option.image} alt={option.name} fill unoptimized className="object-cover" />
          <span className="absolute top-3 left-3 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
            <Info size={12} className="text-[#666]" />
          </span>
        </div>
      )}
      <div className={`p-4 ${!option.image ? 'flex items-center justify-between gap-3' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-light text-[#181818] leading-snug">{option.name}</p>
          {option.description && (
            <p className="text-xs text-[#666] font-light mt-1 line-clamp-2">{option.description}</p>
          )}
        </div>
        <div className={`flex items-center gap-3 ${option.image ? 'mt-3 justify-between' : ''}`}>
          <span
            className={`text-sm font-light ${
              option.isStandard ? 'text-[#666]' : 'text-[#181818]'
            }`}
          >
            {getOptionPriceLabel(option)}
          </span>
          <span
            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
              selected ? 'bg-black border-black' : 'border-[#999]'
            }`}
          >
            {selected && (
              <svg viewBox="0 0 12 12" className="w-3 h-3" aria-hidden="true">
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
  sectionId,
  selections,
  onSelectOption,
  variant,
}: {
  subGroup: ConfigSubGroup
  sectionId: string
  selections: Record<string, string>
  onSelectOption: (sectionId: string, optionId: string, subGroupId?: string) => void
  variant?: 'color' | 'card' | 'list'
}) {
  const selectionKey =
    sectionId === 'seats' && subGroup.id === 'more-seat-options'
      ? 'rear-seats'
      : sectionId
  const selectedId = selections[selectionKey]

  if (variant === 'color') {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-light text-[#181818]">{subGroup.title}</h3>
          <span className="text-sm text-[#666] font-light">{getSubGroupPriceLabel(subGroup)}</span>
          <button type="button" aria-label={`Info about ${subGroup.title}`} className="text-[#666] hover:text-black">
            <Info size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {subGroup.options.map((option) => (
            <ColorSwatch
              key={option.id}
              option={option}
              selected={selectedId === option.id}
              onSelect={() => onSelectOption(sectionId, option.id, subGroup.id)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="mb-6 space-y-3">
        {subGroup.title !== 'Packages' && (
          <h3 className="text-sm font-light text-[#181818]">{subGroup.title}</h3>
        )}
        {subGroup.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedId === option.id}
            onSelect={() => onSelectOption(sectionId, option.id, subGroup.id)}
            variant={sectionId === 'packages' ? 'package' : 'default'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-light text-[#181818] mb-3">{subGroup.title}</h3>
      <div className="space-y-2">
        {subGroup.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectOption(sectionId, option.id, subGroup.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
              selectedId === option.id
                ? 'border-black bg-[#fafafa]'
                : 'border-[#e5e5e5] hover:border-[#999]'
            }`}
          >
            <span className="text-sm font-light">{option.name}</span>
            <span className="text-sm font-light text-[#666]">{getOptionPriceLabel(option)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function getSectionVariant(sectionId: string): 'color' | 'card' | 'list' {
  if (sectionId === 'exterior-colors' || sectionId === 'interior-material') return 'color'
  if (sectionId === 'packages' || sectionId === 'seats' || sectionId === 'wheels') return 'card'
  return 'list'
}

export function ConfiguratorOptionsPanel({
  sections,
  selections,
  expandedSections,
  searchQuery,
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
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
            alt="Recommendation"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-light text-[#181818]">Discover configuration recommendations</p>
          <button type="button" className="flex items-center gap-1 text-sm font-light text-[#3860BE] mt-1 hover:underline">
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
          placeholder="Search equipment options"
          aria-label="Search equipment options"
          className="w-full pl-10 pr-4 py-3 border border-[#d2d2d2] rounded-lg text-sm font-light focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 space-y-1">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections[section.id] !== false
          const variant = getSectionVariant(section.id)

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
                      sectionId={section.id}
                      selections={selections}
                      onSelectOption={onSelectOption}
                      variant={variant}
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

        {/* Additional collapsed category placeholders like Porsche */}
        {['Exterior', 'Interior', 'Technology', 'Vehicle accessories', 'Delivery Experience'].map(
          (title) => (
            <div key={title} className="border-b border-[#e5e5e5]">
              <button
                type="button"
                className="w-full flex items-center justify-between py-4 text-left hover:bg-[#fafafa] px-1 transition-colors"
              >
                <h2 className="text-base font-light text-[#181818]">{title}</h2>
                <span className="text-xl text-[#999] font-light">+</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
