'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { ArrowLeft, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Bookmark, ArrowRight, Mail, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { vehicleListingApi, VehicleListingResponse } from '@/services/vehicle-listing-api'
import { useSavedListings } from '@/hooks/use-saved-listings'
import { SiteHeader } from '@/components/features/layout/site-header'
import { authService } from '@/services/auth'
import { Link } from '@/i18n/navigation'
import { InventoryLoginModal } from '@/components/features/inventory/inventory-login-modal'

const FALLBACK_IMAGE = 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp'
const PORSCHE_CREST = 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Porsche_logo.svg/200px-Porsche_logo.svg.png'

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const t = useTranslations('usedCarsDetail')
  const [car, setCar] = useState<VehicleListingResponse | null>(null)
  const [similarCars, setSimilarCars] = useState<VehicleListingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [expandedSpecs, setExpandedSpecs] = useState<string[]>([])
  const [similarScrollIndex, setSimilarScrollIndex] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isSaved, toggleListing } = useSavedListings()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(resolvedParams.id)
        const carData = await vehicleListingApi.getListingById(id)
        setCar(carData)

        // Fetch similar listings
        const allListings = await vehicleListingApi.getApprovedListings()
        const filtered = allListings.filter(l => l.id !== id)
        setSimilarCars(filtered)
      } catch (error) {
        console.error('Failed to fetch car details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.id])

  const toggleSpec = (spec: string) => {
    setExpandedSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  const handleToggleListing = (id: number) => {
    if (!authService.isAuthenticated()) {
      setShowLoginModal(true)
      return
    }
    toggleListing(id)
  }

  const formatPrice = (price: number | undefined) => {
    if (!price) return '0,00'
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">{t('loading')}</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <p className="text-gray-500 text-xl">{t('not_found')}</p>
        <Link href="/inventory" className="text-blue-600 underline">{t('back_link')}</Link>
      </div>
    )
  }

  const images = car.images && car.images.length > 0
    ? car.images.map(img => img.imageUrl)
    : [FALLBACK_IMAGE]
  const mainImage = images[selectedImageIndex] || images[0]
  const isNew = !car.mileage || car.mileage === 0
  const conditionLabel = isNew ? t('condition_new') : t('condition_used')
  const msrpPrice = car.askingPrice ? car.askingPrice - 699 : 0
  const fuelLabel = car.fuelType === 'Gasoline' ? t('fuel_gasoline') : (car.fuelType === 'Electric' ? t('fuel_electric') : car.fuelType)
  const driveLabel = car.drivetrain === 'AWD' ? t('drivetrain_awd') : (car.drivetrain === 'RWD' ? t('drivetrain_rwd') : car.drivetrain)
  const transLabel = car.transmission === 'Automatic' ? t('transmission_auto') : (car.transmission === 'Manual' ? t('transmission_manual') : car.transmission)

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader className="z-50 bg-transparent absolute top-0 w-full border-none" />
      {/* Back Link */}
      <div className="max-w-page mx-auto px-6 pt-20 pb-5">
        <Link href="/inventory" className="inline-flex items-center gap-2 text-body-sm text-gray-900 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('back_link')}
        </Link>
      </div>

      {/* ═══════════════════ IMAGE GALLERY ═══════════════════ */}
      <div className="max-w-page mx-auto px-6 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Image */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-gray-100 aspect-showcase cursor-pointer group" onClick={() => setGalleryOpen(true)}>
            <Image src={mainImage} alt="Main" fill unoptimized className="object-cover" />
            {/* Badges */}
            <div className="absolute top-5 left-5 flex gap-2 z-10">
              <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full">{t('badge_video')}</span>
              <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full">{t('badge_audio')}</span>
              <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full">{images.length} {t('badge_images')}</span>
            </div>
            {/* Open Gallery Button */}
            <button
              className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm text-gray-900 text-caption font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-white transition-colors z-10 shadow-md"
              onClick={(e) => { e.stopPropagation(); setGalleryOpen(true) }}
            >
              <Mail className="w-4 h-4" />
              {t('gallery_open')}
            </button>
          </div>

          {/* Side Grid (4 images) */}
          <div className="grid grid-cols-2 gap-3 max-h-editorial-media">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => { if (images[i]) { setSelectedImageIndex(i); setGalleryOpen(true) } }}
              >
                <Image
                  src={images[i] || FALLBACK_IMAGE}
                  alt={`View ${i}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ CONTENT AREA ═══════════════════ */}
      <div className="max-w-page mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* ─── LEFT COLUMN (Main Info) ─── */}
          <div className="flex-1 min-w-0">
            
            {/* Title & Condition */}
            <h1 className="text-3xl lg:text-inventory-title font-normal text-gray-900 leading-tight mb-2">
              Porsche {car.model} {car.trimLevel} {car.modelYear}
            </h1>
            <p className="text-blue-600 text-base font-medium mb-8">{conditionLabel}</p>

            {/* Color Swatches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-gray-400 border border-gray-300 flex-shrink-0 shadow-inner" />
                <div>
                  <p className="text-caption text-gray-500 mb-0.5">{t('ext_color_label')}</p>
                  <p className="text-body-sm text-gray-900 font-medium">{car.exteriorColor || 'Standard'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-md bg-gray-900 border border-gray-300 flex-shrink-0 shadow-inner" />
                <div>
                  <p className="text-caption text-gray-500 mb-0.5">{t('int_color_label')}</p>
                  <p className="text-body-sm text-gray-900 font-medium">{car.interiorColor || 'Standard'}</p>
                </div>
              </div>
            </div>

            {/* Specs Grid Row 1 */}
            <div className="grid grid-cols-3 border-t border-gray-200">
              <div className="py-6 pr-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 mb-2">{t('spec_warranty')}</p>
                <p className="text-xl font-semibold text-gray-900">48 {t('spec_warranty_months')}</p>
              </div>
              <div className="py-6 px-6 border-b border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-2">{t('spec_engine')}</p>
                <p className="text-xl font-semibold text-gray-900">{fuelLabel}</p>
              </div>
              <div className="py-6 pl-6 border-b border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-2">{t('spec_transmission')}</p>
                <p className="text-xl font-semibold text-gray-900">{transLabel}</p>
              </div>
            </div>

            {/* Specs Grid Row 2 */}
            <div className="grid grid-cols-3 border-b border-gray-200">
              <div className="py-6 pr-6">
                <p className="text-xs text-gray-500 mb-2">{t('spec_drivetrain')}</p>
                <p className="text-base font-semibold text-gray-900">{driveLabel}</p>
              </div>
              <div className="py-6 px-6 border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-2">{t('spec_max_power')}</p>
                <p className="text-base font-semibold text-gray-900">493 {t('spec_hp')} / 363 {t('spec_kw')}</p>
              </div>
              <div className="py-6 pl-6 border-l border-gray-200">
                <p className="text-xs text-gray-500 mb-2 leading-tight">{t('spec_accel')}</p>
                <p className="text-base font-semibold text-gray-900">4,2 {t('spec_accel_unit')}</p>
              </div>
            </div>

            {/* ─── Important Resources ─── */}
            <div className="mt-14 mb-14">
              <h2 className="text-heading font-normal text-gray-900 mb-6">{t('resources_title')}</h2>
              <div className="bg-inventory-info-surface rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:bg-inventory-info-surface-hover transition-colors group">
                <div>
                  <h3 className="text-ui-lg font-bold text-gray-900 mb-2">{t('resources_window_sticker')}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed max-w-lg">{t('resources_window_sticker_desc')}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </div>

            {/* ─── Warranty ─── */}
            <div className="mb-14">
              <h2 className="text-heading font-normal text-gray-900 mb-3">{t('warranty_title')}</h2>
              <p className="text-sm text-gray-600 mb-6">{t('warranty_subtitle')}</p>
              
              <div className="flex items-start gap-12">
                {/* Left: warranty badge */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-14 h-14 relative">
                    <Image src={PORSCHE_CREST} alt="Porsche" fill unoptimized className="object-contain" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{t('warranty_new_car')}</p>
                    <p className="text-sm text-gray-600">48 {t('spec_warranty_months')}</p>
                  </div>
                </div>
                
                {/* Right: extended warranty info */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex-1">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{t('warranty_extended_text')}</p>
                  <a href="#" className="inline-flex items-center gap-2 text-sm text-gray-900 font-medium hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    {t('warranty_extended_link')}
                  </a>
                </div>
              </div>
            </div>

            {/* ─── Technical Specifications ─── */}
            <div className="mb-14">
              <h2 className="text-heading font-normal text-gray-900 mb-6">{t('tech_specs_title')}</h2>
              <div className="divide-y divide-gray-200 border-t border-gray-200">
                {[
                  { key: 'engine', label: t('tech_engine') },
                  { key: 'performance', label: t('tech_performance') },
                  { key: 'body', label: t('tech_body') },
                  { key: 'noise', label: t('tech_noise') },
                ].map((section) => (
                  <div key={section.key}>
                    <button
                      onClick={() => toggleSpec(section.key)}
                      className="w-full flex items-center justify-between py-5 text-left group"
                    >
                      <span className="text-base font-bold text-gray-900">{section.label}</span>
                      {expandedSpecs.includes(section.key)
                        ? <ChevronUp className="w-5 h-5 text-gray-500" />
                        : <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    {expandedSpecs.includes(section.key) && (
                      <div className="pb-6 pl-2">
                        {section.key === 'engine' && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">{t('spec_engine')}:</span> <span className="font-medium">{fuelLabel}</span></div>
                            <div><span className="text-gray-500">{t('spec_max_power')}:</span> <span className="font-medium">493 {t('spec_hp')} / 363 {t('spec_kw')}</span></div>
                          </div>
                        )}
                        {section.key === 'performance' && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">{t('spec_accel')}:</span> <span className="font-medium">4,2 {t('spec_accel_unit')}</span></div>
                            <div><span className="text-gray-500">{t('spec_transmission')}:</span> <span className="font-medium">{transLabel}</span></div>
                            <div><span className="text-gray-500">{t('spec_drivetrain')}:</span> <span className="font-medium">{driveLabel}</span></div>
                          </div>
                        )}
                        {section.key === 'body' && (
                          <p className="text-sm text-gray-600">—</p>
                        )}
                        {section.key === 'noise' && (
                          <p className="text-sm text-gray-600">—</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN (Sticky Sidebar) ─── */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-6 bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
              
              {/* Price */}
              <p className="text-3xl font-medium text-gray-900 leading-none mb-1">
                {formatPrice(car.askingPrice)} {t('price_suffix')}
              </p>
              <p className="text-caption text-gray-500 mb-1">{t('price_desc')}</p>
              <a href="#" className="text-caption text-blue-600 underline underline-offset-2 mb-5 inline-block">{t('price_details')}</a>

              {/* MSRP breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('price_msrp')}</span>
                  <span className="text-gray-900">{formatPrice(msrpPrice)} {t('price_suffix')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('price_dealer_fee')}</span>
                  <span className="text-gray-900">699,00 {t('price_suffix')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <Link href={`/inventory/${car.id}/contact`} className="w-full bg-gray-900 text-white font-medium text-body-sm py-4 rounded-lg mb-3 hover:bg-black transition-colors block text-center">
                {t('btn_contact_dealer')}
              </Link>
              <button className="w-full bg-white border border-gray-300 text-gray-900 font-medium text-sm py-4 rounded-lg mb-3 hover:bg-gray-50 transition-colors leading-snug px-4">
                {t('btn_payment_trade')}
              </button>
              <button 
                onClick={() => handleToggleListing(car.id)} 
                className={`w-full border border-gray-300 text-gray-900 font-medium text-body-sm py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors ${isSaved(car.id) ? 'bg-gray-100' : 'bg-white'}`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved(car.id) ? 'fill-current' : ''}`} />
                {isSaved(car.id) ? t('saved') : t('btn_save')}
              </button>

              {/* Disclaimer */}
              <p className="text-micro-label text-gray-500 leading-relaxed mt-6 mb-6">{t('price_disclaimer')}</p>

              {/* Dealer Name */}
              <p className="text-body-sm font-bold text-gray-900">
                {car.sellerFullName || 'Porsche Monmouth'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════ SIMILAR LISTINGS ═══════════════════ */}
      {similarCars.length > 0 && (
        <div className="border-t border-gray-200 bg-white py-14">
          <div className="max-w-page mx-auto px-6">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-section font-normal text-gray-900 mb-2">{t('similar_title')}</h2>
                <Link href="/inventory" className="inline-flex items-center gap-2 text-sm text-gray-900 underline underline-offset-4 hover:text-gray-600">
                  <ArrowRight className="w-4 h-4" />
                  {t('similar_show_all')}
                </Link>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSimilarScrollIndex(Math.max(0, similarScrollIndex - 1))}
                  disabled={similarScrollIndex === 0}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSimilarScrollIndex(Math.min(similarCars.length - 4, similarScrollIndex + 1))}
                  disabled={similarScrollIndex >= similarCars.length - 4}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex gap-5 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${similarScrollIndex * 280}px)` }}
              >
                {similarCars.map((sc) => {
                  const scImage = sc.images && sc.images.length > 0 ? sc.images[0].imageUrl : FALLBACK_IMAGE
                  const scIsNew = !sc.mileage || sc.mileage === 0
                  return (
                    <Link
                      key={sc.id}
                      href={`/inventory/${sc.id}`}
                      className="w-64 flex-shrink-0 group"
                    >
                      <div className="aspect-photo relative rounded-2xl overflow-hidden bg-gray-100 mb-4">
                        <Image src={scImage} alt={sc.model || 'Car'} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="text-body-sm font-semibold text-gray-900 mb-1">
                        Porsche {sc.model} {sc.trimLevel} {sc.modelYear}
                      </h3>
                      <p className="text-blue-600 text-caption font-medium mb-2">{scIsNew ? t('condition_new') : t('condition_used')}</p>
                      <p className="text-caption text-gray-500 mb-2">
                        {sc.exteriorColor || '—'} <span className="mx-1">·</span> {sc.interiorColor || '—'}
                      </p>
                      <p className="text-base font-medium text-gray-900 mb-0.5">{formatPrice(sc.askingPrice)} {t('price_suffix')}</p>
                      <p className="text-xs text-gray-500 mb-2">{t('price_desc')}</p>
                      <p className="text-caption font-bold text-gray-900">{sc.sellerFullName || 'Porsche Dealer'}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ FULLSCREEN GALLERY OVERLAY ═══════════════════ */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Gallery Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setGalleryOpen(false)}
              className="text-white text-sm flex items-center gap-2 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <p className="text-white text-sm">{selectedImageIndex + 1} / {images.length}</p>
          </div>

          {/* Gallery Main */}
          <div className="flex-1 flex items-center justify-center px-16 relative">
            <button
              onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex === 0}
              className="absolute left-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-5xl aspect-showcase">
              <Image src={images[selectedImageIndex]} alt="Gallery" fill unoptimized className="object-contain" />
            </div>
            <button
              onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex === images.length - 1}
              className="absolute right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          <div className="flex gap-2 justify-center py-4 px-6 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === selectedImageIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <Image src={img} alt={`Thumb ${i}`} fill unoptimized className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════ LOGIN PROMPT MODAL ═══════════════════ */}
      {showLoginModal && (
        <InventoryLoginModal 
          carImage={mainImage} 
          onClose={() => setShowLoginModal(false)} 
        />
      )}
    </div>
  )
}
