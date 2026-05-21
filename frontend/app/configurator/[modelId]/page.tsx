'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Bookmark, X } from 'lucide-react'
import Image from 'next/image'
import { SiteHeader } from '@/components/layout/site-header'
import { ConfiguratorToolbar } from '@/components/configurator/configurator-toolbar'
import { ConfiguratorViewer } from '@/components/configurator/configurator-viewer'
import { useSiteHeaderVisible } from '@/hooks/use-site-header-visible'
import { cn } from '@/lib/utils'
import { ConfiguratorOptionsPanel } from '@/components/configurator/configurator-options-panel'
import { ConfiguratorBottomBar } from '@/components/configurator/configurator-bottom-bar'
import { ConfiguratorSummary } from '@/components/configurator/configurator-summary'
import {
  ConfigSection,
  ConfiguratorModel,
  GalleryImage,
  calculateTotal,
  buildSummaryFromSelections,
  MSRP_DISCLAIMER,
  findOptionById,
} from '@/lib/configurator-data'
import { configuratorService, mapConfiguratorResponse } from '@/lib/configurator'
import { carBuildApi } from '@/lib/car-build-api'
import { authService } from '@/lib/auth'
import { LoginPromptModal } from '@/components/configurator/login-prompt-modal'

const FALLBACK_GALLERY: GalleryImage[] = [
  {
    id: 'fallback',
    src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
    alt: 'Porsche',
    type: 'exterior',
  },
]

/** Modal shown after saving a configuration */
function SavedModal({
  modelImage,
  onClose,
  onViewSaved,
}: {
  modelImage: string
  onClose: () => void
  onViewSaved: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Car image */}
        <div className="relative w-full h-56 md:h-64 bg-[#f8f8f8] rounded-t-2xl overflow-hidden">
          <Image
            src={modelImage}
            alt="Porsche"
            fill
            unoptimized
            className="object-contain p-4"
          />
        </div>

        {/* Text content */}
        <div className="px-8 pb-8 pt-6 text-center">
          <h3 className="text-xl md:text-2xl font-light text-[#181818] mb-2">
            Bản dựng của bạn đã được lưu.
          </h3>
          <p className="text-sm text-[#666] font-light mb-6">
            Bạn có thể tìm thấy các mô hình xe đã chế tạo trong thư mục xe đã lưu.
          </p>
          <button
            type="button"
            onClick={onViewSaved}
            className="w-full py-3.5 bg-[#181818] text-white rounded-lg text-sm font-medium hover:bg-[#303030] transition-colors flex items-center justify-center gap-2"
          >
            <Bookmark size={16} strokeWidth={1.5} />
            Hiển thị các phương tiện đã lưu
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfiguratorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelId = Number(params.modelId)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<ConfiguratorModel | null>(null)
  const [sections, setSections] = useState<ConfigSection[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(FALLBACK_GALLERY)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [expandedSummaryGroups, setExpandedSummaryGroups] = useState<Record<string, boolean>>({})
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [show360, setShow360] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showBottomBar, setShowBottomBar] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const siteHeaderVisible = useSiteHeaderVisible(56)

  const focusOptionSearch = useCallback(() => {
    const el = document.getElementById('configurator-option-search') as HTMLInputElement | null
    el?.focus()
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  useEffect(() => {
    if (!modelId || Number.isNaN(modelId)) {
      setError('Invalid car model')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await configuratorService.getByCarModelId(modelId)
        if (cancelled) return

        const mapped = mapConfiguratorResponse(data)
        setModel(mapped.model)
        setSections(mapped.sections)

        // Check if there are saved selections in URL params
        const savedSelectionsParam = searchParams.get('selections')
        if (savedSelectionsParam) {
          try {
            const parsedSelections = JSON.parse(decodeURIComponent(savedSelectionsParam))
            setSelections(parsedSelections)
          } catch {
            setSelections(mapped.defaultSelections)
          }
        } else {
          setSelections(mapped.defaultSelections)
        }

        setGalleryImages(
          mapped.galleryImages.length > 0 ? mapped.galleryImages : FALLBACK_GALLERY
        )

        const expanded: Record<string, boolean> = {}
        mapped.sections.forEach((s) => {
          expanded[s.id] = true
        })
        setExpandedSections(expanded)
      } catch {
        if (!cancelled) {
          setError('Unable to load configurator. Please check that the backend is running.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [modelId, searchParams])

  // In real implementation we'd check if specific config is saved. Defaulting to false for now.
  useEffect(() => {
    setSaved(false)
  }, [model, selections, modelId])

  const { equipmentPrice, total } = useMemo(() => {
    if (!model) return { equipmentPrice: 0, total: 0 }
    return calculateTotal(model.baseMsrp, model.deliveryFee, selections, sections)
  }, [model, selections, sections])

  const summaryEquipment = useMemo(
    () => buildSummaryFromSelections(selections, sections),
    [selections, sections]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#section-summary') {
      document.getElementById('section-summary')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [loading])

  useEffect(() => {
    if (loading || sections.length === 0) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBottomBar(entry.isIntersecting)
      },
      { rootMargin: '0px', threshold: 0 }
    )
    const summary = document.getElementById('section-summary')
    if (summary) observer.observe(summary)
    return () => observer.disconnect()
  }, [loading, sections.length])

  /** Extract display info from current selections */
  const getDisplayInfo = useCallback(() => {
    let colorName: string | undefined
    let interiorName: string | undefined

    for (const section of sections) {
      for (const sg of section.subGroups) {
        const selectedIds = selections[sg.id] ?? []
        for (const selectedId of selectedIds) {
          const option = sg.options.find((o) => o.id === selectedId)
          if (!option) continue

          const combined = `${section.title} ${sg.title}`.toLowerCase()
          if (
            (combined.includes('màu') || combined.includes('color') || combined.includes('sơn') || combined.includes('paint')) &&
            !combined.includes('nội thất') && !combined.includes('interior')
          ) {
            colorName = option.name
          }
          if (combined.includes('nội thất') || combined.includes('interior')) {
            interiorName = option.name
          }
        }
      }
    }

    return { colorName, interiorName }
  }, [sections, selections])

  const handleSave = useCallback(async () => {
    if (!model || isSaving) return

    if (!authService.isAuthenticated()) {
      setShowLoginModal(true)
      return
    }

    setIsSaving(true)
    try {
      const { colorName, interiorName } = getDisplayInfo()

      await carBuildApi.saveBuild({
        modelId,
        modelName: `Porsche ${model.name}`,
        modelYear: model.year,
        imageUrl: model.defaultImage || galleryImages[0]?.src || '',
        galleryImages: galleryImages.slice(0, 4).map((g) => g.src),
        totalPrice: total,
        baseMsrp: model.baseMsrp,
        equipmentPrice,
        deliveryFee: model.deliveryFee,
        selections: JSON.stringify(selections),
        colorName,
        interiorName,
      })

      setSaved(true)
      setShowSavedModal(true)
    } catch (err) {
      console.error('Failed to save build', err)
      // Could add toast here
    } finally {
      setIsSaving(false)
    }
  }, [model, modelId, galleryImages, total, equipmentPrice, selections, getDisplayInfo, isSaving])

  const handleSelectOption = useCallback(
    (_sectionId: string, optionId: string, subGroupId?: string) => {
      const key = subGroupId ?? _sectionId
      setSelections((prev) => {
        const section = sections.find((s) => s.id === _sectionId)
        const subGroup = section?.subGroups.find((sg) => sg.id === key)
        const selectionType = subGroup?.selectionType ?? 'SINGLE'
        const current = prev[key] ?? []

        if (selectionType === 'MULTIPLE') {
          const exists = current.includes(optionId)
          return {
            ...prev,
            [key]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
          }
        }

        const newSelections = { ...prev }

        // Allow only 1 option to be selected across all SubGroups within Exterior Colors
        if (
          section &&
          (section.title.toLowerCase().includes('màu sắc ngoại thất') ||
            section.title.toLowerCase().includes('exterior color') ||
            section.title.toLowerCase().includes('exterior colors'))
        ) {
          for (const sg of section.subGroups) {
            delete newSelections[sg.id]
          }
        }

        newSelections[key] = [optionId]

        return newSelections
      })
      setActiveImageIndex(0)
    },
    [sections]
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

  const handleChangeEquipment = (groupId: string) => {
    setExpandedSections((prev) => ({ ...prev, [groupId]: true }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#666]" />
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[#666] font-light">{error ?? 'Car model not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/models')}
          className="px-6 py-2 border border-black rounded-full text-sm font-light hover:bg-[#fafafa]"
        >
          Back to models
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen text-[#181818]">
      {/* Header 1: global nav — scrolls away with page */}
      <SiteHeader logoHref="/" />

      {/* Header 2: configurator toolbar — sticky at top after header 1 is scrolled past */}
      <ConfiguratorToolbar
        modelId={modelId}
        modelName={model.name}
        totalPrice={total}
        saved={saved}
        onToggleSave={handleSave}
        onSummary={scrollToSummary}
        onSelectDealer={scrollToSummary}
        onSearch={focusOptionSearch}
      />

      <main className="pb-28">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {sections.length === 0 ? (
            <p className="text-center text-[#666] font-light py-24">
              No options configured for this model yet. Assign options in Admin → Car Model Options.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-6 lg:gap-10 min-h-[calc(100vh-12rem)] mt-6">
              <ConfiguratorViewer
                images={galleryImages}
                activeIndex={activeImageIndex}
                onSelectImage={setActiveImageIndex}
                modelName={model.name}
                year={model.year}
                onOpen360={() => setShow360(true)}
              />

              <div
                className={cn(
                  'lg:sticky lg:overflow-hidden flex flex-col transition-all duration-200',
                  siteHeaderVisible 
                    ? 'lg:top-[7.25rem] lg:h-[calc(100vh-7.25rem)]' 
                    : 'lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]'
                )}
              >
                <ConfiguratorOptionsPanel
                  sections={sections}
                  selections={selections}
                  expandedSections={expandedSections}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onToggleSection={handleToggleSection}
                  onSelectOption={handleSelectOption}
                  modelImageUrl={model.defaultImage}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {sections.length > 0 && (
        <>
          <ConfiguratorSummary
            model={model}
            equipmentGroups={summaryEquipment}
            totalPrice={total}
            equipmentPrice={equipmentPrice}
            expandedGroups={expandedSummaryGroups}
            onToggleGroup={handleToggleSummaryGroup}
            onChangeOption={handleChangeEquipment}
            onSave={handleSave}
          />

          {showBottomBar && (
            <ConfiguratorBottomBar
              totalPrice={total}
              modelName={model.name}
              onSelectDealer={scrollToSummary}
              onShowSearch={focusOptionSearch}
            />
          )}
        </>
      )}

      {/* 360 Modal */}
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
                src={galleryImages[activeImageIndex]?.src ?? galleryImages[0].src}
                alt="360 view"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm text-[#666] font-light text-center">
              Drag to rotate · {MSRP_DISCLAIMER.slice(0, 60)}…
            </p>
            <div className="flex justify-center gap-2 mt-4">
              {galleryImages.slice(0, 8).map((img, i) => (
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

      {/* Saved Modal (ảnh 3) */}
      {showSavedModal && (
        <SavedModal
          modelImage={model.defaultImage || galleryImages[0]?.src || ''}
          onClose={() => setShowSavedModal(false)}
          onViewSaved={() => {
            setShowSavedModal(false)
            router.push('/saved-vehicles')
          }}
        />
      )}

      {/* Login Prompt Modal (ảnh 6) */}
      {showLoginModal && (
        <LoginPromptModal
          modelImage={model.defaultImage || galleryImages[0]?.src || ''}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}
