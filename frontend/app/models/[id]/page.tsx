'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Menu, Globe, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { carModelService, CarModelItem } from '@/lib/car-model'
import { carSpecService, CarSpecsDTO } from '@/lib/car-specs'
import { carImageService, CarImage } from '@/lib/car-image'
import { AnimatedNumber } from '@/components/ui/animated-number'

const variants = [
  'Coupé',
  'Cabriolet',
  'Targa',
  'GT',
  'Turbo Coupé',
  'Turbo Cabriolet',
  'GT Cabriolet'
]

export default function ModelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [model, setModel] = useState<CarModelItem | null>(null)
  const [specs, setSpecs] = useState<CarSpecsDTO | null>(null)
  const [detailImages, setDetailImages] = useState<CarImage[]>([])
  const [seriesModels, setSeriesModels] = useState<CarModelItem[]>([])
  const [seriesPerfMap, setSeriesPerfMap] = useState<Record<number, CarSpecsDTO['performance']>>({})
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState('Coupé')
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

        // default selected body type is the first available for this series
        const firstBodyTypeId = list.find((m) => m.bodyTypeId)?.bodyTypeId ?? null
        setSelectedBodyTypeId((prev) => prev ?? firstBodyTypeId)
      } catch (e) {
        console.error('Failed to load series models:', e)
        setSeriesModels([])
      }
    }
    loadSeriesModels()
  }, [model?.seriesId])

  useEffect(() => {
    async function loadPerfForCards() {
      const list = seriesModels.slice(0, 12)
      if (list.length === 0) return
      try {
        const results = await Promise.all(
          list.map(async (m) => {
            try {
              const s = await carSpecService.getSpecsByCarModelId(m.id)
              return [m.id, s.performance] as const
            } catch {
              return [m.id, null] as const
            }
          })
        )
        const next: Record<number, CarSpecsDTO['performance']> = {}
        for (const [modelId, perf] of results) next[modelId] = perf
        setSeriesPerfMap(next)
      } catch (e) {
        console.error('Failed to load series specs:', e)
      }
    }
    loadPerfForCards()
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
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 py-6">
          <button className="text-black flex items-center gap-2 md:hidden hover:opacity-75 transition-opacity">
            <Menu size={20} />
            <span className="text-xs font-medium">Menu</span>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-black text-base font-medium tracking-[0.15em]">PORSCHE</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <button aria-label="Language" className="text-black hidden md:block hover:opacity-75 transition-opacity">
              <Globe size={18} />
            </button>
            <button aria-label="Account" className="text-black hover:opacity-75 transition-opacity">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Button */}
      <button className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-8 font-medium text-sm tracking-wider z-40 hover:bg-blue-700 transition-colors writing-vertical-rl">
        Feedback
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

          {/* Variant Tabs */}
          <div className="flex justify-center gap-8 mb-12 border-b border-gray-300 pb-4 flex-wrap">
            {variants.map((variant) => (
              <button
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                className={`text-sm font-light tracking-wide transition-colors duration-300 pb-2 ${
                  selectedVariant === variant
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {variant}
              </button>
            ))}
          </div>

          {/* Model Title */}
          <h2 className="text-5xl md:text-6xl font-light text-center mb-6 text-black">
            {model.name}
          </h2>

          {/* Fuel Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-[2px] uppercase">
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
            <button className="px-8 py-3 bg-black text-white font-medium text-sm rounded-[2px] hover:bg-gray-900 transition-colors duration-300">
              Change model variant
            </button>
            <button onClick={() => router.push(`/configurator`)} className="px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors duration-300">
              Build Your Porsche
            </button>
            <button className="px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors duration-300">
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
                <button className="px-6 py-3 bg-[#E5E5E5] text-black font-medium text-sm rounded hover:bg-[#D2D2D2] transition-colors duration-300">
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

      {/* Section 6: Which model is right for you? (Images 3-5 style) */}
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-light text-black text-center mb-10">
            Which {model.seriesName || 'model'} is the right one for you?
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Filters */}
            <aside className="lg:col-span-3">
              <div className="border border-[#EBEBEB] rounded-[16px] p-6 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <h4 className="text-black font-semibold text-[15px] mb-4">Body Design</h4>

                {availableBodyTypes.length === 0 ? (
                  <div className="text-[14px] text-[#8F8F8F]">No body designs available.</div>
                ) : (
                  <div className="inline-flex flex-wrap gap-2 rounded-[999px] bg-[#F5F5F5] p-1" aria-label="Body Design">
                    {availableBodyTypes.map((opt) => {
                      const checked = selectedBodyTypeId === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedBodyTypeId(opt.id)}
                          aria-label={opt.name}
                          className={`px-4 py-2 rounded-[999px] text-[13px] font-medium transition-colors ${
                            checked ? 'bg-black text-white' : 'text-black hover:bg-white'
                          }`}
                        >
                          {opt.name} <span className={checked ? 'text-white/80' : 'text-[#8F8F8F]'}>({opt.count})</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* Cards */}
            <div className="lg:col-span-9">
              <div className="flex items-center justify-end gap-3 mb-4">
                <button
                  aria-label="Scroll left"
                  className="w-10 h-10 rounded-full border border-[#D2D2D2] hover:border-black flex items-center justify-center transition-colors"
                  onClick={() => cardsScrollRef.current?.scrollBy({ left: -520, behavior: 'smooth' })}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Scroll right"
                  className="w-10 h-10 rounded-full border border-[#D2D2D2] hover:border-black flex items-center justify-center transition-colors"
                  onClick={() => cardsScrollRef.current?.scrollBy({ left: 520, behavior: 'smooth' })}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div
                ref={cardsScrollRef}
                className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
              >
                {filteredSeriesModels.map((m) => {
                  const perf = seriesPerfMap[m.id]
                  const accel = perf?.acceleration0100 ?? null
                  const hp = perf?.horsepower ?? null
                  const top = perf?.topSpeed ?? null
                  return (
                    <div
                      key={m.id}
                      className="min-w-[320px] max-w-[320px] bg-[#F5F5F5] rounded-[24px] p-6 snap-start"
                    >
                      <div className="flex justify-center mb-3 relative w-full h-24">
                        <Image
                          src={m.imageUrl || model.imageUrl || ''}
                          alt={m.name}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                      <div className="text-[20px] font-normal text-black mb-1">{m.name}</div>
                      <div className="text-[#8F8F8F] text-[12px] mb-4">
                        From $ {m.basePrice?.toLocaleString()}<sup>¹</sup>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <div className="text-[20px] font-normal text-black tabular-nums">
                            <AnimatedNumber value={accel} decimals={1} durationMs={900} /> <span className="text-[14px]">s</span>
                          </div>
                          <div className="text-[#8F8F8F] text-[11px]">0 - 100 km/h</div>
                        </div>
                        <div>
                          <div className="text-[20px] font-normal text-black tabular-nums">
                            <AnimatedNumber value={hp} decimals={0} durationMs={900} /> <span className="text-[14px]">hp</span>
                          </div>
                          <div className="text-[#8F8F8F] text-[11px]">Max. engine power</div>
                        </div>
                        <div>
                          <div className="text-[20px] font-normal text-black tabular-nums">
                            <AnimatedNumber value={top} decimals={0} durationMs={900} /> <span className="text-[14px]">km/h</span>
                          </div>
                          <div className="text-[#8F8F8F] text-[11px]">Top track speed</div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => router.push(`/models/${m.id}`)}
                          className="flex-1 bg-black text-white py-3 rounded-[8px] text-[13px] font-medium hover:bg-gray-900 transition-colors"
                        >
                          Explore in Detail
                        </button>
                        <button className="flex-1 bg-white border border-black text-black py-3 rounded-[8px] text-[13px] font-medium hover:bg-gray-50 transition-colors">
                          Configure
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => router.push('/compare-models')}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#EBEBEB] text-black font-medium text-[14px] rounded-[999px] hover:bg-[#D2D2D2] transition-colors"
                >
                  <span>→</span>
                  <span>Compare details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Detail image order 2 (Image 6) */}
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[28px] overflow-hidden bg-[#F5F5F5] relative h-[520px]">
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
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl font-light text-black mb-6">The one and always.</h3>
            <p className="text-[14px] text-gray-700 leading-relaxed max-w-md">
              {model.shortDescription || 'A timeless silhouette refined through engineering, with performance and day-to-day usability in perfect balance.'}
            </p>
          </div>
          <div className="rounded-[28px] overflow-hidden bg-[#F5F5F5] relative h-[520px]">
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
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[28px] overflow-hidden bg-[#F5F5F5] relative h-[520px]">
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
                className="min-w-[520px] md:min-w-[720px] snap-start rounded-[28px] overflow-hidden bg-[#F5F5F5] relative h-[520px]"
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
