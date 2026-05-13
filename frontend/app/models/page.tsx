'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { Menu, Globe, User, ChevronRight, Plus, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { carSeriesService, CarSeries } from '@/lib/car-series'
import { carModelService, CarModelItem } from '@/lib/car-model'

function ModelsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const seriesIdParam = searchParams.get('seriesId')

  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [models, setModels] = useState<CarModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['body', 'seats', 'drive', 'fuel'])
  const [selectedBodyTypeIds, setSelectedBodyTypeIds] = useState<number[]>([])

  const selectedSeriesId = seriesIdParam ? parseInt(seriesIdParam) : null
  const selectedSeriesName = selectedSeriesId 
    ? seriesList.find(s => s.id === selectedSeriesId)?.name || 'Models'
    : 'All Models'

  useEffect(() => {
    async function loadSeries() {
      try {
        const res = await carSeriesService.findAll('', 0, 100)
        setSeriesList(res.content)
      } catch (error) {
        console.error('Failed to load series', error)
      }
    }
    loadSeries()
  }, [])

  useEffect(() => {
    async function loadModels() {
      setLoading(true)
      try {
        const res = await carModelService.findAll('', 0, 100, selectedSeriesId || undefined)
        setModels(res.content)
      } catch (error) {
        console.error('Failed to load models', error)
      } finally {
        setLoading(false)
      }
    }
    loadModels()
  }, [selectedSeriesId])

  const bodyDesignOptions = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const m of models) {
      if (!m.bodyTypeId || !m.bodyTypeName) continue
      const current = map.get(m.bodyTypeId)
      if (current) current.count += 1
      else map.set(m.bodyTypeId, { id: m.bodyTypeId, name: m.bodyTypeName, count: 1 })
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [models])

  useEffect(() => {
    // Keep selection valid when switching series
    setSelectedBodyTypeIds((prev) => prev.filter((id) => bodyDesignOptions.some((o) => o.id === id)))
  }, [selectedSeriesId, bodyDesignOptions])

  const filteredModels = useMemo(() => {
    if (selectedBodyTypeIds.length === 0) return models
    return models.filter((m) => m.bodyTypeId && selectedBodyTypeIds.includes(m.bodyTypeId))
  }, [models, selectedBodyTypeIds])

  const toggleFilter = (filter: string) => {
    setExpandedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const handleSeriesChange = (id: number | null) => {
    const params = new URLSearchParams(searchParams)
    if (id) {
      params.set('seriesId', id.toString())
    } else {
      params.delete('seriesId')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">
      {/* Header */}
      <header className="bg-transparent border-b-0 pt-6">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <button className="text-black flex items-center gap-3 hover:opacity-75 transition-opacity">
            <Menu size={20} strokeWidth={1.5} />
            <span className="text-[14px] font-normal tracking-wide">Menu</span>
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-black text-xl font-medium tracking-[0.25em] ml-[0.25em]">
              <Link className="cursor-pointer" href="/">PORSCHE</Link>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button aria-label="Language" className="text-black hidden md:block hover:opacity-75 transition-opacity">
              <Globe size={20} strokeWidth={1.5} />
            </button>
            <button aria-label="Account" className="text-black hover:opacity-75 transition-opacity">
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        {/* Page Title & Load Build */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <h2 className="text-[44px] leading-tight font-normal text-black tracking-tight">
            Model overview
          </h2>
          <div className="flex flex-col items-end gap-3">
            <span className="text-[15px] text-black">You already have a build?</span>
            <button className="cursor-pointer px-8 py-3.5 bg-black text-white font-medium text-[14px] rounded-[4px] hover:bg-gray-900 transition-colors">
              Load saved build
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-3">
            <div className="space-y-6">
              {/* Model Series */}
              <div className="pb-4">
                <h3 className="text-black font-semibold text-[15px] mb-4">
                  Model series
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSeriesChange(null)}
                    className="cursor-pointer flex items-center gap-3 w-full group"
                  >
                    <div
                      className={`w-6 h-6 rounded-full transition-all shrink-0 ${
                        selectedSeriesId === null
                          ? 'border-[7px] border-black'
                          : 'border border-[#D2D2D2] group-hover:border-black'
                      }`}
                    />
                    <span className="text-black text-[15px] font-normal flex gap-1">
                      All <span className="text-[#8F8F8F]">(...)</span>
                    </span>
                  </button>
                  {seriesList.map(series => (
                    <button
                      key={series.id}
                      onClick={() => handleSeriesChange(series.id)}
                      className="cursor-pointer flex items-center gap-3 w-full group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full transition-all shrink-0 ${
                          selectedSeriesId === series.id
                            ? 'border-[7px] border-black'
                            : 'border border-[#D2D2D2] group-hover:border-black'
                        }`}
                      />
                      <span className="text-black text-[15px] font-normal flex gap-1">
                        {series.name} <span className="text-[#8F8F8F]">({series.models?.length || 0})</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Design Filter */}
              <div className="border-t border-[#D2D2D2] pt-6">
                <button
                  onClick={() => toggleFilter('body')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-semibold text-[15px]">
                    Body Design
                  </h4>
                  <ChevronUp
                    size={20}
                    strokeWidth={1.5}
                    className={`text-[#8F8F8F] group-hover:text-black transition-transform ${
                      expandedFilters.includes('body') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('body') && (
                  <div className="space-y-3 pb-2">
                    {bodyDesignOptions.length === 0 ? (
                      <div className="text-[14px] text-[#8F8F8F] font-normal">
                        No body designs available for this series.
                      </div>
                    ) : (
                      bodyDesignOptions.map((opt) => {
                        const checked = selectedBodyTypeIds.includes(opt.id)
                        return (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <span className="relative w-5 h-5 shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedBodyTypeIds((prev) =>
                                    prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                                  )
                                }}
                                aria-label={opt.name}
                                className="peer appearance-none w-5 h-5 rounded-[4px] border border-[#D2D2D2] group-hover:border-black transition-colors checked:border-black checked:bg-black cursor-pointer"
                              />
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                            <span className="text-[15px] text-black">
                              {opt.name} <span className="text-[#8F8F8F]">({opt.count})</span>
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Seats Filter */}
              <div className="border-t border-[#D2D2D2] pt-6">
                <button
                  onClick={() => toggleFilter('seats')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-semibold text-[15px]">
                    Seats
                  </h4>
                  <ChevronUp
                    size={20}
                    strokeWidth={1.5}
                    className={`text-[#8F8F8F] group-hover:text-black transition-transform ${
                      expandedFilters.includes('seats') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('seats') && (
                  <div className="space-y-3 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-black bg-black transition-colors shrink-0 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-black">4+1 <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-[#D2D2D2] group-hover:border-black transition-colors shrink-0 flex items-center justify-center">
                      </div>
                      <span className="text-[15px] text-black">5 <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                  </div>
                )}
              </div>

              {/* Drive Filter */}
              <div className="border-t border-[#D2D2D2] pt-6">
                <button
                  onClick={() => toggleFilter('drive')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-semibold text-[15px]">
                    Drive
                  </h4>
                  <ChevronUp
                    size={20}
                    strokeWidth={1.5}
                    className={`text-[#8F8F8F] group-hover:text-black transition-transform ${
                      expandedFilters.includes('drive') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('drive') && (
                  <div className="space-y-3 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-[#8F8F8F] bg-[#8F8F8F] transition-colors shrink-0 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-[#8F8F8F]">All-Wheel Drive <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                  </div>
                )}
              </div>

              {/* Fueltype Filter */}
              <div className="border-t border-[#D2D2D2] pt-6">
                <button
                  onClick={() => toggleFilter('fuel')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-semibold text-[15px]">
                    Fueltype
                  </h4>
                  <ChevronUp
                    size={20}
                    strokeWidth={1.5}
                    className={`text-[#8F8F8F] group-hover:text-black transition-transform ${
                      expandedFilters.includes('fuel') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('fuel') && (
                  <div className="space-y-3 pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-black bg-black transition-colors shrink-0 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-black">Electric <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-black bg-black transition-colors shrink-0 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-black">Gasoline <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-[4px] border border-[#D2D2D2] group-hover:border-black transition-colors shrink-0 flex items-center justify-center">
                      </div>
                      <span className="text-[15px] text-black">Hybrid <span className="text-[#8F8F8F]">(0)</span></span>
                    </label>
                  </div>
                )}
              </div>

              {/* Reset Filter Button */}
              <div className="pt-6">
                <button
                  onClick={() => setSelectedBodyTypeIds([])}
                  className="px-8 py-3.5 bg-[#EBEBEB] text-black font-medium text-[14px] rounded-[4px] hover:bg-[#D2D2D2] transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">

            {/* Model Variants Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[28px] font-normal text-black">
                  {selectedSeriesId ? `${selectedSeriesName} Model variants` : 'All Model variants'}
                </h3>
                <button className="cursor-pointer flex items-center gap-3 text-black hover:opacity-75 transition-opacity font-normal text-[15px]">
                  <span>↔</span>
                  <span>Compare model variants</span>
                </button>
              </div>

              {/* Model Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                  <div className="col-span-1 md:col-span-2 py-20 text-center text-gray-500 font-light">
                    Loading models...
                  </div>
                ) : filteredModels.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 py-20 text-center text-gray-500 font-light">
                    No models found in this series.
                  </div>
                ) : (
                  filteredModels.map(model => (
                    <div
                      key={model.id}
                      className="bg-white rounded-[32px] overflow-hidden flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
                    >
                      {/* Car Image */}
                      <div className="w-full pt-12 px-8 pb-4 flex justify-center bg-white relative">
                        <Image
                          src={model.imageUrl || 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop'}
                          alt={model.name}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>

                      {/* Card Content */}
                      <div className="px-10 pb-10 flex flex-col flex-grow">
                        {/* Model Name & Price */}
                        <div className="mb-6">
                          <h4 className="text-[24px] font-normal text-black mb-1.5 leading-tight">
                            {model.name}
                          </h4>
                          <p className="text-[#8F8F8F] text-[15px] font-normal">
                            From $ {model.basePrice?.toLocaleString()}<span className="text-[11px] align-top">1</span>
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-8">
                          <span className="px-3.5 py-1.5 bg-[#188038] text-white text-[12px] font-medium rounded-full">New</span>
                          <span className="px-3.5 py-1.5 bg-black text-white text-[12px] font-medium rounded-full">{model.year || '2026'}</span>
                          {model.fuelType && <span className="px-3.5 py-1.5 bg-[#F5F5F5] text-black text-[12px] font-medium rounded-full">{model.fuelType}</span>}
                          {model.transmission && <span className="px-3.5 py-1.5 bg-[#F5F5F5] text-black text-[12px] font-medium rounded-full">{model.transmission}</span>}
                          <span className="px-3.5 py-1.5 bg-[#F5F5F5] text-black text-[12px] font-medium rounded-full">Automatic</span>
                        </div>

                        {/* Specs */}
                        <div className="space-y-8 flex-grow">
                          <div>
                            <p className="text-[24px] font-normal text-black mb-1">
                              {model.fuelType || '—'}
                            </p>
                            <p className="text-[#8F8F8F] text-[13px] font-normal">
                              Fuel type
                            </p>
                          </div>

                          <div>
                            <p className="text-[24px] font-normal text-black mb-1">
                              {model.transmission || '—'}
                            </p>
                            <p className="text-[#8F8F8F] text-[13px] font-normal">
                              Transmission
                            </p>
                          </div>

                          <div>
                            <p className="text-[24px] font-normal text-black mb-1">
                              {model.seats || '—'}
                            </p>
                            <p className="text-[#8F8F8F] text-[13px] font-normal">
                              Seats
                            </p>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-8">
                          <p className="text-[#8F8F8F] text-[11px] font-normal leading-relaxed mb-4">
                            ¹ Manufacturer&apos;s Suggested Retail Price. Excludes options; taxes; title; registration; delivery, processing and handling fee; dealer charges; potential tariffs. Dealer sets actual selling price.
                          </p>
                          
                          <a href="#" className="text-black text-[14px] font-medium underline underline-offset-4 mb-8 block hover:text-gray-600 transition-colors">
                            Technical data and standard equipment
                          </a>

                          <div className="flex gap-4 mb-6">
                            <button 
                              onClick={() => router.push(`/models/${model.id}`)}
                              className="cursor-pointer flex-1 bg-black text-white py-4 rounded-[4px] text-[15px] font-medium hover:bg-gray-800 transition-colors"
                            >
                              Explore in Detail
                            </button>
                            <button className="cursor-pointer flex-1 bg-[#EBEBEB] text-black py-4 rounded-[4px] text-[15px] font-medium hover:bg-[#D2D2D2] transition-colors">
                              Configure
                            </button>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer group w-fit">
                            <div className="w-[18px] h-[18px] rounded-[3px] border border-[#D2D2D2] group-hover:border-black transition-colors shrink-0" />
                            <span className="text-[14px] text-black">Compare</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ModelOverviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">Loading...</div>}>
      <ModelsContent />
    </Suspense>
  )
}
