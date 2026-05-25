'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Search, X, Edit2, ChevronRight, Loader2, LocateFixed, Check, Copy } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { cn } from '@/lib/utils'
import { configuratorService, mapConfiguratorResponse } from '@/lib/configurator'
import { ConfiguratorModel, formatPrice } from '@/lib/configurator-data'
import { carBuildApi } from '@/lib/car-build-api'
import { submitInquiry, InquiryPayload } from '@/lib/inquiry-api'

export default function RequestDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <RequestDetailsContent />
    </Suspense>
  )
}

function RequestDetailsContent() {
  const [formData, setFormData] = useState({
    salutation: 'Ông',
    firstName: 'Quang',
    lastName: 'Nguyen',
    email: 'quanglienha123@gmail.com',
    countryCode: 'Mỹ +1',
    phone: '',
    message: 'Dear Porsche Center, I am interested in this Porsche.',
  })

  const [dealer, setDealer] = useState<{name: string, address: string, distance: string} | null>(null)
  const [showDealerModal, setShowDealerModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({ dealer: false, salutation: false, firstName: false, lastName: false, email: false })

  const handleSubmit = async () => {
    const newErrors = { dealer: false, salutation: false, firstName: false, lastName: false, email: false }
    let hasError = false
    let firstErrorField: string | null = null
    
    if (!dealer) { newErrors.dealer = true; hasError = true; if (!firstErrorField) firstErrorField = 'dealer'; }
    if (!formData.salutation) { newErrors.salutation = true; hasError = true; if (!firstErrorField) firstErrorField = 'salutation'; }
    if (!formData.firstName.trim()) { newErrors.firstName = true; hasError = true; if (!firstErrorField) firstErrorField = 'firstName'; }
    if (!formData.lastName.trim()) { newErrors.lastName = true; hasError = true; if (!firstErrorField) firstErrorField = 'lastName'; }
    if (!formData.email.trim()) { newErrors.email = true; hasError = true; if (!firstErrorField) firstErrorField = 'email'; }

    setErrors(newErrors)

    if (!hasError) {
      setIsSubmitting(true)
      try {
        const pCode = isNaN(Number(modelIdParam)) ? (modelIdParam || 'P-0000') : 'P-0000';
        const payload: InquiryPayload = {
          salutation: formData.salutation,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          countryCode: formData.countryCode,
          phoneNumber: formData.phone,
          message: formData.message,
          dealerName: dealer?.name,
          dealerAddress: dealer?.address,
          porscheCode: pCode,
          carName: modelData?.name,
          carPrice: modelData?.baseMsrp,
          basePrice: modelData?.baseMsrp
        }
        
        const carImg = modelData?.defaultImage || 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp';
        const optId = isNaN(Number(modelIdParam)) ? undefined : Number(modelIdParam);

        await submitInquiry(payload, optId, carImg)
        setIsSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        console.error(err)
      } finally {
        setIsSubmitting(false)
      }
    } else if (firstErrorField) {
      const el = document.getElementById(firstErrorField)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }
  
  const searchParams = useSearchParams()
  const modelIdParam = searchParams?.get('modelId')
  
  const [modelData, setModelData] = useState<ConfiguratorModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let active = true

    async function loadModel() {
      if (!modelIdParam) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const isPorscheCode = isNaN(Number(modelIdParam))
        let targetId = Number(modelIdParam)

        if (isPorscheCode) {
          const build = await carBuildApi.getBuildByCode(modelIdParam)
          if (active) {
            targetId = build.modelId
          }
        }

        if (!active) return

        const data = await configuratorService.getByCarModelId(targetId)
        if (active) {
          const mapped = mapConfiguratorResponse(data)
          setModelData(mapped.model)
        }
      } catch (err) {
        console.error('Failed to load model data:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadModel()

    return () => { active = false }
  }, [modelIdParam])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 text-near-black">
      <SiteHeader logoHref="/" />

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        
        {/* Back button */}
        <Link 
          href={modelIdParam ? `/configurator/${modelIdParam}` : '/models'}
          className="inline-flex items-center gap-2 text-sm text-near-black hover:opacity-70 font-light mb-12 transition-opacity"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Quay lại Trình cấu hình xe</span>
        </Link>

        {/* Page Title */}
        <div className="text-center mb-16 max-w-2xl mx-auto px-4">
          <h1 className="text-[2rem] md:text-[2.5rem] font-light mb-2 leading-[1.2]">
            Hãy cùng thảo luận về cấu hình máy tính của bạn.
          </h1>
          <p className="text-base text-near-black font-light">
            Hãy liên hệ với chúng tôi để được hỗ trợ, báo giá và tư vấn.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Left Column */}
          {isSubmitted ? (
            <div className="bg-white p-8 rounded-[20px] shadow-sm">
              <div className="w-20 h-20 bg-green-50 rounded-xl flex items-center justify-center mb-8">
                <Check size={32} className="text-near-black" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-[1.75rem] font-light mb-6 text-near-black">
                Yêu cầu của bạn đã được gửi thành công.
              </h2>
              
              <p className="text-[15px] font-light text-near-black mb-6 leading-relaxed">
                Yêu cầu của bạn đã được gửi thành công đến <strong>{dealer?.name}</strong>. Họ sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
              
              <p className="text-[15px] font-light text-near-black mb-8 leading-relaxed">
                Bản tóm tắt cũng đã được gửi đến <strong>{formData.email}</strong>. Có thể mất 2-3 phút để bạn nhận được bản tóm tắt này. Nếu không thấy trong hộp thư đến, có thể nó đã bị chuyển vào thư mục thư rác.
              </p>
              
              <h3 className="text-[1.125rem] font-light text-near-black mb-4">
                Cấu hình của bạn
              </h3>
              
              <div className="border border-near-black rounded-xl p-6 mb-12 w-full max-w-[320px]">
                <p className="text-[11px] text-near-black font-medium tracking-wide mb-1">Mã Porsche</p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[1.375rem] font-medium text-near-black">{modelIdParam || 'PTGYLZZ2'}</span>
                  <button className="text-near-black hover:opacity-70 transition-opacity" onClick={() => navigator.clipboard.writeText(modelIdParam || 'PTGYLZZ2')}>
                    <Copy size={20} strokeWidth={1.5} />
                  </button>
                </div>
                
                <p className="text-[13px] font-light text-near-black leading-relaxed mb-4">
                  Bạn có thể truy cập cấu hình xe của mình trong Trình cấu hình xe Porsche bằng Mã Porsche này.
                </p>
                <p className="text-[13px] font-light text-near-black leading-relaxed">
                  Vui lòng lưu ý rằng Mã Porsche sẽ thay đổi nếu bạn chỉnh sửa cấu hình.
                </p>
              </div>
              
              <Link 
                href={modelIdParam ? `/configurator/${modelIdParam}` : '/models'}
                className="inline-block bg-black text-white px-8 py-3.5 rounded-lg text-[15px] font-medium hover:bg-black/90 transition-colors"
              >
                Quay lại Trình cấu hình xe
              </Link>
            </div>
          ) : (
          <div className="space-y-8">
            
            {/* Section 1: Select Dealer */}
            <div id="dealer" className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm">
              <h2 className="text-xl md:text-[1.375rem] font-light mb-6">
                1. Chọn một đại lý Porsche gần bạn
              </h2>
              
              {!dealer ? (
                <div className="space-y-1">
                  <label className={cn("block text-sm font-medium mb-1.5", errors.dealer ? "text-red-500" : "text-near-black")}>
                    Tìm đại lý Porsche gần bạn <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-dark-gray font-light pb-1">
                    Nhập mã bưu chính, thành phố hoặc đường phố
                  </p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-gray" size={18} strokeWidth={1.5} />
                    <input
                      type="text"
                      placeholder="ví dụ New York"
                      onClick={() => setShowDealerModal(true)}
                      readOnly
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl font-light text-near-black focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-near-black font-light">Trung tâm Porsche bạn đã chọn</p>
                  <div className="relative bg-gray-200 p-5 rounded-xl border border-transparent">
                    <button 
                      type="button"
                      onClick={() => setShowDealerModal(true)}
                      className="absolute top-4 right-4 text-dark-gray hover:text-near-black transition-colors"
                      aria-label="Edit dealer"
                    >
                      <Edit2 size={16} strokeWidth={1.5} />
                    </button>
                    <h3 className="text-base font-light text-near-black mb-1 pr-8">{dealer.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-sm font-light text-near-black mr-2">{dealer.address}</p>
                      <span className="inline-flex rounded-full bg-light-gray-surface px-3 py-1 text-xs font-light text-near-black whitespace-nowrap">
                        {dealer.distance}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-200 mx-8" />

            {/* Section 2: Contact Information */}
            <div className="bg-white p-6 md:p-8 rounded-[20px] shadow-sm">
              <h2 className="text-xl md:text-[1.375rem] font-light mb-8">
                2. Hãy cho chúng tôi biết cách liên lạc với bạn.
              </h2>
              
              <div className="space-y-6">
                {/* Salutation */}
                <div>
                  <label htmlFor="salutation" className="block text-sm font-medium text-near-black mb-1.5">
                    Lời chào <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="salutation"
                    id="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    className={cn("w-full md:w-1/3 px-4 py-3.5 bg-gray-100 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400 appearance-none", errors.salutation ? "border-2 border-red-500" : "border border-gray-200")}
                  >
                    <option value="Ông">Ông</option>
                    <option value="Bà">Bà</option>
                    <option value="Cô">Cô</option>
                  </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-near-black mb-1.5">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={cn("w-full px-4 py-3.5 bg-gray-100 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400", errors.firstName ? "border-2 border-red-500" : "border border-gray-200")}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-near-black mb-1.5">
                      Họ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={cn("w-full px-4 py-3.5 bg-gray-100 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400", errors.lastName ? "border-2 border-red-500" : "border border-gray-200")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-near-black mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={cn("w-full px-4 py-3.5 bg-gray-100 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400", errors.email ? "border-2 border-red-500" : "border border-gray-200")}
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <h3 className="text-sm font-medium text-near-black mb-1.5">
                    Số điện thoại di động
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3">
                      <label className="block text-xs text-dark-gray font-light mb-1">Mã quốc gia</label>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400 appearance-none"
                      >
                        <option value="Mỹ +1">Mỹ +1</option>
                        <option value="VN +84">VN +84</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-dark-gray font-light mb-1">Số điện thoại ví dụ (201) 555-0123</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h3 className="text-sm font-medium text-near-black mb-1.5">
                    Thông điệp của bạn
                  </h3>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-xl font-light text-near-black focus:outline-none focus:border-neutral-400 resize-y"
                  />
                </div>

                {/* Consent Text */}
                <div className="text-sm text-neutral-700 font-light leading-relaxed mt-8">
                  Bằng cách cung cấp thông tin liên hệ của bạn, chúng tôi hiểu rằng bạn đồng ý được liên hệ bởi Porsche Cars North America, Inc. (PCNA), các công ty liên kết và các Trung tâm Porsche của chúng tôi. Trong phạm vi pháp luật cho phép, sự đồng ý của bạn sẽ thay thế bất kỳ sự từ chối nào trước đó đã được gửi đến PCNA cũng như bất kỳ danh sách &ldquo;Không gọi&rdquo; nào của chính phủ. Thông tin của bạn có thể được sử dụng để thông báo cho bạn về các sản phẩm, dịch vụ, tin tức và sự kiện của Porsche theo Thông báo về Quyền riêng tư của chúng tôi, có thể tìm thấy <a href="#" className="underline hover:text-black">tại đây</a>. Bạn có thể hủy đăng ký bất cứ lúc nào bằng cách nhấp vào liên kết &ldquo;Hủy đăng ký&rdquo; có trong bản tin của chúng tôi, bằng cách gọi đến số 1-800-PORSCHE hoặc bằng cách gửi email đến <a href="mailto:privacy@porsche.us" className="underline hover:text-black">privacy@porsche.us</a>. Cư dân California có thể xem Thông báo về Quyền riêng tư dành cho California của chúng tôi <a href="#" className="underline hover:text-black">tại đây</a>.
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-lg text-[15px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Nộp
                  </button>
                </div>

                {/* Footer Disclaimers */}
                <div className="mt-8 space-y-1">
                  <p className="text-sm text-near-black font-medium">
                    Các trường có dấu * là bắt buộc
                  </p>
                  <p className="text-xs text-dark-gray font-light">
                    Trang web này được bảo vệ bởi reCAPTCHA và Google. <a href="#" className="underline hover:text-black">Chính sách bảo mật</a> và <a href="#" className="underline hover:text-black">Điều khoản dịch vụ</a> áp dụng.
                  </p>
                </div>

              </div>
            </div>
            
          </div>
          )}

          {/* Right Column - Car Summary */}
          <div className="lg:sticky lg:top-[5.5rem]">
            <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-200">
              {loading ? (
                <div className="h-48 md:h-[220px] w-full flex items-center justify-center bg-gray-100">
                  <Loader2 className="w-6 h-6 animate-spin text-dark-gray" />
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 relative h-48 md:h-[220px] w-full">
                    <Image
                      src={modelData?.defaultImage || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"}
                      alt={modelData?.name || "Car"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
    
                  <div className="p-6 md:p-8 min-h-[160px] flex flex-col justify-between">
                    <h3 className="text-lg md:text-[1.25rem] font-light text-near-black mb-3 leading-tight">
                      {modelData?.name ? `Porsche ${modelData.name}` : 'Mẫu xe hiện chưa có thông tin'}
                    </h3>
                    <div>
                      <p className="text-sm md:text-[15px] font-medium text-near-black mb-1">
                        {modelData ? formatPrice(modelData.baseMsrp) : '--'}
                      </p>
                      <p className="text-[11px] text-dark-gray font-light uppercase tracking-wider">Giá cơ bản</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
        </div>
      </main>

      {/* Dealer Selection Modal */}
      {showDealerModal && (
        <DealerModal 
          onClose={() => setShowDealerModal(false)} 
          onSelect={(d) => {
            setDealer(d)
            setShowDealerModal(false)
          }}
        />
      )}
    </div>
  )
}

/** All known Porsche dealers with lat/lon for distance calculation */
const PORSCHE_DEALERS = [
  { name: 'Porsche Centre Sài Gòn', address: '802 Nguyễn Văn Linh, Quận 7, TP. HCM', lat: 10.7326, lon: 106.7196 },
  { name: 'Porsche Centre Hà Nội', address: 'Số 562 Nguyễn Văn Cừ, Long Biên, Hà Nội', lat: 21.0468, lon: 105.8745 },
  { name: 'Porsche Centre Đà Nẵng', address: '99 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { name: 'Manhattan Motorcars', address: '711 Đại lộ số Mười Một, New York, 10019', lat: 40.7648, lon: -73.9908 },
  { name: 'Porsche Brooklyn', address: '3906 Đại lộ số 2, Brooklyn, 11232', lat: 40.6568, lon: -73.9929 },
  { name: 'Porsche Englewood', address: '105 Đại lộ Grand, Englewood, 07631', lat: 40.8929, lon: -73.9712 },
  { name: 'Porsche Beverly Hills', address: '8423 Wilshire Blvd, Beverly Hills, CA 90211', lat: 34.0625, lon: -118.3706 },
  { name: 'Porsche Fremont', address: '5740 Cushing Pkwy, Fremont, CA 94538', lat: 37.5260, lon: -121.9617 },
  { name: 'Porsche Centre Tokyo', address: 'Minato City, Tokyo, Japan', lat: 35.6585, lon: 139.7454 },
  { name: 'Porsche Centre Singapore', address: '29 Leng Kee Road, Singapore', lat: 1.2886, lon: 103.8065 },
  { name: 'Porsche Centre London', address: 'Reading, Berkshire, UK', lat: 51.4545, lon: -0.9781 },
  { name: 'Porsche Centre Paris', address: 'Levallois-Perret, Île-de-France', lat: 48.8947, lon: 2.2876 },
]

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1).replace('.', ',')} km`
  return `${Math.round(km).toLocaleString('vi-VN')} km`
}

type LocationSuggestion = { display_name: string; lat: string; lon: string }

function DealerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (dealer: any) => void }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lon: number } | null>(null)
  const [nearbyDealers, setNearbyDealers] = useState<{ name: string; address: string; distance: string }[]>([])

  // Debounced geocoding search
  useEffect(() => {
    if (selectedLocation) return // don't search while showing dealers
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=vi`
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, selectedLocation])

  // When a location is selected, compute nearby dealers
  const handlePickLocation = (loc: LocationSuggestion) => {
    const lat = parseFloat(loc.lat)
    const lon = parseFloat(loc.lon)
    setSelectedLocation({ name: loc.display_name, lat, lon })
    setQuery(loc.display_name)
    setSuggestions([])

    const dealers = PORSCHE_DEALERS.map((d) => ({
      ...d,
      distanceKm: haversineKm(lat, lon, d.lat, d.lon),
    }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((d) => ({
        name: d.name,
        address: d.address,
        distance: formatDistance(d.distanceKm),
      }))

    setNearbyDealers(dealers)
  }

  const handleClearSearch = () => {
    setQuery('')
    setSuggestions([])
    setSelectedLocation(null)
    setNearbyDealers([])
  }

  const handleCurrentLocation = () => {
    // Simulate using current location → default to Hà Nội center
    handlePickLocation({ display_name: 'Vị trí hiện tại', lat: '21.0285', lon: '105.8542' })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop – dark and blurred overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      {/* Slide-in panel from right side */}
      <div className="relative bg-white w-full max-w-[100%] md:max-w-[520px] lg:max-w-[640px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-10 md:right-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black hover:bg-neutral-200 transition-colors z-10"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="px-6 pb-4 md:px-12 pt-6 md:pb-6">
          <h2 className="text-[26px] md:text-[34px] leading-[1.1] font-medium tracking-tight text-black mb-6 pr-10">
            Chọn đại lý Porsche tại địa phương
          </h2>

          <div className="mb-2">
            <p className="text-[14px] font-medium text-black mb-1">
              Tìm đại lý Porsche gần bạn
            </p>
            <p className="text-[12px] text-neutral-500 mb-4">
              Nhập mã bưu chính, thành phố hoặc đường phố
            </p>

            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (selectedLocation) {
                    setSelectedLocation(null)
                    setNearbyDealers([])
                  }
                }}
                placeholder="Ví dụ New York"
                className="w-full h-[52px] px-4 bg-white border border-neutral-300 rounded-xl text-[14px] text-black focus:outline-none focus:border-black placeholder-neutral-500"
              />
              {query && (
                <button onClick={handleClearSearch} className="absolute right-4 flex w-8 h-8 items-center justify-center text-neutral-500 hover:text-black transition-colors">
                  <X size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body – scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-12 md:px-14">
          
          {/* State 1: No query – show "Use current location" */}
          {!query.trim() && !selectedLocation && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleCurrentLocation}
                className="inline-block text-[15px] font-medium text-black hover:opacity-70 transition-opacity underline underline-offset-4"
              >
                Sử dụng vị trí hiện tại
              </button>
            </div>
          )}

          {/* State 2: Typing – show location suggestions dropdown */}
          {query.trim() && !selectedLocation && (
            <div className="mt-4">
              {loadingSuggestions ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="rounded-2xl border border-neutral-300 bg-white overflow-hidden shadow-sm">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePickLocation(item)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left border-b border-neutral-300 last:border-0 hover:bg-neutral-50 transition-colors"
                    >
                      <p className="text-[15px] font-medium text-black line-clamp-1 pr-3">
                        {item.display_name}
                      </p>
                      <ChevronRight size={18} className="text-neutral-400 flex-shrink-0" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="pt-6 text-center text-[15px] text-neutral-500 font-light">
                  Không tìm thấy kết quả nào
                </p>
              )}
            </div>
          )}

          {/* State 3: Location selected – show nearby Porsche dealers as cards */}
          {selectedLocation && nearbyDealers.length > 0 && (
            <div className="space-y-4">
              {nearbyDealers.map((dealer, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelect(dealer)}
                  className="w-full block bg-neutral-100 rounded-[12px] p-6 text-left hover:bg-neutral-200 transition-colors group"
                >
                  <h3 className="text-[20px] font-medium text-black">
                    {dealer.name}
                  </h3>
                  <p className="text-[16px] leading-[1.6] text-neutral-600">
                    {dealer.address}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-neutral-200 group-hover:bg-neutral-300 px-4 py-2 text-[15px] font-medium text-neutral-800 transition-colors">
                      Cách {dealer.distance}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-sm group-hover:scale-105 transition-transform">
                      <ChevronRight size={18} strokeWidth={2} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

