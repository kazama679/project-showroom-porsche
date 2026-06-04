'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Search, ChevronDown, ChevronUp, Bookmark, Calculator, Info, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { vehicleListingApi, VehicleListingResponse } from '@/services/vehicle-listing-api'
import { useSavedListings } from '@/hooks/use-saved-listings'
import { SiteHeader } from '@/components/features/layout/site-header'
import { authService } from '@/services/auth'
import { InventoryLoginModal } from '@/components/features/inventory/inventory-login-modal'

const FALLBACK_IMAGE = 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp'

export default function InventoryPage() {
  const router = useRouter()
  const t = useTranslations('usedCarsSearch')
  const [listings, setListings] = useState<VehicleListingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedImageForModal, setSelectedImageForModal] = useState('')
  const { isSaved, toggleListing } = useSavedListings()

  // Filter states (for UI visual mapping)
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['Vị trí', 'Tình trạng', 'Dòng sản phẩm'])

  // Functional Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await vehicleListingApi.getApprovedListings()
        setListings(data)
      } catch (error) {
        console.error('Failed to fetch listings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const handleToggleListing = (id: number, imageUrl: string) => {
    if (!authService.isAuthenticated()) {
      setSelectedImageForModal(imageUrl)
      setShowLoginModal(true)
      return
    }
    toggleListing(id)
  }

  const toggleFilter = (filter: string) => {
    setExpandedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    )
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return '0,00'
    return price.toLocaleString('vi-VN') + ',00'
  }

  // Derive unique models for the dropdown
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(listings.map(car => car.model))).filter(Boolean) as string[]
  }, [listings])

  // Computed filtered list
  const filteredListings = useMemo(() => {
    return listings.filter(car => {
      // 1. Location match (search zipcode or city)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const locationStr = `${car.zipCode || ''} ${car.city || ''} ${car.stateProvince || ''}`.toLowerCase()
        if (!locationStr.includes(term)) return false
      }

      // 2. Condition match
      if (selectedConditions.length > 0) {
        let match = false
        const isNew = car.mileage === undefined || car.mileage === 0
        const isClassic = car.modelYear && car.modelYear < 2000
        
        if (selectedConditions.includes('Mới') && isNew) match = true
        if (selectedConditions.includes('Đã qua sử dụng') && !isNew) match = true
        if (selectedConditions.includes('Cổ điển') && isClassic) match = true
        if (selectedConditions.includes('Xe đã qua sử dụng được chứng nhận')) {
           // We just loosely match this to the data presence of carfax or service records as a proxy
           if (!isNew && car.hasCarfaxReport) match = true
        }

        if (!match) return false
      }

      // 3. Model match
      if (selectedModel && selectedModel !== t('filter_model_line_default')) {
        if (car.model !== selectedModel) return false
      }

      return true
    })
  }, [listings, searchTerm, selectedConditions, selectedModel, t])

  // Sidebar accordions mapping based on screenshot
  const accordionFilters = [
    { id: '1', title: t('filter_trim_title') },
    { id: '2', title: t('filter_generation_title') },
    { id: '3', title: t('filter_year_title') },
    { id: '4', title: t('filter_body_style_title') },
    { id: '5', title: t('filter_engine_title') },
    { id: '6', title: t('filter_options_title') },
    { id: '7', title: t('filter_ext_color_title') },
    { id: '8', title: t('filter_int_color_title') },
    { id: '9', title: t('filter_price_title') },
  ]

  const CheckboxUI = ({ checked }: { checked: boolean }) => (
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${checked ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'}`}>
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <SiteHeader className="z-50 bg-transparent absolute top-0 w-full border-none" />
      {/* Header */}
      <div className="max-w-compare mx-auto px-6 pt-24 pb-6">
        <h1 className="text-3xl font-normal leading-tight text-gray-900 mb-2">
          {t('header_brand')}
        </h1>
        <p className="text-xl text-gray-800 font-light">
          {t('header_desc')}
        </p>
      </div>

      <div className="max-w-compare mx-auto px-6 pb-12 flex flex-col lg:flex-row items-start gap-6">
        {/* Left Sidebar */}
        <div className="w-full lg:w-inventory-sidebar flex-shrink-0 bg-white rounded-2xl p-6 shadow-sm">
          
          {/* Location */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleFilter('Vị trí')}
              className="w-full flex items-center justify-between mb-4 font-semibold text-body-sm"
            >
              <span className="flex items-center gap-2">
                <ChevronUp className={`w-4 h-4 transition-transform ${expandedFilters.includes('Vị trí') ? '' : 'rotate-180'}`} />
                {t('filter_location_title')}
              </span>
            </button>
            
            {expandedFilters.includes('Vị trí') && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('filter_location_placeholder')}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="text-caption text-gray-500 mb-1.5 block px-1">{t('filter_radius_title')}</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer focus:outline-none">
                      <option>{t('filter_radius_default')}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Condition */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleFilter('Tình trạng')}
              className="w-full flex items-center justify-between mb-4 font-semibold text-body-sm"
            >
              <span className="flex items-center gap-2">
                <ChevronUp className={`w-4 h-4 transition-transform ${expandedFilters.includes('Tình trạng') ? '' : 'rotate-180'}`} />
                {t('filter_condition_title')}
              </span>
            </button>
            {expandedFilters.includes('Tình trạng') && (
              <div className="space-y-4 ml-6">
                <label className="flex items-center justify-between cursor-pointer group" onClick={() => toggleCondition('Mới')}>
                  <div className="flex items-center gap-3">
                    <CheckboxUI checked={selectedConditions.includes('Mới')} />
                    <span className="text-sm text-gray-700">{t('filter_condition_new')}</span>
                  </div>
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group" onClick={() => toggleCondition('Đã qua sử dụng')}>
                  <div className="flex items-center gap-3">
                    <CheckboxUI checked={selectedConditions.includes('Đã qua sử dụng')} />
                    <span className="text-sm text-gray-700">{t('filter_condition_used')}</span>
                  </div>
                  <Info className="w-4 h-4 text-gray-500" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group" onClick={() => toggleCondition('Xe đã qua sử dụng được chứng nhận')}>
                  <div className="flex items-center gap-3">
                    <CheckboxUI checked={selectedConditions.includes('Xe đã qua sử dụng được chứng nhận')} />
                    <span className="text-sm text-gray-700 max-w-toolbar-code leading-tight">{t('filter_condition_cpo')}</span>
                  </div>
                  <Info className="w-4 h-4 text-gray-500" />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer group" onClick={() => toggleCondition('Cổ điển')}>
                  <div className="flex items-center gap-3">
                    <CheckboxUI checked={selectedConditions.includes('Cổ điển')} />
                    <span className="text-sm text-gray-700">{t('filter_condition_classic')}</span>
                  </div>
                  <Info className="w-4 h-4 text-gray-500" />
                </label>
              </div>
            )}
          </div>

          {/* Model Line */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <button
              onClick={() => toggleFilter('Dòng sản phẩm')}
              className="w-full flex items-center justify-between mb-4 font-semibold text-body-sm"
            >
              <span className="flex items-center gap-2">
                <ChevronUp className={`w-4 h-4 transition-transform ${expandedFilters.includes('Dòng sản phẩm') ? '' : 'rotate-180'}`} />
                {t('filter_model_line_title')}
              </span>
            </button>
            {expandedFilters.includes('Dòng sản phẩm') && (
              <div className="relative ml-6">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer focus:outline-none"
                >
                  <option value="">{t('filter_model_line_default')}</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Other accordion filters based on the screenshot */}
          <div className="space-y-6">
            {accordionFilters.map((filter) => (
              <button
                key={filter.id}
                className="w-full flex items-center justify-between border-b border-gray-100 pb-6 font-semibold text-body-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  {filter.title}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Right Main Content */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
          
          {/* Top Sort Bar */}
          <div className="bg-white rounded-2xl h-compact-header flex items-center justify-between px-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">
               Hiển thị {filteredListings.length} xe
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{t('sort_by_label')}</span>
              <div className="relative">
                <select className="appearance-none bg-gray-100 border-none rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium cursor-pointer focus:outline-none w-toolbar-price">
                  <option>{t('sort_by_recommended')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
             <div className="flex justify-center p-20 text-gray-500">Loading cars...</div>
          ) : filteredListings.length === 0 ? (
             <div className="flex justify-center items-center flex-col p-20 text-gray-500 bg-white rounded-2xl border border-gray-100 min-h-account-state">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg">No used cars match your search.</p>
                <button onClick={() => { setSearchTerm(''); setSelectedConditions([]); setSelectedModel('') }} className="mt-4 text-blue-600 font-medium hover:underline">
                  Clear all filters
                </button>
             </div>
          ) : (
            <div className="space-y-6">
              {filteredListings.map((car) => {
                // Determine images with Fallback
                let mainImage = car.images && car.images.length > 0 ? car.images[0].imageUrl : FALLBACK_IMAGE
                let thumb1 = car.images && car.images.length > 1 ? car.images[1].imageUrl : FALLBACK_IMAGE
                let thumb2 = car.images && car.images.length > 2 ? car.images[2].imageUrl : FALLBACK_IMAGE
                let thumb3 = car.images && car.images.length > 3 ? car.images[3].imageUrl : FALLBACK_IMAGE

                const specsLine = [
                  car.fuelType === 'Electric' ? t('fuel_electric') : (car.fuelType === 'Gasoline' ? t('fuel_gasoline') : car.fuelType),
                  car.engineCondition || (car.fuelType === 'Electric' ? `563 ${t('power_hp')} / 414 ${t('power_kw')}` : `420 ${t('power_hp')} / 300 ${t('power_kw')}`), // mock hp based on actual schema gap
                  car.drivetrain === 'AWD' ? t('drivetrain_awd') : car.drivetrain,
                  car.transmission === 'Automatic' ? t('transmission_auto') : car.transmission,
                ].filter(Boolean).join(' · ')
                
                const showRangeForEv = car.fuelType === 'Electric'
                const isCarNew = car.mileage === 0 || car.mileage === undefined

                return (
                  <div key={car.id} className="bg-white rounded-3xl p-5 flex flex-col xl:flex-row gap-6 shadow-sm overflow-hidden border border-gray-100">
                    
                    {/* Images Section */}
                    <div className="w-full xl:w-inventory-image flex flex-col gap-2 flex-shrink-0 relative">
                      {/* Badges Overlay */}
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <span className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">{t('badge_video')}</span>
                        <span className="bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">{t('badge_audio')}</span>
                      </div>
                      
                      {/* Main Image */}
                      <div className="w-full h-inventory-card-mobile sm:h-inventory-card-desktop bg-gray-100 rounded-panel overflow-hidden relative">
                        <Image
                          src={mainImage}
                          alt="Vehicle image"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Thumbnails */}
                      <div className="flex gap-2 h-model-strip sm:h-review-textarea">
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100">
                          <Image src={mainImage} fill unoptimized className="object-cover" alt="Thumbnail 1" />
                        </div>
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100">
                          <Image src={thumb1} fill unoptimized className="object-cover" alt="Thumbnail 2" />
                        </div>
                        <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100">
                          <Image src={thumb2} fill unoptimized className="object-cover" alt="Thumbnail 3" />
                        </div>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 flex flex-col py-2 px-2 xl:px-4">
                      <div className="flex-1">
                        <h2 className="text-heading font-medium text-gray-900 leading-tight">
                          Porsche {car.model} {car.trimLevel} {car.modelYear}
                        </h2>
                        
                        {isCarNew && <p className="text-blue-600 text-body-sm font-medium mt-2">{t('condition_new')}</p>}
                        {!isCarNew && car.mileage && <p className="text-gray-500 text-body-sm font-medium mt-2">{car.mileage.toLocaleString()} km</p>}
                        
                        <div className="mt-6 space-y-1.5">
                          <p className="text-sm text-gray-700">
                            {car.exteriorColor || 'Màu tiêu chuẩn'} <span className="text-gray-400 mx-1">•</span> {car.interiorColor || 'Nội thất tiêu chuẩn'}
                          </p>
                          <p className="text-sm text-gray-700">
                            {specsLine}
                          </p>
                          {showRangeForEv && (
                            <p className="text-sm text-gray-700">
                              {t('range_label')} 294 {t('range_unit')}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-8">
                          <div className="flex items-end gap-3 mb-1">
                            <span className="text-3xl font-medium text-gray-900 leading-none">
                              {formatPrice(car.askingPrice)} {t('price_suffix')}
                            </span>
                            <span className="text-caption text-gray-500 mb-1">{t('price_desc')}</span>
                          </div>
                          
                          <a href="#" className="text-sm font-medium underline underline-offset-4 decoration-1 decoration-gray-400 hover:text-gray-600 mb-4 inline-block">
                            {t('price_details')}
                          </a>
                          
                          <p className="text-sm text-gray-700 mb-6 font-medium">
                            {t('dealer_fee')} 699,00 {t('price_suffix')}
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <Calculator className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium">{t('payment_tweak')}</span>
                          </div>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="bg-gray-200 text-gray-800 text-caption font-medium px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray-300 transition-colors">
                              {t('payment_lease')}
                            </span>
                            <span className="bg-gray-200 text-gray-800 text-caption font-medium px-4 py-1.5 rounded-full whitespace-nowrap cursor-pointer hover:bg-gray-300 transition-colors">
                              {t('payment_finance')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-10 sm:mt-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Link href={`/inventory/${car.id}`} className="flex-1 sm:flex-none text-center bg-gray-900 text-white font-medium text-body-sm px-8 py-4 rounded hover:bg-black transition-colors shadow-sm">
                            {t('btn_show_details')}
                          </Link>
                          <button 
                            onClick={() => handleToggleListing(car.id, mainImage)} 
                            className={`flex-1 sm:flex-none text-center hover:bg-gray-50 font-medium text-body-sm px-6 py-4 rounded flex items-center justify-center gap-3 border border-gray-200 transition-colors cursor-pointer shadow-sm ${isSaved(car.id) ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-900'}`}
                          >
                            <Bookmark className={`w-5 h-5 ${isSaved(car.id) ? 'fill-current' : ''}`} />
                            {isSaved(car.id) ? t('saved') : t('btn_save')}
                          </button>
                        </div>
                        
                        <div className="mt-6 text-caption text-gray-800 flex items-center flex-wrap gap-x-2">
                          <span className="font-bold">{car.sellerType === 'Dealer' ? (car.sellerFullName || 'Porsche Monmouth') : (car.sellerFullName || 'Porsche Dealer')}</span>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span>{car.city || 'West Long Branch'}, {car.stateProvince || 'NJ'}, {car.zipCode || '07764'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {showLoginModal && (
        <InventoryLoginModal 
          carImage={selectedImageForModal || FALLBACK_IMAGE} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  )
}
