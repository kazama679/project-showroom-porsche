'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  Bookmark,
  Calculator,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Rotate3D,
  Search,
  Share2,
  X,
} from 'lucide-react'
import { Porsche3DStream } from '@/components/features/configurator/porsche-3d-stream'

type PorscheScrapeOption = {
  id: string
  title: string
  categoryTitle: string
  groupId: string
  groupTitle: string
  family?: string | null
  isSelected?: boolean
  price?: string | null
  priceNumeric?: number | null
  color?: string[] | null
  thumbnail?: string | null
  materialImage?: string | null
  description?: string | null
  staticImageApisAfterClick?: {
    frontLeft?: string
    sideLeft?: string
    interiorDashboard?: string
  }
  threeDUpdateAfterClick?: {
    payload?: PorscheProductPayload
  }
}

type PorscheScrapeGroup = {
  id: string
  title: string
  selectedOptions?: string[]
  items: PorscheScrapeOption[]
}

type PorscheScrapeCategory = {
  id: string
  title: string
  selectedOptions?: string[]
  groups: PorscheScrapeGroup[]
}

type PorscheScrapeSection = {
  id: string
  title: string
  categories: PorscheScrapeCategory[]
}

type PorscheProductPayload = {
  id: string
  options: {
    config: string[]
    country: string
    modelYear: number
  }
}

type PorscheScrapeData = {
  model: {
    orderType: string
    modelName: string
    modelYear: number
    basePrice: { raw: number; gross: string }
    destinationCharge: { raw: number; gross: string }
  }
  defaultConfiguration: {
    prs3dOptions: string[]
  }
  images: {
    mainStage: Array<{ url: string; alt: string; view: string }>
  }
  sections: PorscheScrapeSection[]
  indexes: {
    optionCount: number
    exteriorColorCount: number
  }
}

const MODEL_CODE = '9921B2'
const PORSCHE_SECTION_TITLES: Record<string, string> = {
  'section-exterior-color': 'Exterior Color',
  'section-exterior': 'Exterior',
  'section-interior': 'Interior',
  'section-packages': 'Packages',
  'section-performance': 'Performance',
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getSectionTitle(section: PorscheScrapeSection) {
  return PORSCHE_SECTION_TITLES[section.id] ?? section.title.replace(/^section-/, '').replace(/-/g, ' ')
}

function isColorGroup(category: PorscheScrapeCategory, group: PorscheScrapeGroup) {
  const text = `${category.title} ${group.title}`.toLowerCase()
  return text.includes('color') || text.includes('paint')
}

function isWheelGroup(category: PorscheScrapeCategory, group: PorscheScrapeGroup) {
  const text = `${category.title} ${group.title}`.toLowerCase()
  return text.includes('wheel') || text.includes('rad')
}

function isPaintOption(option: PorscheScrapeOption) {
  return option.family === 'AUSSEN_FARBE' || option.categoryTitle.toLowerCase().includes('exterior color')
}

function isWheelOption(option: PorscheScrapeOption) {
  const text = `${option.family ?? ''} ${option.categoryTitle ?? ''} ${option.groupTitle ?? ''} ${option.title}`.toLowerCase()
  const categoryText = `${option.categoryTitle ?? ''} ${option.groupTitle ?? ''}`.toLowerCase()
  if (text.includes('steering wheel')) return false
  return (
    option.family === 'RAD' ||
    categoryText.includes('wheels') ||
    categoryText.includes('wheel colors') ||
    categoryText.includes('wheel accessories') ||
    categoryText.includes('wheel sets') ||
    categoryText.includes('winter wheel')
  )
}

function isWheelSection(section: PorscheScrapeSection) {
  const text = `${section.id} ${section.title}`.toLowerCase()
  return text.includes('wheel') || text.includes('rad')
}

function isInteriorOption(option: PorscheScrapeOption) {
  const text = `${option.family ?? ''} ${option.categoryTitle ?? ''} ${option.groupTitle ?? ''} ${option.title}`.toLowerCase()
  const categoryText = `${option.categoryTitle ?? ''} ${option.groupTitle ?? ''}`.toLowerCase()
  return (
    option.family === 'INNENAUSSTATTUNG' ||
    categoryText.includes('interior') ||
    categoryText.includes('seats') ||
    categoryText.includes('seat') ||
    categoryText.includes('steering wheel') ||
    categoryText.includes('gearshift') ||
    text.includes('leather interior')
  )
}

function focusForOption(option: PorscheScrapeOption) {
  if (isWheelOption(option)) {
    return {
      camera: 'exterior-side-west-wheel',
      galleryIndex: 1,
      open3D: false,
    }
  }

  if (isInteriorOption(option)) {
    return {
      camera: option.title.toLowerCase().includes('seat') ? 'interior-front_seats' : 'interior-dashboard',
      galleryIndex: 2,
      open3D: false,
    }
  }

  return {
    camera: 'exterior-front-south_west',
    galleryIndex: 0,
    open3D: false,
  }
}

function optionImage(option: PorscheScrapeOption) {
  return option.thumbnail || option.materialImage || option.staticImageApisAfterClick?.frontLeft || null
}

function exclusiveFamily(option: PorscheScrapeOption) {
  if (isPaintOption(option)) return 'AUSSEN_FARBE'
  if (isWheelOption(option)) return 'RAD'
  if (option.family === 'INNENAUSSTATTUNG') return 'INNENAUSSTATTUNG'
  return null
}

function replacementItemsForOption(data: PorscheScrapeData, option: PorscheScrapeOption, group: PorscheScrapeGroup) {
  const family = exclusiveFamily(option)
  if (!family) return group.items

  return data.sections.flatMap((section) =>
    section.categories.flatMap((category) =>
      category.groups.flatMap((itemGroup) =>
        itemGroup.items.filter((item) => item.family === family)
      )
    )
  )
}

function initialSelections(data: PorscheScrapeData) {
  const selections: Record<string, string> = {}

  data.sections.forEach((section) => {
    section.categories.forEach((category) => {
      category.groups.forEach((group) => {
        const selected = group.items.find((item) => item.isSelected)
        if (selected) selections[group.id] = selected.id
      })
    })
  })

  return selections
}

function composeProductPayload(data: PorscheScrapeData | null, selections: Record<string, string>) {
  if (!data) return null

  const config = new Set(data.defaultConfiguration.prs3dOptions)
  const allOptionIds = new Set(
    data.sections.flatMap((section) =>
      section.categories.flatMap((category) =>
        category.groups.flatMap((group) => group.items.map((item) => item.id))
      )
    )
  )

  data.sections.forEach((section) => {
    section.categories.forEach((category) => {
      category.groups.forEach((group) => {
        const selectedId = selections[group.id]
        const selectedOption = group.items.find((item) => item.id === selectedId)
        if (!selectedOption?.threeDUpdateAfterClick?.payload) return

        const replacementItems = replacementItemsForOption(data, selectedOption, group)
        replacementItems.forEach((item) => {
          config.delete(item.id)
        })

        const payloadConfig = selectedOption.threeDUpdateAfterClick.payload.options.config
        payloadConfig.forEach((id) => {
          const isSelected = id === selectedOption.id
          const isExternalDependency = !allOptionIds.has(id)
          if (isSelected || isExternalDependency) config.add(id)
        })
      })
    })
  })

  return {
    id: MODEL_CODE,
    options: {
      config: Array.from(config),
      country: 'US',
      modelYear: data.model.modelYear,
    },
  }
}

function galleryForOption(data: PorscheScrapeData | null, option?: PorscheScrapeOption) {
  if (option && isWheelOption(option)) {
    return (
      data?.images.mainStage.slice(0, 10).map((image) => ({
        id: image.view,
        src: image.url,
        alt: image.alt,
      })) ?? []
    )
  }

  const optionImages = option?.staticImageApisAfterClick
  if (option && optionImages?.frontLeft) {
    return [
      {
        id: 'front-left',
        src: optionImages.frontLeft,
        alt: `${option.title} front view`,
      },
      optionImages.sideLeft && {
        id: 'side-left',
        src: optionImages.sideLeft,
        alt: `${option.title} side view`,
      },
      optionImages.interiorDashboard && {
        id: 'interior-dashboard',
        src: optionImages.interiorDashboard,
        alt: `${option.title} interior view`,
      },
    ].filter(Boolean) as Array<{ id: string; src: string; alt: string }>
  }

  return (
    data?.images.mainStage.slice(0, 10).map((image) => ({
      id: image.view,
      src: image.url,
      alt: image.alt,
    })) ?? []
  )
}

export function PorscheScrapeTest() {
  const [data, setData] = useState<PorscheScrapeData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [open3D, setOpen3D] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [selectedVisualOption, setSelectedVisualOption] = useState<PorscheScrapeOption | undefined>()
  const [selectedWheelVisualOption, setSelectedWheelVisualOption] = useState<PorscheScrapeOption | undefined>()
  const [cameraView, setCameraView] = useState('exterior-front-south_west')
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const optionsScrollRef = useRef<HTMLDivElement | null>(null)
  const [optionsScrollProgress, setOptionsScrollProgress] = useState(0)
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false)
  const [updatingOptionId, setUpdatingOptionId] = useState<string | null>(null)
  const optionBusyTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const response = await fetch(`/api/porsche-scrape?modelCode=${MODEL_CODE}`, {
          cache: 'no-store',
        })
        if (!response.ok) throw new Error('Không đọc được file Porsche scrape.')
        const json = (await response.json()) as PorscheScrapeData
        if (cancelled) return

        setData(json)
        setSelections(initialSelections(json))
        setExpandedSections(
          Object.fromEntries(json.sections.slice(0, 4).map((section) => [section.id, true]))
        )
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được dữ liệu test.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsViewerFullscreen(document.fullscreenElement === viewerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    return () => {
      if (optionBusyTimerRef.current) window.clearTimeout(optionBusyTimerRef.current)
    }
  }, [])

  const flatOptions = useMemo(() => {
    if (!data) return []
    return data.sections.flatMap((section) =>
      section.categories.flatMap((category) =>
        category.groups.flatMap((group) =>
          group.items.map((item) => ({
            ...item,
            categoryTitle: item.categoryTitle || category.title,
            groupTitle: item.groupTitle || group.title,
          }))
        )
      )
    )
  }, [data])

  const selectedOptions = useMemo(
    () => flatOptions.filter((option) => Object.values(selections).includes(option.id)),
    [flatOptions, selections]
  )

  const selectedEquipmentGroups = useMemo(() => {
    const groups = new Map<string, PorscheScrapeOption[]>()
    selectedOptions.forEach((option) => {
      const label = option.categoryTitle || option.groupTitle || 'Selected equipment'
      const existing = groups.get(label) ?? []
      existing.push(option)
      groups.set(label, existing)
    })
    return Array.from(groups.entries()).map(([title, items]) => ({ title, items }))
  }, [selectedOptions])

  const equipmentPrice = useMemo(
    () => selectedOptions.reduce((total, option) => total + (option.priceNumeric ?? 0), 0),
    [selectedOptions]
  )

  const gallery = useMemo(() => {
    const baseGallery = galleryForOption(data, selectedVisualOption)
    const wheelImage =
      selectedWheelVisualOption?.staticImageApisAfterClick?.frontLeft ||
      selectedWheelVisualOption?.staticImageApisAfterClick?.sideLeft
    if (!wheelImage) return baseGallery

    return baseGallery.map((image, index) =>
      index === 1
        ? {
            ...image,
            src: wheelImage,
            alt: `${selectedWheelVisualOption.title} wheel view`,
          }
        : image
    )
  }, [data, selectedVisualOption, selectedWheelVisualOption])

  const activeImage = gallery[activeImageIndex] ?? gallery[0]
  const isWheelDetailView = Boolean(selectedWheelVisualOption && activeImageIndex === 1 && !open3D)

  const productPayload = useMemo(
    () => composeProductPayload(data, selections),
    [data, selections]
  )

  const filteredSections = useMemo(() => {
    if (!data) return []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return data.sections

    return data.sections
      .map((section) => ({
        ...section,
        categories: section.categories
          .map((category) => ({
            ...category,
            groups: category.groups
              .map((group) => ({
                ...group,
                items: group.items.filter((item) =>
                  `${item.title} ${item.id} ${group.title} ${category.title}`
                    .toLowerCase()
                    .includes(normalized)
                ),
              }))
              .filter((group) => group.items.length > 0),
          }))
          .filter((category) => category.groups.length > 0),
      }))
      .filter((section) => section.categories.length > 0)
  }, [data, query])

  const handleSelectOption = (option: PorscheScrapeOption) => {
    const focus = focusForOption(option)
    const family = exclusiveFamily(option)

    setSelections((current) => ({
      ...Object.fromEntries(
        Object.entries(current).filter(([groupId]) => {
          if (!family || !data) return true
          return !data.sections.some((section) =>
            section.categories.some((category) =>
              category.groups.some(
                (group) =>
                  group.id === groupId &&
                  group.items.some((item) => item.family === family)
              )
            )
          )
        })
      ),
      [option.groupId]: option.id,
    }))

    if (isWheelOption(option)) {
      setSelectedWheelVisualOption(option)
      setSelectedVisualOption(undefined)
      setActiveImageIndex(focus.galleryIndex)
    } else if (option.staticImageApisAfterClick?.frontLeft) {
      setSelectedVisualOption(option)
      setActiveImageIndex(focus.galleryIndex)
    } else {
      setSelectedVisualOption(undefined)
      setActiveImageIndex(focus.galleryIndex)
    }

    setCameraView(focus.camera)
    setOpen3D(false)
  }

  const handleToggleFullscreen = () => {
    const el = viewerRef.current
    if (!el) return

    if (document.fullscreenElement === el) {
      void document.exitFullscreen?.()
      return
    }

    void el.requestFullscreen?.()
  }

  const updateOptionsScrollProgress = () => {
    const el = optionsScrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setOptionsScrollProgress(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0)
    if (open3D) return

    const wheelSection = el.querySelector<HTMLElement>('[data-wheel-section="true"]')
    if (!wheelSection) return

    const containerRect = el.getBoundingClientRect()
    const sectionRect = wheelSection.getBoundingClientRect()
    const isWheelSectionInFocus =
      sectionRect.top <= containerRect.top + containerRect.height * 0.35 &&
      sectionRect.bottom >= containerRect.top + 80

    if (isWheelSectionInFocus) {
      setOpen3D(false)
      setSelectedVisualOption(undefined)
      setActiveImageIndex(1)
      setCameraView('exterior-side-west-wheel')
    }
  }

  const handleOptionsQuickScroll = (value: number) => {
    const el = optionsScrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    el.scrollTop = (max * value) / 100
    setOptionsScrollProgress(value)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-sm text-neutral-700">
        {error ?? 'Không có dữ liệu Porsche scrape.'}
      </div>
    )
  }

  const totalPrice = data.model.basePrice.raw + data.model.destinationCharge.raw + equipmentPrice

  return (
    <div className="min-h-screen bg-white text-near-black">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[86px] max-w-[1760px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
              aria-label="Back"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <button type="button" className="hidden items-center gap-2 text-sm font-light md:flex">
              <Bookmark size={18} strokeWidth={1.5} />
              Save
            </button>
            <button type="button" className="hidden items-center gap-2 text-sm font-light md:flex">
              <Share2 size={18} strokeWidth={1.5} />
              Create Porsche Code
            </button>
          </div>

          <div className="hidden items-center md:flex">
            <div className="border-r border-neutral-300 px-6">
              <div className="flex items-center gap-2 text-sm">
                <Calculator size={17} strokeWidth={1.5} />
                <span>$1,663.95 /mo</span>
                <Info size={15} strokeWidth={1.5} />
              </div>
              <p className="mt-1 max-w-[150px] truncate text-xs text-neutral-500">
                Calculate monthly pay...
              </p>
            </div>
            <div className="px-6">
              <p className="text-sm font-light">{formatPrice(totalPrice)}</p>
              <p className="mt-1 max-w-[140px] truncate text-xs text-neutral-500">
                All information is subj...
              </p>
            </div>
            <button
              className="rounded-[8px] bg-neutral-200 px-8 py-5 text-sm"
              type="button"
              onClick={() => document.getElementById('porsche-scrape-summary')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Summary
            </button>
            <button className="ml-3 rounded-[8px] bg-black px-8 py-5 text-sm text-white" type="button">
              Select a dealer
            </button>
            <button
              type="button"
              className="ml-3 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200"
              aria-label="Search"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1840px] grid-cols-1 gap-6 px-4 py-4 md:px-9 lg:grid-cols-[minmax(0,1fr)_500px]">
        <section className="min-w-0">
          <div ref={viewerRef} className="relative min-h-[430px] overflow-hidden rounded-[18px] bg-[#f3f3f3] md:min-h-[600px]">
            {open3D ? (
              <Porsche3DStream
                modelCode={MODEL_CODE}
                productPayload={productPayload}
                initialCamera={cameraView}
                className="absolute inset-0"
                hideUpdateOverlay
                onBusyChange={(busy) => {
                  if (!busy) setUpdatingOptionId(null)
                }}
              />
            ) : activeImage && isWheelDetailView ? (
              <div
                role="img"
                aria-label={activeImage.alt}
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url("${activeImage.src}")`,
                  backgroundPosition: '82% 68%',
                  backgroundSize: '280%',
                }}
              />
            ) : activeImage ? (
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                unoptimized
                priority
                className="object-cover"
              />
            ) : null}

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="absolute right-6 top-6 z-[80] flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-colors hover:bg-white"
              aria-label={isViewerFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}
            >
              {isViewerFullscreen ? (
                <Minimize2 size={22} strokeWidth={1.5} />
              ) : (
                <Maximize2 size={22} strokeWidth={1.5} />
              )}
            </button>

            <button
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
              onClick={() => setOpen3D((current) => !current)}
              className="absolute bottom-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-light shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              {open3D ? <X size={16} /> : <Rotate3D size={16} />}
              {open3D ? 'Đóng model 3D' : 'Mở model 3D'}
            </button>

            <button
              type="button"
              className="absolute bottom-4 left-4 z-[80] flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur"
              aria-label="Screenshot"
            >
              <Camera size={16} />
            </button>
          </div>

          {!open3D && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-[64px] w-[104px] flex-shrink-0 overflow-hidden rounded-[4px] border ${
                    index === activeImageIndex ? 'border-black' : 'border-transparent opacity-70'
                  }`}
                >
                  <Image src={image.src} alt={image.alt} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-3 text-sm text-neutral-700 md:grid-cols-3">
            <div className="rounded-[6px] border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Options scraped</p>
              <p className="mt-1 text-2xl font-light">{data.indexes.optionCount}</p>
            </div>
            <div className="rounded-[6px] border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Exterior colors</p>
              <p className="mt-1 text-2xl font-light">{data.indexes.exteriorColorCount}</p>
            </div>
            <div className="rounded-[6px] border border-neutral-200 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">3D config ids</p>
              <p className="mt-1 text-2xl font-light">
                {productPayload?.options.config.length ?? 0}
              </p>
            </div>
          </div>
        </section>

        <aside className="min-h-0 border-l border-neutral-200 pl-0 lg:sticky lg:top-[92px] lg:h-[calc(100vh-104px)] lg:overflow-hidden lg:pl-6">
          <div className="flex h-full min-h-0 flex-col bg-white">
            <div className="border-b border-neutral-200 pb-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">Configure</p>
              <h2 className="mt-1 text-2xl font-light">Your {data.model.modelName}</h2>
              <div className="relative mt-5">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Porsche scraped options"
                  className="w-full rounded-[4px] border border-neutral-300 py-3 pl-10 pr-4 text-sm font-light focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              <div
                ref={optionsScrollRef}
                onScroll={updateOptionsScrollProgress}
                className="h-full overflow-y-auto pb-10 pr-7"
              >
                {filteredSections.map((section, sectionIndex) => {
                const sectionOpen = expandedSections[section.id] !== false
                return (
                  <div
                    key={section.id}
                    data-wheel-section={isWheelSection(section) ? 'true' : undefined}
                    className="border-b border-neutral-200"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSections((current) => ({
                          ...current,
                          [section.id]: !sectionOpen,
                        }))
                      }
                      className="flex w-full items-center justify-between py-5 text-left"
                    >
                      <div>
                        <p className="text-[11px] text-neutral-400">
                          {String(sectionIndex + 1).padStart(2, '0')}
                        </p>
                        <h3 className="text-base font-light">{getSectionTitle(section)}</h3>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${sectionOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {sectionOpen &&
                      section.categories.map((category) =>
                        category.groups.map((group) => {
                          const groupOpen = expandedGroups[group.id] !== false
                          const colorGroup = isColorGroup(category, group)
                          const wheelGroup = isWheelGroup(category, group)
                          const selectedOption = group.items.find((option) => selections[group.id] === option.id)
                          return (
                            <div key={group.id} className="border-t border-neutral-100 py-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedGroups((current) => ({
                                    ...current,
                                    [group.id]: !groupOpen,
                                  }))
                                }
                                className="flex w-full items-center justify-between py-1 text-left"
                              >
                                <div>
                                  <h4 className="text-sm font-medium">{group.title}</h4>
                                  {wheelGroup && selectedOption ? (
                                    <p className="mt-1 text-sm font-light text-near-black">
                                      {selectedOption.title}
                                      <span className="ml-2 text-neutral-500">{selectedOption.price ?? '$0'}</span>
                                    </p>
                                  ) : (
                                    <p className="text-xs text-neutral-500">{category.title}</p>
                                  )}
                                </div>
                                <span className="text-xl font-light">{groupOpen ? '-' : '+'}</span>
                              </button>

                              {groupOpen && (
                                <div
                                  className={
                                    wheelGroup
                                      ? 'grid grid-cols-[repeat(3,minmax(0,118px))] gap-3 pb-3 pt-3'
                                      : colorGroup
                                        ? 'flex flex-wrap gap-2.5 pb-3 pt-3'
                                        : 'grid grid-cols-2 gap-3 pb-3 pt-3'
                                  }
                                >
                                  {group.items.map((option) => {
                                    const selected = selections[group.id] === option.id
                                    const image = optionImage(option)
                                    const updating = updatingOptionId === option.id

                                    if (colorGroup || wheelGroup) {
                                      return (
                                        <button
                                          key={option.id}
                                          type="button"
                                          title={`${option.title} ${option.price ?? ''}`}
                                          onClick={() => handleSelectOption(option)}
                                          className={`relative overflow-hidden bg-white transition-all ${
                                            wheelGroup
                                              ? 'aspect-square w-[118px] rounded-[7px]'
                                              : 'h-14 w-14 rounded-[5px]'
                                          } border ${
                                            selected
                                              ? 'border-black ring-1 ring-black ring-offset-2'
                                              : 'border-neutral-300 hover:border-black'
                                          }`}
                                          style={
                                            !image
                                              ? { backgroundColor: option.color?.[0] ?? '#ddd' }
                                              : undefined
                                          }
                                        >
                                          {image && (
                                            <Image
                                              src={image}
                                              alt={option.title}
                                              fill
                                              unoptimized
                                              className={wheelGroup ? 'object-contain p-3' : 'object-cover'}
                                            />
                                          )}
                                          {selected && (
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                                              <Check className="h-4 w-4 text-white" />
                                            </span>
                                          )}
                                          {updating && (
                                            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
                                              <Loader2 className="h-5 w-5 animate-spin text-neutral-700" />
                                            </span>
                                          )}
                                        </button>
                                      )
                                    }

                                    return (
                                      <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelectOption(option)}
                                        className={`relative overflow-hidden rounded-[6px] border bg-white text-left transition-all ${
                                          selected
                                            ? 'border-black ring-1 ring-black'
                                            : 'border-neutral-200 hover:border-neutral-500'
                                        }`}
                                      >
                                        <div className="relative aspect-[4/3] bg-[#f6f6f6]">
                                          {image && (
                                            <Image
                                              src={image}
                                              alt={option.title}
                                              fill
                                              unoptimized
                                              className="object-contain p-2"
                                            />
                                          )}
                                        </div>
                                        <div className="p-3">
                                          <p className="line-clamp-3 min-h-[2.75rem] text-[13px] font-light leading-snug">
                                            {option.title}
                                          </p>
                                          <p className="mt-2 text-xs text-neutral-500">
                                            {option.price ?? '$0'}
                                          </p>
                                        </div>
                                        {updating && (
                                          <span className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                                            <Loader2 className="h-7 w-7 animate-spin text-neutral-700" />
                                          </span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                  </div>
                )
                })}
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={optionsScrollProgress}
                onChange={(event) => handleOptionsQuickScroll(Number(event.target.value))}
                aria-label="Scroll options"
                className="absolute right-0 top-4 h-[calc(100%-2rem)] w-5 [writing-mode:vertical-lr] accent-neutral-500"
              />
            </div>
          </div>
        </aside>
      </main>

      <section id="porsche-scrape-summary" className="mx-auto max-w-[1760px] px-4 pb-20 pt-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_520px]">
          <div className="min-w-0">
            <h2 className="mb-10 text-[24px] font-bold leading-tight">Your selected equipment</h2>

            {selectedEquipmentGroups.map((group) => (
              <div key={group.title} className="mb-8">
                <div className="mb-4 flex items-center gap-2.5">
                  <h3 className="text-[18px] font-bold leading-none">{group.title}</h3>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-neutral-200 px-2 text-[16px] font-light text-neutral-700">
                    {group.items.length}
                  </span>
                </div>

                <div className="border-t border-neutral-300">
                  {group.items.map((option) => {
                    const image = optionImage(option)
                    return (
                      <div
                        key={`${group.title}-${option.id}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-neutral-300 py-4 md:grid-cols-[minmax(0,1fr)_62px_150px_96px]"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          {image ? (
                            <div className="relative h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-[5px] bg-neutral-100">
                              <Image src={image} alt={option.title} fill unoptimized className="object-contain p-1" />
                            </div>
                          ) : option.color?.[0] ? (
                            <div
                              className="h-[52px] w-[52px] flex-shrink-0 rounded-[5px] border border-neutral-200"
                              style={{ backgroundColor: option.color[0] }}
                            />
                          ) : (
                            <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[5px] bg-neutral-100">
                              <span className="text-[10px] text-neutral-400">-</span>
                            </div>
                          )}
                          <p className="truncate text-base font-light leading-tight md:text-[18px]">
                            {option.title}
                          </p>
                        </div>

                        <div className="hidden items-center gap-2.5 text-[16px] font-light text-neutral-600 md:flex">
                          <button type="button" aria-label="More information" className="text-near-black hover:opacity-70">
                            <Info size={18} strokeWidth={1.6} />
                          </button>
                          <span>{option.id}</span>
                        </div>

                        <span className="hidden text-right text-[16px] font-light text-neutral-600 md:block">
                          {option.price ?? '$0'}
                        </span>

                        <div className="flex flex-shrink-0 items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(option)}
                            className="text-base font-light hover:underline md:text-[16px]"
                          >
                            Change
                          </button>
                          <ChevronRight size={20} strokeWidth={1.5} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:border-l lg:border-neutral-200 lg:pl-10">
            <div className="sticky top-24">
              <div className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-5">
                <div className="pb-8">
                  <div className="mb-7 flex items-center gap-3">
                    <h2 className="text-[36px] font-light leading-none">{data.model.modelName}</h2>
                    <span className="rounded-full bg-neutral-200 px-3 py-1 text-[15px] font-light text-neutral-800">
                      {data.model.modelYear}
                    </span>
                  </div>
                  <button type="button" className="text-[16px] font-light underline underline-offset-2">
                    Technical data and standard equipment
                  </button>
                </div>

                <div className="border-t border-neutral-300 py-8">
                  <p className="text-[18px] font-light text-neutral-600">Total MSRP*</p>
                  <p className="mt-1 text-[32px] font-light leading-none">{formatPrice(totalPrice)}</p>

                  <div className="mt-6">
                    <p className="text-[18px] font-light text-neutral-600">Monthly Payment</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <span className="text-[24px] font-light leading-none">$1,663.95</span>
                      <button
                        type="button"
                        className="flex items-center gap-2.5 rounded-[8px] bg-neutral-200 px-4 py-2.5 text-[16px] font-light hover:bg-neutral-300"
                      >
                        <Calculator size={18} strokeWidth={1.6} />
                        Calculate Monthly Payment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-neutral-300 py-8 text-[18px] font-light">
                  <div>
                    <p className="text-neutral-600">Base MSRP</p>
                    <p>{formatPrice(data.model.basePrice.raw)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Price for Equipment</p>
                    <p>{formatPrice(equipmentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600">Delivery, Processing and Handling Fee</p>
                    <p>{formatPrice(data.model.destinationCharge.raw)}</p>
                  </div>
                </div>

                <div className="space-y-4 pb-10">
                  <button
                    type="button"
                    className="w-full rounded-[10px] bg-black py-4 text-[16px] font-light text-white transition-colors hover:bg-neutral-900"
                  >
                    Select a dealer
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-neutral-200 py-4 text-[16px] font-light transition-colors hover:bg-neutral-300"
                  >
                    <Calculator size={17} strokeWidth={1.6} />
                    Explore Payment & Trade-In
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
