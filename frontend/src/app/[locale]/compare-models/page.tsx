'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { carModelService, CarModelItem } from '@/services/car-model'
import { carSpecService, CarSpecsDTO } from '@/services/car-specs'
import { carSeriesService, CarSeries } from '@/services/car-series'
import { configuratorService } from '@/services/configurator'

import { SiteHeader } from '@/components/features/layout/site-header'

// Localized strings
const LOCAL_I18N = {
  vi: {
    differences: 'Điểm khác biệt giữa các mẫu xe là gì?',
    nameMeaning: 'Tên và ý nghĩa',
    formDesign: 'Hình thức và thiết kế',
    techSpecs: 'Thông số kỹ thuật',
    showDifferences: 'Chỉ hiển thị những điểm khác biệt',
    compareSpecs: 'Thông số so sánh',
    seats: 'Số lượng chỗ ngồi',
    maxPower: 'Công suất tối đa',
    topSpeed: 'Tốc độ tối đa',
    accel: 'Tăng tốc 0-60 mph (0-100 km/h)',
    fuelType: 'Loại nhiên liệu',
    driveType: 'Hệ dẫn động',
    transmission: 'Hộp số',
    chooseModel: 'Chọn mẫu xe',
    changeModel: 'Thay đổi mẫu xe',
    selectText: 'Chọn',
    allSeries: 'Tất cả dòng xe',
    buildPorsche: 'Xây dựng Porsche của bạn',
    discoverStock: 'Khám phá xe có sẵn',
    from: 'Từ',
    selectTwoModels: 'Chọn hai mẫu xe Porsche',
    availableModels: 'mẫu xe có sẵn',
    bodyType: 'Kiểu dáng thân xe',
    engineType: 'Loại động cơ',
    compareModels: 'So sánh mẫu xe',
    helpDeciding: 'Bạn cần giúp đỡ quyết định? Bây giờ bạn có thể so sánh các mẫu xe yêu thích của mình với nhau.',
    getAdvice: 'Nhận tư vấn',
    close: 'Đóng',
    pickingForSlot: 'Đang chọn cho vị trí',
    noModels: 'Không tìm thấy mẫu xe phù hợp.',
    standardEquipment: 'Trang thiết bị tiêu chuẩn',
  },
  en: {
    differences: 'What are the differences between the models?',
    nameMeaning: 'Name and meaning',
    formDesign: 'Form and design',
    techSpecs: 'Technical specs',
    showDifferences: 'Show differences only',
    compareSpecs: 'Comparison specs',
    seats: 'Number of seats',
    maxPower: 'Max engine power',
    topSpeed: 'Top speed',
    accel: '0-60 mph acceleration',
    fuelType: 'Fuel type',
    driveType: 'Drivetrain',
    transmission: 'Transmission',
    chooseModel: 'Choose a model',
    changeModel: 'Change model',
    selectText: 'Select',
    allSeries: 'All series',
    buildPorsche: 'Build Your Porsche',
    discoverStock: 'Discover stock vehicles',
    from: 'From',
    selectTwoModels: 'Choose two Porsche models',
    availableModels: 'available models',
    bodyType: 'Body Type',
    engineType: 'Engine Type',
    compareModels: 'Model Comparison',
    helpDeciding: 'Do you need help deciding? Now you can compare your favourites with each other.',
    getAdvice: 'Get advice',
    close: 'Close',
    pickingForSlot: 'Picking model for slot',
    noModels: 'No models found.',
    standardEquipment: 'Standard Equipment',
  }
}

type ModelData = { model: CarModelItem; specs: CarSpecsDTO, equipment: any[] }

function CompareModelsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale() as 'vi' | 'en'
  const tl = LOCAL_I18N.vi

  const m1IdParam = searchParams?.get('m1')
  const m2IdParam = searchParams?.get('m2')

  const [m1Data, setM1Data] = useState<ModelData | null>(null)
  const [m2Data, setM2Data] = useState<ModelData | null>(null)
  const [loading, setLoading] = useState(true)

  const [allModels, setAllModels] = useState<CarModelItem[]>([])
  const [allSeries, setAllSeries] = useState<CarSeries[]>([])
  const [selectedModalSeries, setSelectedModalSeries] = useState<number | null>(null)
  const [showModal, setShowModal] = useState<number | null>(null) // null = closed, 1 = replace m1, 2 = replace m2

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    name: false,
    form: false,
    specs: true,
  })

  // Fetch baseline modal data
  useEffect(() => {
    async function loadGlobals() {
      try {
        const [modelsRes, seriesRes] = await Promise.all([
          carModelService.findAll('', 0, 100),
          carSeriesService.findAll('', 0, 100)
        ])
        setAllModels(modelsRes.content)
        setAllSeries(seriesRes.content)
      } catch (e) {
        console.error('Failed to load global comparison data', e)
      }
    }
    loadGlobals()
  }, [])

  // Fetch detailed data for selected models
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const p1 = m1IdParam
          ? Promise.all([
              carModelService.findById(parseInt(m1IdParam)),
              carSpecService.getSpecsByCarModelId(parseInt(m1IdParam)).catch(() => null),
              configuratorService.getByCarModelId(parseInt(m1IdParam)).catch(() => null)
            ])
          : Promise.resolve([null, null, null])

        const p2 = m2IdParam
          ? Promise.all([
              carModelService.findById(parseInt(m2IdParam)),
              carSpecService.getSpecsByCarModelId(parseInt(m2IdParam)).catch(() => null),
              configuratorService.getByCarModelId(parseInt(m2IdParam)).catch(() => null)
            ])
          : Promise.resolve([null, null, null])

        const [[model1, specs1, config1], [model2, specs2, config2]] = await Promise.all([p1, p2])

        const extractEquipment = (config: any) => {
          if (!config) return [];
          const equipment: any[] = [];
          config.sections?.forEach((sec: any) => {
            sec.subGroups?.forEach((sg: any) => {
              sg.options?.forEach((opt: any) => {
                if (opt.isStandard && opt.name && opt.imageUrl?.trim()) {
                   equipment.push({ 
                     ...opt, 
                     groupTitle: sg.title, 
                     image: opt.imageUrl.trim() 
                   });
                }
              })
            })
          })
          return equipment;
        }

        if (model1) {
          setM1Data({ 
            model: model1 as CarModelItem, 
            specs: (specs1 || { performance: null, engine: null, electric: null }) as CarSpecsDTO,
            equipment: extractEquipment(config1)
          })
        } else {
          setM1Data(null)
        }

        if (model2) {
          setM2Data({ 
            model: model2 as CarModelItem, 
            specs: (specs2 || { performance: null, engine: null, electric: null }) as CarSpecsDTO,
            equipment: extractEquipment(config2)
          })
        } else {
          setM2Data(null)
        }
      } catch (e) {
        console.error('Failed to load model details', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [m1IdParam, m2IdParam])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSelectModel = (id: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (showModal === 1) {
      params.set('m1', id.toString())
    } else if (showModal === 2) {
      params.set('m2', id.toString())
    }
    router.push(`${pathname}?${params.toString()}`)
    setShowModal(null)
  }

  const handleRemoveModel = (slot: 1 | 2) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (slot === 1) params.delete('m1')
    if (slot === 2) params.delete('m2')
    router.push(`${pathname}?${params.toString()}`)
  }

  const specsList = [
    {
      label: tl.seats,
      v1: m1Data?.model?.seats?.toString() || '-',
      v2: m2Data?.model?.seats?.toString() || '-',
    },
    {
      label: tl.fuelType,
      v1: m1Data?.model?.fuelType || '-',
      v2: m2Data?.model?.fuelType || '-',
    },
    {
      label: tl.driveType,
      v1: m1Data?.specs?.engine?.drivetrain || '-',
      v2: m2Data?.specs?.engine?.drivetrain || '-',
    },
    {
      label: tl.transmission,
      v1: m1Data?.model?.transmission || '-',
      v2: m2Data?.model?.transmission || '-',
    },
    {
      label: tl.maxPower,
      v1: m1Data?.specs?.performance?.horsepower ? `${m1Data.specs.performance.horsepower} hp` : '-',
      v2: m2Data?.specs?.performance?.horsepower ? `${m2Data.specs.performance.horsepower} hp` : '-',
    },
    {
      label: tl.topSpeed,
      v1: m1Data?.specs?.performance?.topSpeed ? `${m1Data.specs.performance.topSpeed} mph` : '-',
      v2: m2Data?.specs?.performance?.topSpeed ? `${m2Data.specs.performance.topSpeed} mph` : '-',
    },
    {
      label: tl.accel,
      v1: m1Data?.specs?.performance?.acceleration0100 ? `${m1Data.specs.performance.acceleration0100} s` : '-',
      v2: m2Data?.specs?.performance?.acceleration0100 ? `${m2Data.specs.performance.acceleration0100} s` : '-',
    }
  ]

  const visibleSpecs = specsList

  const m1Equipment = m1Data?.equipment || []
  const m2Equipment = m2Data?.equipment || []

  const filteredModelsForModal = selectedModalSeries
    ? allModels.filter(m => m.seriesId === selectedModalSeries)
    : allModels

  if (loading && (!m1Data && !m2Data && (m1IdParam || m2IdParam))) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    )
  }

  const renderModelCard = (data: ModelData | null, slot: 1 | 2) => {
    if (!data) {
      return (
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 h-full min-h-[500px]">
          <div className="h-64 bg-gray-50/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => setShowModal(slot)}>
            <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
              <span className="text-2xl text-gray-600">+</span>
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-600">{tl.chooseModel}</span>
          </div>
        </div>
      )
    }

    const { model, specs } = data
    return (
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 h-full relative group transition-all hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
        <button onClick={() => handleRemoveModel(slot)} className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 hover:text-gray-800 z-10">
          <X size={16} />
        </button>
        <div className="relative w-full h-56 mb-8 mt-4 group-hover:scale-[1.02] transition-transform duration-300">
          <Image src={model.imageUrl || 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop'} alt={model.name} fill unoptimized className="object-contain" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 line-clamp-1 text-gray-900">{model.name}</h2>
        <p className="text-gray-600 font-medium mb-6">{tl.from} ${model.basePrice?.toLocaleString()}</p>
        
        {model.transmission && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">{tl.transmission}</p>
            <p className="text-sm font-semibold text-gray-900">{model.transmission}</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={() => router.push(`/configurator/${model.id}`)} className="flex-1 bg-black text-white py-3.5 font-bold text-sm rounded-[8px] hover:bg-gray-800 active:scale-[0.98] transition-all">
            {tl.buildPorsche}
          </button>
          <button onClick={() => router.push(`/models/${model.id}`)} className="flex-1 bg-gray-100 text-black py-3.5 font-bold text-sm rounded-[8px] hover:bg-gray-200 active:scale-[0.98] transition-all">
            {tl.discoverStock}
          </button>
        </div>
        
        <p className="text-gray-500 text-xs mt-6 font-medium">
          {[model.transmission?.split(' ')[0], specs.engine?.drivetrain, model.fuelType].filter(Boolean).join(' · ')}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50 min-h-screen text-black">
      <SiteHeader logoHref="/" />

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-[44px] md:text-[56px] leading-tight font-normal text-black tracking-tight mb-6">{tl.compareModels}</h1>
          <p className="text-lg text-gray-600 mb-8 font-medium">{tl.helpDeciding}</p>
          <button onClick={() => setShowModal(m1Data ? 2 : 1)} className="text-black font-bold underline underline-offset-4 hover:text-gray-600 transition-colors">
            {tl.changeModel}
          </button>
        </div>

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {renderModelCard(m1Data, 1)}
          {renderModelCard(m2Data, 2)}
        </div>

        {/* Comparison Questions */}
        <div className="bg-white rounded-xl p-10 md:p-14 mb-16 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-normal mb-12 text-center tracking-tight">{tl.differences}</h2>

          <div className="space-y-2">
            <div className="border-b border-gray-100 pb-2">
              <button onClick={() => toggleSection('name')} className="w-full flex items-center justify-between py-4 hover:opacity-75 transition-opacity group">
                <h3 className="text-xl font-medium tracking-tight group-hover:text-gray-600 transition-colors">{tl.nameMeaning}</h3>
                {expandedSections.name ? <ChevronUp size={24} className="text-gray-400 group-hover:text-black transition-colors" /> : <ChevronDown size={24} className="text-gray-400 group-hover:text-black transition-colors" />}
              </button>
            </div>

            <div className="border-b border-gray-100 pb-2">
              <button onClick={() => toggleSection('form')} className="w-full flex items-center justify-between py-4 hover:opacity-75 transition-opacity group">
                <h3 className="text-xl font-medium tracking-tight group-hover:text-gray-600 transition-colors">{tl.formDesign}</h3>
                {expandedSections.form ? <ChevronUp size={24} className="text-gray-400 group-hover:text-black transition-colors" /> : <ChevronDown size={24} className="text-gray-400 group-hover:text-black transition-colors" />}
              </button>
            </div>

            <div className="border-b border-gray-100 pb-2">
              <button onClick={() => toggleSection('specs')} className="w-full flex items-center justify-between py-4 hover:opacity-75 transition-opacity group">
                <h3 className="text-xl font-medium tracking-tight group-hover:text-gray-600 transition-colors">{tl.techSpecs}</h3>
                {expandedSections.specs ? <ChevronUp size={24} className="text-gray-400 group-hover:text-black transition-colors" /> : <ChevronDown size={24} className="text-gray-400 group-hover:text-black transition-colors" />}
              </button>
            </div>
          </div>
        </div>

        {/* Specs Comparison Table */}
        {expandedSections.specs && (m1Data || m2Data) && (
          <div className="bg-white rounded-xl p-10 md:p-14 mb-20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <h3 className="text-2xl font-bold mb-12 text-center tracking-tight">{tl.compareSpecs}</h3>

            <div className="flex gap-8 mb-12 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-4 w-1/2">
                <div className="w-8 h-5 bg-black rounded-[3px]"></div>
                <span className="text-lg font-bold tracking-tight line-clamp-1">{m1Data?.model?.name || tl.chooseModel}</span>
              </div>
              <div className="flex items-center gap-4 w-1/2">
                <div className="w-8 h-5 bg-gray-300 rounded-[3px]"></div>
                <span className="text-lg font-bold tracking-tight line-clamp-1">{m2Data?.model?.name || tl.chooseModel}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {/* Left Column */}
              <div className="space-y-0">
                {visibleSpecs.map(s => (
                  <div key={s.label} className="border-b border-gray-200 py-6">
                    <p className="text-gray-500 text-[13px] mb-3">{s.label}</p>
                    <p className={`text-[17px] font-normal tracking-tight ${s.v1 === '-' ? 'text-gray-300' : 'text-gray-900'}`}>{s.v1}</p>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-0">
                {visibleSpecs.map(s => (
                  <div key={s.label} className="border-b border-gray-200 py-6">
                    <p className="text-gray-500 text-[13px] mb-3 md:hidden">{s.label}</p>
                    <p className="text-gray-500 text-[13px] mb-3 hidden md:block opacity-0 select-none pb-0">{s.label}</p>
                    <p className={`text-[17px] font-normal tracking-tight ${s.v2 === '-' ? 'text-gray-300' : 'text-gray-900'}`}>{s.v2}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(m1Equipment.length > 0 || m2Equipment.length > 0) && (
          <div className="bg-white rounded-xl p-10 md:p-14 mb-20 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <h3 className="text-[32px] font-normal mb-12 text-center tracking-tight">{tl.standardEquipment}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {/* Left Column - Model 1 */}
              <div>
                {m1Equipment.map((item: any, idx: number) => (
                  <div key={`m1-${idx}`} className="border-b border-gray-200 py-6 flex items-center gap-6">
                    <div className="w-[100px] h-[56px] relative flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <p className="text-[17px] font-normal tracking-tight text-gray-900 leading-tight pr-4">{item.name}</p>
                  </div>
                ))}
                {m1Equipment.length === 0 && (
                  <p className="text-gray-400 py-6 text-center">-</p>
                )}
              </div>

              {/* Right Column - Model 2 */}
              <div>
                {m2Equipment.map((item: any, idx: number) => (
                  <div key={`m2-${idx}`} className="border-b border-gray-200 py-6 flex items-center gap-6">
                    <div className="w-[100px] h-[56px] relative flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <p className="text-[17px] font-normal tracking-tight text-gray-900 leading-tight pr-4">{item.name}</p>
                  </div>
                ))}
                {m2Equipment.length === 0 && (
                  <p className="text-gray-400 py-6 text-center">-</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Selection Modal */}
      {showModal !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 opacity-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-[0.98] duration-200">
            <div className="flex items-center justify-between p-6 px-8 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{tl.selectTwoModels}</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">{filteredModelsForModal.length} {tl.availableModels}</p>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors group">
                <X size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/4 bg-gray-50/50 p-6 px-8 border-r border-gray-100 overflow-y-auto hidden lg:block">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Series</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="series" checked={selectedModalSeries === null} onChange={() => setSelectedModalSeries(null)} className="w-4 h-4 text-black border-gray-300 focus:ring-black cursor-pointer" />
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors">{tl.allSeries} ({allModels.length})</span>
                  </label>
                  {allSeries.map(series => (
                    <label key={series.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="radio" name="series" checked={selectedModalSeries === series.id} onChange={() => setSelectedModalSeries(series.id)} className="w-4 h-4 text-black border-gray-300 focus:ring-black cursor-pointer" />
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-black transition-colors">{series.name} ({allModels.filter(m => m.seriesId === series.id).length})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 px-8 overflow-y-auto bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <h3 className="text-[28px] font-normal tracking-tight">{selectedModalSeries ? allSeries.find(s => s.id === selectedModalSeries)?.name : tl.allSeries}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                  {filteredModelsForModal.map((model) => (
                    <div 
                      key={model.id} 
                      onClick={() => handleSelectModel(model.id)}
                      className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer hover:border-black hover:shadow-lg transition-all group relative"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        {model.fuelType && <span className="px-2.5 py-1 bg-gray-100 rounded-sm text-[11px] font-bold tracking-wider text-gray-700 uppercase">{model.fuelType}</span>}
                        <span className="px-2.5 py-1 bg-gray-100 rounded-sm text-[11px] font-bold tracking-wider text-gray-700 uppercase">{model.year}</span>
                      </div>
                      <div className="w-full h-32 relative mb-6 group-hover:scale-[1.03] transition-transform duration-300">
                        <Image src={model.imageUrl || 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop'} alt={model.name} fill unoptimized className="object-contain" />
                      </div>
                      <h4 className="text-lg font-bold mb-1 leading-tight tracking-tight line-clamp-1">{model.name}</h4>
                      <p className="text-sm text-gray-600 font-medium mb-6">{tl.from} ${model.basePrice?.toLocaleString()}</p>
                      
                      <button className="w-full py-3 bg-gray-50 text-[13px] font-bold tracking-wide uppercase text-gray-900 rounded-[6px] group-hover:bg-black group-hover:text-white transition-colors">
                        {tl.selectText}
                      </button>
                    </div>
                  ))}
                  {filteredModelsForModal.length === 0 && (
                    <div className="col-span-full py-24 text-center text-gray-500 font-medium bg-white rounded-xl border border-dashed border-gray-200">
                      {tl.noModels}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bottom Floating Bar */}
            <div className="absolute bottom-0 left-0 lg:left-[25%] right-0 bg-white border-t border-gray-100 p-4 px-8 flex justify-between items-center rounded-b-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">{tl.pickingForSlot} {showModal}</span>
               </div>
               <button onClick={() => setShowModal(null)} className="px-6 py-2.5 text-sm font-bold border border-gray-300 rounded-[6px] hover:bg-gray-100 transition-colors">
                 {tl.close}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Button */}
      <button 
        onClick={() => router.push('/advisory')}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-8 rounded-l-[8px] font-bold tracking-wide uppercase text-[15px] hover:bg-purple-700 hover:pr-6 transition-all z-40 hidden md:block shadow-lg"
      >
        <span className="[writing-mode:vertical-rl] block">{tl.getAdvice}</span>
      </button>
    </div>
  )
}

export default function CompareModelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" size={48} /></div>}>
      <CompareModelsContent />
    </Suspense>
  )
}
