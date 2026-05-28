'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Loader2, Bookmark, X } from 'lucide-react'
import Image from 'next/image'
import { SiteHeader } from '@/components/features/layout/site-header'
import { ConfiguratorToolbar } from '@/components/features/configurator/configurator-toolbar'
import { ConfiguratorViewer } from '@/components/features/configurator/configurator-viewer'
import { Porsche3DStream } from '@/components/features/configurator/porsche-3d-stream'
import { useSiteHeaderVisible } from '@/hooks/use-site-header-visible'
import { cn } from '@/utils/cn'
import { ConfiguratorOptionsPanel } from '@/components/features/configurator/configurator-options-panel'
import { ConfiguratorBottomBar } from '@/components/features/configurator/configurator-bottom-bar'
import { ConfiguratorSummary } from '@/components/features/configurator/configurator-summary'
import {
  ConfigSection,
  ConfiguratorModel,
  GalleryImage,
  calculateTotal,
  buildSummaryFromSelections,
  findOptionById,
} from '@/utils/configurator-data'
import {
  configuratorService,
  getPorscheConfiguratorAssets,
  mapConfiguratorResponse,
} from '@/services/configurator'
import { carBuildApi } from '@/services/car-build-api'
import { authService } from '@/services/auth'
import { LoginPromptModal } from '@/components/features/configurator/login-prompt-modal'
import { PorscheCodeModal } from '@/components/features/configurator/porsche-code-modal'
import { SelectionType } from '@/constants/enums'

const FALLBACK_GALLERY: GalleryImage[] = [
  {
    id: 'fallback',
    src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png',
    alt: 'Porsche',
    type: 'exterior',
  },
]

const DEFAULT_PORSCHE_MODEL_CODES: Record<number, string> = {
  2: '9921B2',
}

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
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Car image */}
        <div className="relative w-full h-56 md:h-64 bg-gray-50 rounded-t-2xl overflow-hidden">
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
          <h3 className="text-xl md:text-2xl font-light text-near-black mb-2">
            Bản dựng của bạn đã được lưu.
          </h3>
          <p className="text-sm text-dark-gray font-light mb-6">
            Bạn có thể tìm thấy các mô hình xe đã chế tạo trong thư mục xe đã lưu.
          </p>
          <button
            type="button"
            onClick={onViewSaved}
            className="w-full py-3.5 bg-near-black text-white rounded-lg text-sm font-medium hover:bg-dark-surface transition-colors flex items-center justify-center gap-2"
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
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ConfiguratorContent />
    </Suspense>
  )
}

function ConfiguratorContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelIdParam = params?.modelId as string
  const isPorscheCode = modelIdParam && isNaN(Number(modelIdParam))
  
  const [modelId, setModelId] = useState<number>(!isPorscheCode ? Number(modelIdParam) : 0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<ConfiguratorModel | null>(null)
  const [sections, setSections] = useState<ConfigSection[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(FALLBACK_GALLERY)
  const [porscheModelCode, setPorscheModelCode] = useState<string | null>(null)
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
  const [showPorscheCodeModal, setShowPorscheCodeModal] = useState(false)
  const [createdPorscheCode, setCreatedPorscheCode] = useState("")
  const [isCreatingCode, setIsCreatingCode] = useState(false)
  const siteHeaderVisible = useSiteHeaderVisible(56)

  const focusOptionSearch = useCallback(() => {
    const el = document.getElementById('configurator-option-search') as HTMLInputElement | null
    el?.focus()
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  useEffect(() => {
    if (!modelIdParam) {
      setError('Invalid car model or code')
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        let resolvedModelId: number
        let loadedSelections: Record<string, string[]> | null = null

        if (isPorscheCode) {
          const build = await carBuildApi.getBuildByCode(modelIdParam)
          if (cancelled) return
          resolvedModelId = build.modelId
          loadedSelections = build.selections
          setModelId(resolvedModelId)
        } else {
          resolvedModelId = Number(modelIdParam)
          setModelId(resolvedModelId)
        }

        if (Number.isNaN(resolvedModelId) || resolvedModelId === 0) {
          setError('Invalid car model')
          setLoading(false)
          return
        }

        const data = await configuratorService.getByCarModelId(resolvedModelId)
        if (cancelled) return

        const mapped = mapConfiguratorResponse(data)
        const porscheModelCode =
          searchParams?.get('porscheModelCode') ?? DEFAULT_PORSCHE_MODEL_CODES[resolvedModelId]
        setPorscheModelCode(porscheModelCode ?? null)
        const porscheAssets = porscheModelCode
          ? await getPorscheConfiguratorAssets(porscheModelCode)
          : null
        if (cancelled) return

        const resolvedGalleryImages =
          porscheAssets?.galleryImages.length
            ? porscheAssets.galleryImages
            : mapped.galleryImages.length > 0
              ? mapped.galleryImages
              : FALLBACK_GALLERY

        setModel(mapped.model)
        setSections(mapped.sections)

        // Check if there are loaded selections from a code
        if (loadedSelections) {
          setSelections(loadedSelections)
        } else {
          // Check if there are saved selections in URL params
          const savedSelectionsParam = searchParams?.get('selections')
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
        }

        setGalleryImages(resolvedGalleryImages)

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
  }, [isPorscheCode, modelIdParam, searchParams])

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

  const handleCreatePorscheCode = useCallback(async () => {
    if (!model || !modelId || isCreatingCode) return

    setIsCreatingCode(true)
    try {
      const { colorName, interiorName } = getDisplayInfo()

      const build = await carBuildApi.createPorscheCode({
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

      setCreatedPorscheCode(build.porscheCode)
      setShowPorscheCodeModal(true)
    } catch (err) {
      console.error('Failed to create Porsche Code', err)
    } finally {
      setIsCreatingCode(false)
    }
  }, [model, modelId, galleryImages, total, equipmentPrice, selections, getDisplayInfo, isCreatingCode])

  const handleSelectOption = useCallback(
    (_sectionId: string, optionId: string, subGroupId?: string) => {
      const key = subGroupId ?? _sectionId
      setSelections((prev) => {
        const section = sections.find((s) => s.id === _sectionId)
        const subGroup = section?.subGroups.find((sg) => sg.id === key)
        const selectionType = subGroup?.selectionType ?? SelectionType.SINGLE
        const current = prev[key] ?? []

        if (selectionType === SelectionType.MULTIPLE) {
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

  const handleSelectDealer = useCallback(() => {
    if (model) {
      // Save current configuration to URL or pass modelId at least
      router.push(`/request-details?modelId=${modelId}`)
    } else {
      router.push('/request-details')
    }
  }, [router, modelId, model])

  const handleTestDrive = useCallback(() => {
    if (model) {
      router.push(`/test-drive?modelId=${modelId}`)
    } else {
      router.push('/test-drive')
    }
  }, [router, modelId, model])

  const handleChangeEquipment = (groupId: string) => {
    setExpandedSections((prev) => ({ ...prev, [groupId]: true }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-dark-gray" />
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-dark-gray font-light">{error ?? 'Car model not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/models')}
          className="px-6 py-2 border border-black rounded-full text-sm font-light hover:bg-neutral-50"
        >
          Back to models
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen text-near-black">
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
        onSelectDealer={handleSelectDealer}
        onSearch={focusOptionSearch}
      />

      <main className="pb-28">
        <div className="mx-auto max-w-[1760px] px-4 md:px-8">
          {sections.length === 0 ? (
            <p className="text-center text-dark-gray font-light py-24">
              No options configured for this model yet. Assign options in Admin → Car Model Options.
            </p>
          ) : (
            <div className="mt-5 grid min-h-[calc(100vh-10rem)] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_500px]">
              <ConfiguratorViewer
                images={galleryImages}
                activeIndex={activeImageIndex}
                onSelectImage={setActiveImageIndex}
                modelName={model.name}
                year={model.year}
                onOpen360={() => setShow360(true)}
                porscheModelCode={porscheModelCode}
              />

              <div
                className={cn(
                  'flex flex-col border-l border-neutral-200 pl-0 transition-all duration-200 lg:sticky lg:overflow-hidden lg:pl-6',
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
            onCreatePorscheCode={handleCreatePorscheCode}
            onSelectDealer={handleSelectDealer}
            onTestDrive={handleTestDrive}
          />

          {showBottomBar && (
            <ConfiguratorBottomBar
              totalPrice={total}
              modelName={model.name}
              onSelectDealer={handleSelectDealer}
              onShowSearch={focusOptionSearch}
              onTestDrive={handleTestDrive}
            />
          )}
        </>
      )}

      {/* 3D Modal */}
      {show360 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black p-0"
          role="dialog"
          aria-modal="true"
          aria-label="3D view"
        >
          <div className="relative h-screen w-screen bg-black">
            <button
              type="button"
              onClick={() => setShow360(false)}
              className="absolute right-6 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-lg text-near-black transition-colors hover:bg-white"
              aria-label="Close 3D view"
            >
              ×
            </button>
            <div className="absolute left-6 top-6 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-light text-near-black">
              Porsche 3D View
            </div>
            <div className="relative h-full w-full overflow-hidden bg-black">
              {porscheModelCode ? (
                <Porsche3DStream modelCode={porscheModelCode} className="absolute inset-0" />
              ) : (
                <Image
                  src={galleryImages[activeImageIndex]?.src ?? galleryImages[0].src}
                  alt="3D view fallback"
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}
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

      {showPorscheCodeModal && (
        <PorscheCodeModal
          open={showPorscheCodeModal}
          onClose={() => setShowPorscheCodeModal(false)}
          porscheCode={createdPorscheCode}
          modelImage={model.defaultImage || galleryImages[0]?.src || ''}
        />
      )}
    </div>
  )
}
