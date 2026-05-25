'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { carModelService, CarModelItem } from '@/lib/car-model'
import { carSpecService, CarSpecsDTO } from '@/lib/car-specs'
import { carImageService, CarImage } from '@/lib/car-image'
import { AnimatedNumber } from '@/components/ui/animated-number'

function getDriveType(model: CarModelItem, engineDrivetrain?: string | null): string {
  if (engineDrivetrain) return engineDrivetrain
  const nameLower = model.name.toLowerCase()
  if (
    nameLower.includes(' 4') ||
    nameLower.includes(' 4s') ||
    nameLower.includes('all-wheel') ||
    nameLower.includes('awd') ||
    nameLower.includes('4 e-hybrid')
  ) {
    return 'All-Wheel Drive'
  }
  return 'Rear-Wheel Drive'
}

function formatTransmission(transmission: string | null): string | null {
  if (!transmission) return null
  if (transmission.toLowerCase().includes('manual')) return 'Manual'
  if (transmission.toLowerCase().includes('pdk') || transmission.toLowerCase().includes('automatic')) {
    return 'PDK'
  }
  return transmission.includes('(') ? transmission.split(' ')[0] : transmission
}

export default function ModelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [model, setModel] = useState<CarModelItem | null>(null)
  const [specs, setSpecs] = useState<CarSpecsDTO | null>(null)
  const [detailImages, setDetailImages] = useState<CarImage[]>([])
  const [seriesModels, setSeriesModels] = useState<CarModelItem[]>([])
  const [seriesSpecsMap, setSeriesSpecsMap] = useState<Record<number, CarSpecsDTO>>({})
  const [loading, setLoading] = useState(true)
  const [selectedBodyTypeId, setSelectedBodyTypeId] = useState<number | null>(null)
  const cardsScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        setLoading(true)
        const data = await carModelService.findById(Number(id))
        setModel(data)
        try {
          const specsData = await carSpecService.getSpecsByCarModelId(Number(id))
          setSpecs(specsData)
        } catch (e) {
          console.error("Failed to load specs:", e)
        }
        try {
          // API doesn't currently support filtering by carModelId, so we fetch a large page and filter client-side.
          const imagesPage = await carImageService.findAll('', 0, 1000)
          const images = imagesPage.content || []
          const selected = images.filter((img: CarImage) => {
            return (
              img.carModelId === Number(id) &&
              (img.imageType || '').toLowerCase() === 'detail'
            )
          })
          setDetailImages(selected)
        } catch (e) {
          console.error('Failed to load detail image:', e)
          setDetailImages([])
        }
      } catch (error) {
        console.error("Failed to load model:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  useEffect(() => {
    async function loadSeriesModels() {
      if (!model?.seriesId) return
      try {
        const res = await carModelService.findAll('', 0, 100, model.seriesId)
        const list = res.content || []
        setSeriesModels(list)
      } catch (e) {
        console.error('Failed to load series models:', e)
        setSeriesModels([])
      }
    }
    loadSeriesModels()
  }, [model?.seriesId])

  useEffect(() => {
    if (model?.bodyTypeId) setSelectedBodyTypeId(model.bodyTypeId)
  }, [id, model?.bodyTypeId])

  useEffect(() => {
    async function loadSpecsForCards() {
      const list = seriesModels.slice(0, 12)
      if (list.length === 0) return
      try {
        const results = await Promise.all(
          list.map(async (m) => {
            try {
              const s = await carSpecService.getSpecsByCarModelId(m.id)
              return [m.id, s] as const
            } catch {
              return [m.id, null] as const
            }
          })
        )
        const next: Record<number, CarSpecsDTO> = {}
        for (const [modelId, specsData] of results) {
          if (specsData) next[modelId] = specsData
        }
        setSeriesSpecsMap(next)
      } catch (e) {
        console.error('Failed to load series specs:', e)
      }
    }
    loadSpecsForCards()
  }, [seriesModels])

  const perf = specs?.performance
  const acceleration = useMemo(() => (perf?.acceleration0100 ?? null), [perf?.acceleration0100])
  const horsepower = useMemo(() => (perf?.horsepower ?? null), [perf?.horsepower])
  const topSpeed = useMemo(() => (perf?.topSpeed ?? null), [perf?.topSpeed])

  const detailImageByOrder = useMemo(() => {
    const pickFirstDefault = (order: number) =>
      detailImages.find((img) => (img.sortOrder ?? 0) === order && (img.isDefault ?? false) === true)?.imageUrl || null

    const pickAllOrder = (order: number) =>
      detailImages
        .filter((img) => (img.sortOrder ?? 0) === order)
        .map((img) => img.imageUrl)
        .filter(Boolean) as string[]

    const pickAllDefaultFirst = (order: number) => {
      const defaults = detailImages
        .filter((img) => (img.sortOrder ?? 0) === order && (img.isDefault ?? false) === true)
        .map((img) => img.imageUrl)
        .filter(Boolean) as string[]

      const nonDefaults = detailImages
        .filter((img) => (img.sortOrder ?? 0) === order && (img.isDefault ?? false) !== true)
        .map((img) => img.imageUrl)
        .filter(Boolean) as string[]

      const combined = [...defaults, ...nonDefaults]
      return combined.length > 0 ? combined : pickAllOrder(order)
    }
    return {
      order1: pickFirstDefault(1),
      order2: pickFirstDefault(2),
      order3: pickFirstDefault(3),
      order4: pickFirstDefault(4),
      order5: pickAllDefaultFirst(5),
    }
  }, [detailImages])

  const availableBodyTypes = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const m of seriesModels) {
      if (!m.bodyTypeId || !m.bodyTypeName) continue
      const cur = map.get(m.bodyTypeId)
      if (cur) cur.count += 1
      else map.set(m.bodyTypeId, { id: m.bodyTypeId, name: m.bodyTypeName, count: 1 })
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [seriesModels])

  const bodyTypeFirstModelId = useMemo(() => {
    const map = new Map<number, number>()
    for (const m of seriesModels) {
      if (!m.bodyTypeId) continue
      if (!map.has(m.bodyTypeId)) map.set(m.bodyTypeId, m.id)
    }
    return map
  }, [seriesModels])

  const overviewBodyTypes = useMemo(() => {
    if (availableBodyTypes.length > 0) return availableBodyTypes
    if (model?.bodyTypeId && model?.bodyTypeName) {
      return [{ id: model.bodyTypeId, name: model.bodyTypeName, count: 1 }]
    }
    return []
  }, [availableBodyTypes, model?.bodyTypeId, model?.bodyTypeName])

  const filteredSeriesModels = useMemo(() => {
    if (!selectedBodyTypeId) return seriesModels
    return seriesModels.filter((m) => m.bodyTypeId === selectedBodyTypeId)
  }, [seriesModels, selectedBodyTypeId])

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  if (!model) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Model not found</div>
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <SiteHeader logoHref="/" />

      {/* Feedback Button */}
      <button
        className="
          fixed right-0 top-1/2 z-40
          h-[88px] w-[40px]
          -translate-y-1/2
          bg-blue-500
          text-white
          flex items-center justify-center
          transition-colors hover:bg-blue-600
        "
      >
        <span className="-rotate-90 whitespace-nowrap text-[16px] font-normal leading-none tracking-normal font-sans">
          Feedback
        </span>
      </button>

      {/* Section 2: Sticky Sub-nav */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 md:px-16 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-lg font-medium text-black">{model.name}</div>
          <div className="flex gap-6 items-center">
            <button className="text-sm font-medium text-black hover:text-gray-600 transition-colors">Change model variant</button>
            <button className="text-sm font-medium text-black hover:text-gray-600 transition-colors">Configure</button>
            <button className="text-sm font-medium text-black hover:text-gray-600 transition-colors">New and Used Inventory</button>
            <button className="text-sm font-medium text-black hover:text-gray-600 transition-colors">Compare</button>
          </div>
        </div>
      </div>

      {/* Section 1: Model Overview */}
      <section className="bg-gray-50 py-16 px-6 md:px-16 relative overflow-hidden">
        {/* Giant Watermark Text */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[150px] md:text-[250px] font-bold text-gray-200/50 whitespace-nowrap pointer-events-none select-none z-0 leading-none">
          {model.seriesName || model.name}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 mt-30">
          {/* Car Image */}
          <div className="flex justify-center mb-12 relative w-full h-96">
            <Image
              src={model.imageUrl || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-f6ZGZXvdMr8bDd5dyqOV3cImvzjVV7.png"}
              alt={model.name}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Body Design tabs — series-specific, navigates to first model per body type */}
          <div className="flex justify-center gap-8 mb-12 border-b border-gray-300 pb-4 flex-wrap">
            {overviewBodyTypes.length === 0 ? (
              <span className="text-[14px] text-mid-gray">No body designs available.</span>
            ) : (
              overviewBodyTypes.map((opt) => {
                const checked = model.bodyTypeId === opt.id
                const firstModelId = bodyTypeFirstModelId.get(opt.id) ?? (checked ? model.id : null)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => firstModelId && router.push(`/models/${firstModelId}`)}
                    disabled={!firstModelId}
                    aria-label={opt.name}
                    className={`text-sm cursor-pointer font-light tracking-wide transition-colors duration-300 pb-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      checked
                        ? 'text-black border-b-2 border-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {opt.name}
                  </button>
                )
              })
            )}
          </div>

          {/* Model Title */}
          <h2 className="text-5xl md:text-6xl font-light text-center mb-6 text-black">
            {model.name}
          </h2>

          {/* Fuel Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-sm uppercase">
              {model.fuelType || 'Gasoline'}
            </span>
          </div>

          {/* Price */}
          <p className="text-center text-lg font-light text-black">
            From $ {model.basePrice?.toLocaleString()}<sup>¹</sup>
          </p>
        </div>
      </section>

      {/* Section 3: Action Buttons */}
      <section className="bg-white py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="cursor-pointer px-8 py-3 bg-black text-white font-medium text-sm rounded-sm hover:bg-gray-900 transition-colors duration-300">
              Change model variant
            </button>
            <button onClick={() => router.push(`/configurator/${id}`)} className="cursor-pointer px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-sm hover:bg-gray-50 transition-colors duration-300">
              Build Your Porsche
            </button>
            <button className="cursor-pointer px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-sm hover:bg-gray-50 transition-colors duration-300">
              New and Used Inventory
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-600 font-light mt-8 max-w-3xl mx-auto">
            ¹ Manufacturer&apos;s Suggested Retail Price. Excludes options; taxes; title; registration; delivery, processing and handling fee; dealer charges; potential tariffs. Dealer sets actual selling price.
          </p>
        </div>
      </section>

      {/* Section 4: Specifications */}
      <section className="bg-gray-50 py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            {/* Left: Specs */}
            <div className="space-y-10 pl-0 md:pl-12 ml-30">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-light tracking-tight text-black tabular-nums">
                    <AnimatedNumber value={acceleration} decimals={1} durationMs={1100} />
                  </span>
                  <span className="text-2xl font-normal text-black">s</span>
                </div>
                <p className="text-sm font-light text-gray-500 mt-1">0 - 100 km/h</p>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-light tracking-tight text-black tabular-nums">
                    <AnimatedNumber value={horsepower} decimals={0} durationMs={1100} format={(v) => Math.round(v).toLocaleString()} />
                  </span>
                  <span className="text-2xl font-normal text-black">hp</span>
                </div>
                <p className="text-sm font-light text-gray-500 mt-1">Max. engine power</p>
              </div>

              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-light tracking-tight text-black tabular-nums">
                    <AnimatedNumber value={topSpeed} decimals={0} durationMs={1100} format={(v) => Math.round(v).toLocaleString()} />
                  </span>
                  <span className="text-2xl font-normal text-black">km/h</span>
                </div>
                <p className="text-sm font-light text-gray-500 mt-1">Top track speed (with summer tires)</p>
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-gray-200 text-black font-medium text-sm rounded hover:bg-light-gray-surface transition-colors duration-300">
                  Technical Specs
                </button>
              </div>
            </div>

            {/* Right: Car Image */}
            <div className="flex justify-center mr-30 relative w-full h-96">
              <Image
                src={
                  detailImageByOrder.order1 ||
                  model.imageUrl ||
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%203-FKTWtNO1C4aijNCErVSZL6Aj4hCywR.png"
                }
                alt={`${model.name} Front View`}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Which model is right for you? (911-style horizontal carousel) */}
      <section className="bg-white py-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between gap-6 mb-10 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              {availableBodyTypes.length === 0 ? (
                <span className="text-[14px] text-mid-gray">No body designs available.</span>
              ) : (
                availableBodyTypes.map((opt) => {
                  const checked = selectedBodyTypeId === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBodyTypeId(opt.id)}
                      aria-label={opt.name}
                      className={`px-4 cursor-pointer py-2 rounded-full text-[14px] font-semibold transition-colors ${
                        checked
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      {opt.name}
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                aria-label="Scroll left"
                className="cursor-pointer w-9 h-9 rounded-full border border-light-gray-surface hover:border-black flex items-center justify-center transition-colors"
                onClick={() => cardsScrollRef.current?.scrollBy({ left: -420, behavior: 'smooth' })}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Scroll right"
                className="cursor-pointer w-9 h-9 rounded-full border border-light-gray-surface hover:border-black flex items-center justify-center transition-colors"
                onClick={() => cardsScrollRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/*
          Full-bleed carousel: scroll track spans the viewport so cards can scroll
          into the side margins. pl/pr match the content inset so the first card
          lines up with the filter bar until the user scrolls (Porsche-style).
        */}
        <div className="relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw]">
          <div
            ref={cardsScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth pl-[max(1.5rem,calc((100vw-90rem)/2+1.5rem))] md:pl-[max(3rem,calc((100vw-90rem)/2+3rem))] pr-[max(1.5rem,calc((100vw-90rem)/2+1.5rem))] md:pr-[max(3rem,calc((100vw-90rem)/2+3rem))] scroll-pl-[max(1.5rem,calc((100vw-90rem)/2+1.5rem))] md:scroll-pl-[max(3rem,calc((100vw-90rem)/2+3rem))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredSeriesModels.map((m) => {
              const cardSpecs = seriesSpecsMap[m.id]
              const perf = cardSpecs?.performance
              const accel = perf?.acceleration0100 ?? null
              const hp = perf?.horsepower ?? null
              const top = perf?.topSpeed ?? null
              const driveValue = getDriveType(m, cardSpecs?.engine?.drivetrain)
              const transmissionLabel = formatTransmission(m.transmission)

              return (
                <div
                  key={m.id}
                  className="relative min-w-[340px] max-w-[340px] pt-[90px] snap-start shrink-0 group cursor-pointer"
                  onClick={() => router.push(`/models/${m.id}`)}
                >
                  {/* Floating car image */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[92%] h-[140px] z-10 pointer-events-none">
                    <div className="relative w-full h-full transform group-hover:scale-[1.03] transition-transform duration-500">
                      <Image
                        src={m.imageUrl || model.imageUrl || ''}
                        alt={m.name}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="bg-gray-100 rounded-t-[20px] rounded-b-[16px] px-6 pt-6 pb-5 flex flex-col min-h-[520px]">
                    <h4 className="text-[22px] font-bold text-black leading-tight mb-1">{m.name}</h4>
                    <p className="text-[15px] text-gray-800 font-medium mb-4">
                      From $ {m.basePrice?.toLocaleString()}<sup className="text-[11px]">¹</sup>
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-black text-white text-[12px] font-semibold rounded-full">
                        {m.year || '2026'}
                      </span>
                      {m.fuelType && (
                        <span className="px-3 py-1 bg-neutral-200 text-gray-800 text-[12px] font-semibold rounded-full">
                          {m.fuelType}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-neutral-200 text-gray-800 text-[12px] font-semibold rounded-full">
                        {driveValue}
                      </span>
                      {transmissionLabel && (
                        <span className="px-3 py-1 bg-neutral-200 text-gray-800 text-[12px] font-semibold rounded-full">
                          {transmissionLabel}
                        </span>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="space-y-5 flex-grow">
                      <div>
                        <div className="text-[26px] font-bold text-black leading-none tabular-nums">
                          <AnimatedNumber value={accel} decimals={1} durationMs={900} />
                          {accel != null && <span className="text-[20px] font-bold"> s</span>}
                        </div>
                        <div className="text-[12px] text-gray-500 font-semibold mt-1">0 - 60 mph</div>
                      </div>
                      <div>
                        <div className="text-[26px] font-bold text-black leading-none tabular-nums">
                          <AnimatedNumber
                            value={hp}
                            decimals={0}
                            durationMs={900}
                            format={(v) => Math.round(v).toLocaleString()}
                          />
                          {hp != null && <span className="text-[20px] font-bold"> hp</span>}
                        </div>
                        <div className="text-[12px] text-gray-500 font-semibold mt-1">Max. engine power</div>
                      </div>
                      <div>
                        <div className="text-[26px] font-bold text-black leading-none tabular-nums">
                          <AnimatedNumber
                            value={top}
                            decimals={0}
                            durationMs={900}
                            format={(v) => Math.round(v).toLocaleString()}
                          />
                          {top != null && <span className="text-[20px] font-bold"> mph</span>}
                        </div>
                        <div className="text-[12px] text-gray-500 font-semibold mt-1">
                          Top track speed (with summer tires)
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-6">
                      ¹ Manufacturer&apos;s Suggested Retail Price. Excludes options; taxes; title; registration; delivery, processing and handling fee; dealer charges; potential tariffs. Dealer sets actual selling price.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push(`/models/${m.id}`)}
                      className="mt-4 text-left text-[13px] font-bold text-black underline underline-offset-4 hover:text-gray-600 transition-colors"
                    >
                      Technical data and standard equipment
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 7: Detail image order 2 (Image 6) */}
      <section className="bg-white px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[28px] overflow-hidden bg-gray-100 relative h-[520px] mr-30">
            <Image
              src={detailImageByOrder.order2 || model.imageUrl || ''}
              alt={`${model.name} detail 2`}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section 8: Detail image order 3 (Image 7) */}
      <section className="bg-white px-6 md:px-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl font-light text-black mb-6">The one and always.</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed max-w-md">
              {model.shortDescription || 'A timeless silhouette refined through engineering, with performance and day-to-day usability in perfect balance.'}
            </p>
          </div>
          <div className="rounded-[28px] my-[-80px] overflow-hidden bg-gray-100 relative h-[720px] w-[600px]">
            <Image
              src={detailImageByOrder.order3 || model.imageUrl || ''}
              alt={`${model.name} detail 3`}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section 9: Detail image order 4 (Image 8) */}
      <section className="bg-white px-6 md:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[28px] overflow-hidden bg-gray-100 relative h-[520px] w-[700px] ml-50">
            <Image
              src={detailImageByOrder.order4 || model.imageUrl || ''}
              alt={`${model.name} detail 4`}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section 10: Horizontal gallery with order 5 (Images 9-10) */}
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth">
            {(detailImageByOrder.order5.length > 0 ? detailImageByOrder.order5 : [model.imageUrl || '']).map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="min-w-[520px] md:min-w-[720px] snap-start rounded-[28px] overflow-hidden bg-gray-100 relative h-[520px]"
              >
                <Image src={url} alt={`${model.name} detail 5 ${idx + 1}`} fill unoptimized className="object-cover" />
              </div>
            ))}
            {/* spacer to allow last card fully scroll into view */}
            <div className="min-w-[24px] md:min-w-[64px]" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
