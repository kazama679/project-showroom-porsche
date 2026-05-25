'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { ChevronRight, Plus, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { SiteHeader } from '@/components/features/layout/site-header'
import { carSeriesService, CarSeries } from '@/services/car-series'
import { carModelService, CarModelItem } from '@/services/car-model'

function ModelsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const seriesIdParam = searchParams?.get('seriesId')

  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [allModels, setAllModels] = useState<CarModelItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Collapsible accordion states
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['body', 'seats', 'drive', 'fuel'])
  
  // Selected filter states
  const [selectedBodyTypeIds, setSelectedBodyTypeIds] = useState<number[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedDrives, setSelectedDrives] = useState<string[]>([])
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([])

  const selectedSeriesId = seriesIdParam ? parseInt(seriesIdParam) : null
  const selectedSeriesName = selectedSeriesId 
    ? seriesList.find(s => s.id === selectedSeriesId)?.name || 'Models'
    : 'All Models'

  // Load all series
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

  // Load all models globally to perform high-fidelity client-side filtering and count calculations
  useEffect(() => {
    async function loadAllModels() {
      setLoading(true)
      try {
        // Fetch up to 200 models to ensure complete dataset availability
        const res = await carModelService.findAll('', 0, 200)
        setAllModels(res.content)
      } catch (error) {
        console.error('Failed to load models', error)
      } finally {
        setLoading(false)
      }
    }
    loadAllModels()
  }, [])

  // Dynamic helper to resolve drive type based on naming convention
  const getDriveType = (model: CarModelItem): string => {
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

  // Dynamic helper to resolve authentic acceleration specifications
  const getAcceleration = (name: string): string => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('carrera 4s')) return '3.4 s'
    if (nameLower.includes('carrera s')) return '3.5 s'
    if (nameLower.includes('carrera t')) return '4.3 s'
    if (nameLower.includes('carrera')) return '3.9 s'
    if (nameLower.includes('boxster style')) return '4.7 s'
    if (nameLower.includes('boxster')) return '4.9 s'
    if (nameLower.includes('cayman style')) return '4.7 s'
    if (nameLower.includes('cayman')) return '4.9 s'
    if (nameLower.includes('taycan')) return '2.4 s'
    if (nameLower.includes('panamera gts')) return '3.6 s'
    if (nameLower.includes('panamera')) return '4.1 s'
    if (nameLower.includes('cayenne s')) return '4.4 s'
    if (nameLower.includes('cayenne')) return '5.7 s'
    return '3.9 s'
  }

  // Dynamic helper to resolve authentic horsepower specifications
  const getHorsepower = (name: string): string => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('carrera 4s') || nameLower.includes('carrera s')) return '443 hp'
    if (nameLower.includes('carrera')) return '388 hp'
    if (nameLower.includes('boxster') || nameLower.includes('cayman')) return '300 hp'
    if (nameLower.includes('taycan')) return '402 hp'
    if (nameLower.includes('panamera')) return '348 hp'
    if (nameLower.includes('cayenne')) return '348 hp'
    if (nameLower.includes('macan')) return '261 hp'
    return '388 hp'
  }

  // Dynamic helper to resolve authentic top speed specifications
  const getTopSpeed = (name: string): string => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('carrera 4s')) return '190 mph'
    if (nameLower.includes('carrera s')) return '191 mph'
    if (nameLower.includes('carrera')) return '183 mph'
    if (nameLower.includes('boxster') || nameLower.includes('cayman')) return '170 mph'
    if (nameLower.includes('taycan')) return '161 mph'
    if (nameLower.includes('panamera')) return '169 mph'
    if (nameLower.includes('cayenne')) return '154 mph'
    if (nameLower.includes('macan')) return '144 mph'
    return '183 mph'
  }

  // Filter models based on the selected series first (for sidebar context counts)
  const seriesModels = useMemo(() => {
    if (selectedSeriesId === null) return allModels
    return allModels.filter(m => m.seriesId === selectedSeriesId)
  }, [allModels, selectedSeriesId])

  // Get dynamic Body Design options and counts based on the active series
  const bodyDesignOptions = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const m of seriesModels) {
      if (!m.bodyTypeId || !m.bodyTypeName) continue
      const current = map.get(m.bodyTypeId)
      if (current) {
        current.count += 1
      } else {
        map.set(m.bodyTypeId, { id: m.bodyTypeId, name: m.bodyTypeName, count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [seriesModels])

  // Auto-reset body selections if they are no longer valid in the new series
  useEffect(() => {
    setSelectedBodyTypeIds(prev => prev.filter(id => bodyDesignOptions.some(o => o.id === id)))
  }, [selectedSeriesId, bodyDesignOptions])

  // Calculate dynamic seats counts
  const seatsCounts = useMemo(() => {
    return {
      '2': seriesModels.filter(m => m.seats === 2).length,
      '4': seriesModels.filter(m => m.seats === 4).length,
      '4+1': seriesModels.filter(m => m.seats === 5).length,
      '5': seriesModels.filter(m => m.seats === 5).length,
    }
  }, [seriesModels])

  // Calculate dynamic drive counts
  const driveCounts = useMemo(() => {
    return {
      'Rear-Wheel Drive': seriesModels.filter(m => getDriveType(m) === 'Rear-Wheel Drive').length,
      'All-Wheel Drive': seriesModels.filter(m => getDriveType(m) === 'All-Wheel Drive').length,
    }
  }, [seriesModels])

  // Calculate dynamic fuel counts
  const fuelCounts = useMemo(() => {
    return {
      'Electric': seriesModels.filter(m => m.fuelType === 'Electric').length,
      'Gasoline': seriesModels.filter(m => m.fuelType === 'Gasoline').length,
      'Hybrid': seriesModels.filter(m => m.fuelType === 'Hybrid' || m.fuelType?.toLowerCase().includes('hybrid')).length,
    }
  }, [seriesModels])

  // Final filtered list of models to render in the grid
  const filteredModels = useMemo(() => {
    let result = seriesModels

    // Body Design Filter
    if (selectedBodyTypeIds.length > 0) {
      result = result.filter(m => m.bodyTypeId && selectedBodyTypeIds.includes(m.bodyTypeId))
    }

    // Seats Filter
    if (selectedSeats.length > 0) {
      result = result.filter(m => {
        if (!m.seats) return false
        return selectedSeats.some(s => {
          if (s === '2') return m.seats === 2
          if (s === '4') return m.seats === 4
          if (s === '4+1') return m.seats === 5
          if (s === '5') return m.seats === 5
          return false
        })
      })
    }

    // Drive Filter
    if (selectedDrives.length > 0) {
      result = result.filter(m => selectedDrives.includes(getDriveType(m)))
    }

    // Fueltype Filter
    if (selectedFuelTypes.length > 0) {
      result = result.filter(m => {
        if (!m.fuelType) return false
        return selectedFuelTypes.some(f => {
          if (f === 'Hybrid') return m.fuelType === 'Hybrid' || m.fuelType?.toLowerCase().includes('hybrid')
          return m.fuelType === f
        })
      })
    }

    return result
  }, [seriesModels, selectedBodyTypeIds, selectedSeats, selectedDrives, selectedFuelTypes])

  // Accordion toggle handler
  const toggleFilter = (filter: string) => {
    setExpandedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  // Series selection parameter router pusher
  const handleSeriesChange = (id: number | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (id) {
      params.set('seriesId', id.toString())
    } else {
      params.delete('seriesId')
    }
    router.push(`${pathname}?${params.toString()}`)
    // Reset secondary filters when swapping series to maintain intuitive user flows
    handleResetFilters()
  }

  const handleResetFilters = () => {
    setSelectedBodyTypeIds([])
    setSelectedSeats([])
    setSelectedDrives([])
    setSelectedFuelTypes([])
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      {/* Header */}
      <SiteHeader logoHref="/" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        {/* Page Title & Load Build */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <h2 className="text-[44px] leading-tight font-normal text-black tracking-tight">
            Model overview
          </h2>
          <div className="flex flex-col items-end gap-2.5">
            <span className="text-[14px] text-gray-500 font-normal">You already have a build?</span>
            <button className="cursor-pointer px-8 py-3.5 bg-black text-white font-medium text-[14px] rounded-[8px] hover:bg-gray-900 transition-all duration-300">
              Load saved build
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-3">
            <div className="space-y-6">
              
              {/* Model Series */}
              <div className="pb-6">
                <h3 className="text-black font-bold text-[15px] mb-4 tracking-wide uppercase">
                  Model series
                </h3>
                <div className="space-y-3.5">
                  <button
                    onClick={() => handleSeriesChange(null)}
                    className="cursor-pointer flex items-center gap-3.5 w-full group text-left"
                  >
                    <div
                      className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        selectedSeriesId === null
                          ? 'border-black'
                          : 'border-gray-300 group-hover:border-black'
                      }`}
                    >
                      {selectedSeriesId === null && (
                        <div className="w-[10px] h-[10px] rounded-full bg-black" />
                      )}
                    </div>
                    <span className={`text-[15px] transition-colors ${selectedSeriesId === null ? 'font-bold text-black' : 'font-normal text-gray-700 group-hover:text-black'}`}>
                      All <span className="text-mid-gray">({allModels.length})</span>
                    </span>
                  </button>
                  
                  {seriesList.map(series => {
                    const count = allModels.filter(m => m.seriesId === series.id).length
                    const isSelected = selectedSeriesId === series.id
                    return (
                      <button
                        key={series.id}
                        onClick={() => handleSeriesChange(series.id)}
                        className="cursor-pointer flex items-center gap-3.5 w-full group text-left"
                      >
                        <div
                          className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-black'
                              : 'border-gray-300 group-hover:border-black'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-[10px] h-[10px] rounded-full bg-black" />
                          )}
                        </div>
                        <span className={`text-[15px] transition-colors ${isSelected ? 'font-bold text-black' : 'font-normal text-gray-700 group-hover:text-black'}`}>
                          {series.name} <span className="text-mid-gray">({count})</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Body Design Filter */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleFilter('body')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-bold text-[15px] uppercase tracking-wide">
                    Body Design
                  </h4>
                  <ChevronUp
                    size={18}
                    strokeWidth={2}
                    className={`text-mid-gray group-hover:text-black transition-transform duration-300 ${
                      expandedFilters.includes('body') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('body') && (
                  <div className="space-y-3.5 pb-2">
                    {bodyDesignOptions.filter(opt => opt.count > 0).length === 0 ? (
                      <div className="text-[14px] text-mid-gray font-normal italic">
                        No body designs available.
                      </div>
                    ) : (
                      bodyDesignOptions.filter(opt => opt.count > 0).map((opt) => {
                        const checked = selectedBodyTypeIds.includes(opt.id)
                        return (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group select-none">
                            <span className="relative w-5 h-5 shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedBodyTypeIds(prev =>
                                    prev.includes(opt.id) ? prev.filter(x => x !== opt.id) : [...prev, opt.id]
                                  )
                                }}
                                aria-label={opt.name}
                                className="peer appearance-none w-5 h-5 rounded border border-gray-300 group-hover:border-black transition-all checked:border-black checked:bg-black cursor-pointer"
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
                            <span className="text-[15px] text-gray-700 font-normal group-hover:text-black transition-colors">
                              {opt.name} <span className="text-mid-gray">({opt.count})</span>
                            </span>
                          </label>
                        )
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Seats Filter */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleFilter('seats')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-bold text-[15px] uppercase tracking-wide">
                    Seats
                  </h4>
                  <ChevronUp
                    size={18}
                    strokeWidth={2}
                    className={`text-mid-gray group-hover:text-black transition-transform duration-300 ${
                      expandedFilters.includes('seats') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('seats') && (
                  <div className="space-y-3.5 pb-2">
                    {['2', '4', '4+1', '5']
                      .filter(seatOption => (seatsCounts[seatOption as keyof typeof seatsCounts] || 0) > 0)
                      .map(seatOption => {
                        const count = seatsCounts[seatOption as keyof typeof seatsCounts] || 0
                        const checked = selectedSeats.includes(seatOption)
                        return (
                          <label key={seatOption} className="flex items-center gap-3 cursor-pointer group select-none">
                            <span className="relative w-5 h-5 shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedSeats(prev =>
                                    prev.includes(seatOption) ? prev.filter(x => x !== seatOption) : [...prev, seatOption]
                                  )
                                }}
                                className="peer appearance-none w-5 h-5 rounded border border-gray-300 group-hover:border-black transition-all checked:border-black checked:bg-black cursor-pointer"
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
                            <span className="text-[15px] text-gray-700 font-normal group-hover:text-black transition-colors">
                              {seatOption} <span className="text-mid-gray">({count})</span>
                            </span>
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Drive Filter */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleFilter('drive')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-bold text-[15px] uppercase tracking-wide">
                    Drive
                  </h4>
                  <ChevronUp
                    size={18}
                    strokeWidth={2}
                    className={`text-mid-gray group-hover:text-black transition-transform duration-300 ${
                      expandedFilters.includes('drive') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('drive') && (
                  <div className="space-y-3.5 pb-2">
                    {['Rear-Wheel Drive', 'All-Wheel Drive']
                      .filter(driveOption => (driveCounts[driveOption as keyof typeof driveCounts] || 0) > 0)
                      .map(driveOption => {
                        const count = driveCounts[driveOption as keyof typeof driveCounts] || 0
                        const checked = selectedDrives.includes(driveOption)
                        return (
                          <label key={driveOption} className="flex items-center gap-3 cursor-pointer group select-none">
                            <span className="relative w-5 h-5 shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedDrives(prev =>
                                    prev.includes(driveOption) ? prev.filter(x => x !== driveOption) : [...prev, driveOption]
                                  )
                                }}
                                className="peer appearance-none w-5 h-5 rounded border border-gray-300 group-hover:border-black transition-all checked:border-black checked:bg-black cursor-pointer"
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
                            <span className="text-[15px] text-gray-700 font-normal group-hover:text-black transition-colors">
                              {driveOption} <span className="text-mid-gray">({count})</span>
                            </span>
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Fueltype Filter */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  onClick={() => toggleFilter('fuel')}
                  className="flex items-center justify-between w-full mb-4 group"
                >
                  <h4 className="text-black font-bold text-[15px] uppercase tracking-wide">
                    Fueltype
                  </h4>
                  <ChevronUp
                    size={18}
                    strokeWidth={2}
                    className={`text-mid-gray group-hover:text-black transition-transform duration-300 ${
                      expandedFilters.includes('fuel') ? '' : 'rotate-180'
                    }`}
                  />
                </button>
                {expandedFilters.includes('fuel') && (
                  <div className="space-y-3.5 pb-2">
                    {['Electric', 'Gasoline', 'Hybrid']
                      .filter(fuelOption => (fuelCounts[fuelOption as keyof typeof fuelCounts] || 0) > 0)
                      .map(fuelOption => {
                        const count = fuelCounts[fuelOption as keyof typeof fuelCounts] || 0
                        const checked = selectedFuelTypes.includes(fuelOption)
                        return (
                          <label key={fuelOption} className="flex items-center gap-3 cursor-pointer group select-none">
                            <span className="relative w-5 h-5 shrink-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedFuelTypes(prev =>
                                    prev.includes(fuelOption) ? prev.filter(x => x !== fuelOption) : [...prev, fuelOption]
                                  )
                                }}
                                className="peer appearance-none w-5 h-5 rounded border border-gray-300 group-hover:border-black transition-all checked:border-black checked:bg-black cursor-pointer"
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
                            <span className="text-[15px] text-gray-700 font-normal group-hover:text-black transition-colors">
                              {fuelOption} <span className="text-mid-gray">({count})</span>
                            </span>
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Reset Filter Button */}
              <div className="pt-6">
                <button
                  onClick={handleResetFilters}
                  className="cursor-pointer w-full text-center py-3.5 bg-gray-100 text-black font-semibold text-[14px] rounded-[8px] hover:bg-gray-200 active:bg-gray-300 transition-all duration-300 select-none"
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
              <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                <h3 className="text-[26px] font-bold text-black tracking-tight">
                  {selectedSeriesId ? `${selectedSeriesName} Model variants` : 'All Model variants'}
                </h3>
                <button 
                  onClick={() => router.push('/compare-models')}
                  className="cursor-pointer flex items-center gap-2.5 text-black hover:opacity-70 transition-opacity font-semibold text-[14px]"
                >
                  <span>↔</span>
                  <span>Compare model variants</span>
                </button>
              </div>

              {/* Model Cards Grid with expanded gap to accommodate floating images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-[150px]">
                {loading ? (
                  <div className="col-span-1 md:col-span-2 py-32 text-center text-gray-400 font-normal text-[16px] tracking-wide animate-pulse">
                    Loading models...
                  </div>
                ) : filteredModels.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 py-32 text-center text-gray-400 font-normal text-[16px] tracking-wide bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    No models found matching the active filters.
                  </div>
                ) : (
                  filteredModels.map(model => {
                    const accelerationValue = getAcceleration(model.name)
                    const horsepowerValue = getHorsepower(model.name)
                    const topSpeedValue = getTopSpeed(model.name)
                    const driveValue = getDriveType(model)
                    
                    return (
                      <div
                        key={model.id}
                        className="relative mt-[80px] pt-[115px] rounded-[32px] bg-white border border-gray-100/80 flex flex-col h-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group overflow-visible"
                      >
                        {/* Floating absolute positioned car image with balanced shift */}
                        <div className="absolute top-[-95px] left-1/2 -translate-x-1/2 w-[90%] max-w-[560px] h-[180px] z-10 pointer-events-none">
                          <div className="w-full h-full relative transform group-hover:scale-[1.04] transition-transform duration-500 ease-out">
                            <Image
                              src={model.imageUrl || 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop'}
                              alt={model.name}
                              fill
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="px-8 pb-8 flex flex-col flex-grow bg-white">
                          
                          {/* Model Name & Price */}
                          <div className="mb-5">
                            <h4 className="text-[22px] font-bold text-black mb-1 leading-tight tracking-tight">
                              {model.name}
                            </h4>
                            <p className="text-gray-800 text-[15px] font-medium">
                              From $ {model.basePrice?.toLocaleString()}<span className="text-[11px] align-top font-bold">¹</span>
                            </p>
                          </div>

                          {/* Dynamic Badges/Pills exactly like mockup */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {/* Year - Dark Badge */}
                            <span className="px-3 py-1 bg-black text-white text-[12px] font-semibold rounded-full select-none">
                              {model.year || '2026'}
                            </span>
                            
                            {/* Fuel type - Grey Badge */}
                            {model.fuelType && (
                              <span className="px-3 py-1 bg-neutral-100 text-gray-800 text-[12px] font-semibold rounded-full select-none">
                                {model.fuelType}
                              </span>
                            )}
                            
                            {/* Drive type - Grey Badge */}
                            <span className="px-3 py-1 bg-neutral-100 text-gray-800 text-[12px] font-semibold rounded-full select-none">
                              {driveValue}
                            </span>
                            
                            {/* Transmission type - Grey Badge */}
                            {model.transmission && (
                              <span className="px-3 py-1 bg-neutral-100 text-gray-800 text-[12px] font-semibold rounded-full select-none truncate max-w-[120px]" title={model.transmission}>
                                {model.transmission.includes('(') ? model.transmission.split(' ')[0] : model.transmission}
                              </span>
                            )}
                          </div>

                          {/* Specs Section - Stacked matching official Porsche layout */}
                          <div className="mt-auto pt-6 border-t border-gray-100 space-y-5 mb-8">
                            {/* 1. Acceleration */}
                            <div className="flex flex-col">
                              <span className="text-[26px] font-bold text-black leading-none tracking-tight">
                                {accelerationValue}
                              </span>
                              <span className="text-[12px] text-gray-500 font-semibold tracking-wide mt-1 select-none">
                                0 - 60 mph
                              </span>
                            </div>

                            {/* 2. Horsepower */}
                            <div className="flex flex-col">
                              <span className="text-[26px] font-bold text-black leading-none tracking-tight">
                                {horsepowerValue}
                              </span>
                              <span className="text-[12px] text-gray-500 font-semibold tracking-wide mt-1 select-none">
                                Max. engine power
                              </span>
                            </div>

                            {/* 3. Top Track Speed */}
                            <div className="flex flex-col">
                              <span className="text-[26px] font-bold text-black leading-none tracking-tight">
                                {topSpeedValue}
                              </span>
                              <span className="text-[12px] text-gray-500 font-semibold tracking-wide mt-1 select-none">
                                {model.name.toLowerCase().includes('taycan') ? 'Top track speed' : 'Top track speed (with summer tires)'}
                              </span>
                            </div>
                          </div>

                          {/* Footer and Interactive buttons */}
                          <div className="mt-auto">
                            <p className="text-gray-400 text-[11px] font-normal leading-relaxed mb-4 select-none">
                              ¹ Manufacturer&apos;s Suggested Retail Price. Excludes options; taxes; title; registration; delivery, processing and handling fee; dealer charges; potential tariffs. Dealer sets actual selling price.
                            </p>
                            
                            <a href="#" className="text-black text-[13px] font-bold underline underline-offset-4 mb-6 block hover:text-gray-600 transition-colors select-none">
                              Technical data and standard equipment
                            </a>

                            <div className="flex gap-3.5 mb-5">
                              <button 
                                onClick={() => router.push(`/models/${model.id}`)}
                                className="cursor-pointer flex-1 bg-black text-white py-3.5 rounded-[8px] text-[14px] font-bold hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
                              >
                                Explore in Detail
                              </button>
                              <button 
                                onClick={() => router.push(`/configurator/${model.id}`)}
                                className="cursor-pointer flex-1 bg-gray-100 text-black py-3.5 rounded-[8px] text-[14px] font-bold hover:bg-gray-200 active:scale-[0.98] transition-all select-none"
                              >
                                Configure
                              </button>
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer group w-fit select-none">
                              <input 
                                type="checkbox"
                                className="w-[18px] h-[18px] rounded border border-gray-300 group-hover:border-black transition-colors shrink-0 cursor-pointer"
                              />
                              <span className="text-[13px] text-gray-700 group-hover:text-black font-semibold transition-colors">Compare</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )
                  })
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
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>}>
      <ModelsContent />
    </Suspense>
  )
}
