'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { vehicleListingApi, VehicleListingResponse } from '@/services/vehicle-listing-api'
import { SiteHeader } from '@/components/features/layout/site-header'

const FALLBACK_IMAGE = 'https://configurator.porsche.com/public/fallback-D2RQp9E7.webp'

export default function ContactDealerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const t = useTranslations('contactDealer')
  const [car, setCar] = useState<VehicleListingResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    salutation: 'Ông',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    zipCode: '',
    message: t('default_message')
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = parseInt(resolvedParams.id)
        const carData = await vehicleListingApi.getListingById(id)
        setCar(carData)
      } catch (error) {
        console.error('Failed to fetch car details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.id])

  const formatPrice = (price: number | undefined) => {
    if (!price) return '0,00'
    return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!car) return

    setFormError('')
    setFormSuccess(false)

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.zipCode || !formData.message) {
      setFormError(t('mandatory_fields'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:8080/api/v1/vehicle-listings/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: car.id,
          ...formData
        })
      })

      if (response.ok) {
        setFormSuccess(true)
        setTimeout(() => {
            router.push(`/inventory/${car.id}`)
        }, 2000)
      } else {
        setFormError(t('message_error'))
      }
    } catch (error) {
      setFormError(t('message_error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-[#f2f2f2] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('message_sending')}</div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-[60vh] bg-[#f2f2f2] flex flex-col items-center justify-center gap-6">
        <p className="text-gray-500 text-xl">Not found</p>
        <Link href="/inventory" className="text-blue-600 underline">Back to Inventory</Link>
      </div>
    )
  }

  const mainImage = car.images && car.images.length > 0 ? car.images[0].imageUrl : FALLBACK_IMAGE
  const dealerName = car.sellerFullName || 'Porsche Center'
  const dealerLocation = (car.city ? car.city : '') + (car.city && car.stateProvince ? ', ' : '') + (car.stateProvince ? car.stateProvince : '')

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <SiteHeader className="z-50 bg-transparent absolute top-0 w-full border-none" />
      {/* Back Link */}
      <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-5">
        <Link href={`/inventory/${car.id}`} className="inline-flex items-center gap-2 text-[15px] text-gray-900 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('back_link')}
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Content & Form */}
          <div className="flex-1 bg-white rounded-2xl p-8 lg:p-10 shadow-sm w-full">
            
            {/* Top Buttons matching screenshots */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button className="bg-black text-white text-[14px] font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
                {t('write_message')}
              </button>
              <button className="bg-[#f0f0f0] text-gray-900 text-[14px] font-medium px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">
                {t('setup_callback')}
              </button>
              <button className="bg-[#f0f0f0] text-gray-900 text-[14px] font-medium px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">
                {t('contact_phone')}
              </button>
            </div>

            <h1 className="text-[28px] font-medium text-gray-900 mb-4 tracking-tight whitespace-pre-line">
              {car.sellerType === 'Private' ? t('contact_owner_title') : t('contact_dealer_title', { dealer: dealerName })}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Message Block */}
              <div>
                <label className="block text-[13px] text-gray-600 mb-2">{t('message_placeholder')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-5 text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
              </div>

              <div className="pt-2">
                <h2 className="text-[22px] font-medium text-gray-900 mb-6">{t('title')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-[13px] text-gray-700 mb-2 font-medium">{t('salutation')}</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleInputChange}
                      className="w-full md:w-1/2 min-w-[200px] bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none cursor-pointer"
                    >
                      <option value="Ông">{t('mr')}</option>
                      <option value="Bà">{t('mrs')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] text-gray-700 mb-2 font-medium">{t('first_name')}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] text-gray-700 mb-2 font-medium">{t('last_name')}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[13px] text-gray-700 mb-2 font-medium">{t('email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-[13px] text-gray-700 mb-2 font-medium">{t('phone_number')}</p>
                    <div className="flex gap-4">
                      <div className="w-[120px]">
                        <p className="text-[12px] text-gray-500 mb-1">{t('country_code')}</p>
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none cursor-pointer"
                        >
                          <option value="+1">Mỹ +1</option>
                          <option value="+84">VN +84</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] whitespace-nowrap text-gray-500 mb-1">{t('phone_placeholder')}</p>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] text-gray-700 mb-2 font-medium">{t('zip_code')}</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full bg-[#f6f6f6] border border-[#e0e0e0] rounded-lg p-3.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-gray-400 lg:w-[200px]"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="mb-4 p-4 text-sm text-[white] bg-[#d5001c] rounded-lg font-medium inline-block flex items-center justify-center">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="mb-4 p-4 text-sm text-[white] bg-[#1a7e44] rounded-lg font-medium inline-block flex items-center justify-center">
                    {t('message_success')}
                  </div>
                )}

                <div className="mt-4 mb-8 border-t border-[#e0e0e0] pt-8">
                  <p className="text-[13px] text-gray-500 leading-relaxed text-justify mb-8">
                    {t('disclaimer')} <u>tại đây</u>. Bạn có thể hủy đăng ký bất cứ lúc nào bằng cách nhấp vào liên kết &quot;Hủy đăng ký&quot; có trong bản tin của chúng tôi, bằng cách gọi đến số 1-800-PORSCHE hoặc bằng cách gửi email đến <a href="mailto:privacy@porsche.us" className="underline">privacy@porsche.us</a>. Cư dân California có thể xem Thông báo về Quyền riêng tư dành cho California của chúng tôi <u>tại đây</u>.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white text-[15px] font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    {submitting ? t('message_sending') : t('submit_btn')}
                  </button>
                </div>

                <div className="pt-4 text-[13px] text-gray-500">
                  <p className="mb-2 font-medium text-gray-700">{t('mandatory_fields')}</p>
                  <p>Trang web này được bảo vệ bởi reCAPTCHA và Google. <a href="#" className="underline font-medium text-gray-900">Chính sách bảo mật</a> Và <a href="#" className="underline font-medium text-gray-900">Điều khoản dịch vụ</a> áp dụng.</p>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: Vehicle Summary & Dealer Info */}
          <div className="w-full lg:w-[360px] flex-shrink-0 space-y-6">
            
            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[16/10] relative bg-gray-100">
                <Image src={mainImage} fill alt="Car" className="object-cover" unoptimized />
              </div>
              <div className="p-6">
                <h3 className="text-[17px] font-medium text-gray-900 mb-2">
                  Porsche {car.model} {car.trimLevel} {car.modelYear}
                </h3>
                <p className="text-[14px] text-gray-700">
                  {formatPrice(car.askingPrice)} đô la
                </p>
              </div>
            </div>

            {/* Dealer Address Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h4 className="text-[16px] font-medium text-gray-900 mb-2">
                {car.sellerFullName || 'Porsche Center'}
              </h4>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                {car.sellerCity ? `${car.sellerCity}, ` : ''}{car.sellerState ? `${car.sellerState}, ` : ''}{car.zipCode || ''}
              </p>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
