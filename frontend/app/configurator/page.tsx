'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, Share2, ChevronLeft } from 'lucide-react'
import { ConfiguratorHeader } from '@/components/configurator/configurator-header'
import { ConfiguratorViewer } from '@/components/configurator/configurator-viewer'
import { ConfiguratorOptionsPanel } from '@/components/configurator/configurator-options-panel'
import { ConfiguratorBottomBar } from '@/components/configurator/configurator-bottom-bar'
import { ConfiguratorSummary } from '@/components/configurator/configurator-summary'
import { ConfiguratorInventorySearch } from '@/components/configurator/configurator-inventory-search'
import {
  CONFIGURATOR_MODEL,
  CONFIG_SECTIONS,
  DEFAULT_SELECTIONS,
  GALLERY_IMAGES,
  SUMMARY_EQUIPMENT,
  INVENTORY_ITEMS,
  calculateTotal,
  findOptionById,
  SelectedEquipmentGroup,
} from '@/lib/configurator-data'

function buildSummaryFromSelections(
  selections: Record<string, string>
): SelectedEquipmentGroup[] {
  return SUMMARY_EQUIPMENT.map((group) => {
    if (group.id === 'exterior-colors-wheels') {
      const color = findOptionById(selections['exterior-colors'] ?? '0Q')
      const wheel = findOptionById(selections.wheels ?? '58Y')
      return {
        ...group,
        items: [color, wheel].filter(Boolean) as typeof group.items,
        count: [color, wheel].filter(Boolean).length,
      }
    }

    if (group.id === 'interior-colors-seats') {
      const interior = findOptionById(selections['interior-material'] ?? 'AX')
      const seats = findOptionById(selections.seats ?? 'Q4Q')
      const rear = findOptionById(selections['rear-seats'] ?? '3UG')
      const items = [interior, seats, rear].filter(Boolean) as typeof group.items
      return { ...group, items, count: items.length }
    }

    return group
  })
}

export default function ConfiguratorPage() {
  const [selections, setSelections] = useState<Record<string, string>>(DEFAULT_SELECTIONS)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'exterior-colors': true,
    wheels: true,
    'interior-material': true,
    seats: true,
    packages: true,
  })
  const [expandedSummaryGroups, setExpandedSummaryGroups] = useState<Record<string, boolean>>({})
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [show360, setShow360] = useState(false)
  const [saved, setSaved] = useState(false)

  const { equipmentPrice, total } = useMemo(
    () =>
      calculateTotal(
        CONFIGURATOR_MODEL.baseMsrp,
        CONFIGURATOR_MODEL.deliveryFee,
        selections
      ),
    [selections]
  )

  const summaryEquipment = useMemo(
    () => buildSummaryFromSelections(selections),
    [selections]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#section-summary') {
      document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleSelectOption = useCallback(
    (sectionId: string, optionId: string, subGroupId?: string) => {
      const key =
        sectionId === 'seats' && subGroupId === 'more-seat-options' ? 'rear-seats' : sectionId
      setSelections((prev) => ({ ...prev, [key]: optionId }))

      if (sectionId === 'exterior-colors') {
        setActiveImageIndex(0)
      } else if (sectionId === 'interior-material' || sectionId === 'seats') {
        setActiveImageIndex(3)
      } else if (sectionId === 'wheels') {
        setActiveImageIndex(8)
      }
    },
    []
  )

  const handleToggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === false,
    }))
  }, [])

  const handleToggleSummaryGroup = useCallback((groupId: string) => {
    setExpandedSummaryGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === false,
    }))
  }, [])

  const scrollToSummary = () => {
    document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToInventory = () => {
    document.getElementById('section-inventory')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChangeEquipment = (groupId: string, _optionId: string) => {
    const sectionMap: Record<string, string> = {
      'exterior-colors-wheels': 'exterior-colors',
      'interior-colors-seats': 'interior-material',
    }
    const sectionId = sectionMap[groupId]
    if (sectionId) {
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white min-h-screen text-[#181818]">
      <ConfiguratorHeader />

      {/* Sub header toolbar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/models"
              className="p-1.5 hover:bg-[#f5f5f5] rounded-full transition-colors"
              aria-label="Back"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </Link>
            <Link
              href="/models"
              className="text-sm font-light hover:opacity-70 hidden sm:inline"
            >
              Change model
            </Link>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className="flex items-center gap-1.5 text-sm font-light hover:opacity-70"
            >
              <Heart size={16} strokeWidth={1.5} fill={saved ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-light hover:opacity-70"
            >
              <Share2 size={16} strokeWidth={1.5} />
              <span className="hidden md:inline">Create Porsche Code</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={scrollToSummary}
              className="px-4 py-2 text-sm font-light border border-[#d2d2d2] rounded-full hover:border-black transition-colors hidden sm:block"
            >
              Summary
            </button>
            <button
              type="button"
              onClick={scrollToInventory}
              className="px-4 py-2 text-sm font-light bg-black text-white rounded-full hover:bg-[#303030] transition-colors"
            >
              Request details
            </button>
          </div>
        </div>
      </div>

      {/* Main configurator layout */}
      <main className="pt-[7.5rem] pb-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-6 lg:gap-10 min-h-[calc(100vh-12rem)]">
            <ConfiguratorViewer
              images={GALLERY_IMAGES}
              activeIndex={activeImageIndex}
              onSelectImage={setActiveImageIndex}
              modelName={CONFIGURATOR_MODEL.name}
              year={CONFIGURATOR_MODEL.year}
              onOpen360={() => setShow360(true)}
            />

            <div className="lg:sticky lg:top-32 lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-hidden flex flex-col">
              <ConfiguratorOptionsPanel
                sections={CONFIG_SECTIONS}
                selections={selections}
                expandedSections={expandedSections}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleSection={handleToggleSection}
                onSelectOption={handleSelectOption}
              />
            </div>
          </div>
        </div>
      </main>

      <ConfiguratorSummary
        equipmentGroups={summaryEquipment}
        totalPrice={total}
        equipmentPrice={equipmentPrice}
        expandedGroups={expandedSummaryGroups}
        onToggleGroup={handleToggleSummaryGroup}
        onChangeOption={handleChangeEquipment}
      />

      <div id="section-inventory">
        <ConfiguratorInventorySearch items={INVENTORY_ITEMS} />
      </div>

      <ConfiguratorBottomBar
        totalPrice={total}
        modelName={CONFIGURATOR_MODEL.name}
        onSelectDealer={scrollToSummary}
        onShowSearch={scrollToInventory}
      />

      {/* 360 View modal */}
      {show360 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="360 degree view"
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShow360(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#ebebeb] flex items-center justify-center text-lg"
              aria-label="Close 360 view"
            >
              ×
            </button>
            <h3 className="text-xl font-light mb-4">360° View</h3>
            <div className="relative h-64 md:h-96 bg-[#f5f5f5] rounded-xl overflow-hidden mb-4">
              <img
                src={GALLERY_IMAGES[activeImageIndex]?.src ?? GALLERY_IMAGES[0].src}
                alt="360 view"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-[#666] font-light text-center">
              Drag to rotate · Demo 360° viewer with fake data
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {GALLERY_IMAGES.slice(0, 8).map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === activeImageIndex ? 'bg-black' : 'bg-[#d2d2d2]'
                  }`}
                  aria-label={`Angle ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
