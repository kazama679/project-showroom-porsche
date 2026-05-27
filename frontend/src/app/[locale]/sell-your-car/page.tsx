'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Check, ChevronRight, Loader2, UploadCloud, X, AlertCircle } from 'lucide-react'
import { SiteHeader } from '@/components/features/layout/site-header'
import { cn } from '@/utils/cn'
import { vehicleListingApi, VehicleListingData, ImageUpload } from '@/services/vehicle-listing-api'
import { toast } from 'sonner'

const STEPS = 7

export default function SellYourCarPage() {
  const t = useTranslations('sellCar')
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Form State
  const [formData, setFormData] = useState<VehicleListingData>({
    vin: '',
    make: 'Porsche',
    model: '',
    trimLevel: '',
    modelYear: new Date().getFullYear(),
    mileage: 0,
    exteriorColor: '',
    interiorColor: '',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    drivetrain: 'RWD',
    seats: 2,
    registrationArea: '',
    askingPrice: 0,
    isNegotiable: true,
    paymentMethods: '',
    hasLien: false,
    zipCode: '',
    city: '',
    stateProvince: '',
    supportsShipping: false,
    acceptsTradeIn: false,
    hasAccident: false,
    accidentDescription: '',
    hasFloodDamage: false,
    hasRepaint: false,
    repaintDescription: '',
    engineCondition: '',
    transmissionCondition: '',
    tireCondition: '',
    brakeCondition: '',
    hasWarningLights: false,
    hasElectricalIssues: false,
    hasModifications: false,
    modificationsDescription: '',
    hasSmokingPetExposure: false,
    conditionDescription: '',
    hasServiceRecords: true,
    dealerServiced: false,
    lastServiceMileage: 0,
    hasRepairInvoices: false,
    titleStatus: 'Clean',
    hasOpenRecalls: false,
    registrationValidUntil: '',
    ownerNumber: 1,
    hasCarfaxReport: false,
    sellerFullName: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerCity: '',
    sellerState: '',
    sellerType: 'Private',
    preferredContactTime: '',
    preferredContactMethod: 'Email',
  })

  const [images, setImages] = useState<ImageUpload[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleNext = () => {
    // Basic validation per step can be added here
    if (currentStep < STEPS) setCurrentStep(s => s + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await vehicleListingApi.createListing(formData, images)
      setIsSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onImageAdd = (file: File, type: string) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    const preview = URL.createObjectURL(file)
    setImages(prev => {
      // Remove existing image of exact same type to replace
      const filtered = prev.filter(img => img.type !== type)
      return [...filtered, { file, type, preview }]
    })
  }

  const removeImage = (type: string) => {
    setImages(prev => prev.filter(img => img.type !== type))
  }

  // Helper arrays for selects
  const porscheModels = ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman']
  const fuelTypes = ['Gasoline', 'Electric', 'Hybrid']
  const titleStatuses = ['Clean', 'Salvage', 'Rebuilt']

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 text-near-black">
        <SiteHeader logoHref="/" />
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
          <div className="bg-white p-8 md:p-12 rounded-[20px] shadow-sm max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check size={32} className="text-green-600" strokeWidth={2} />
            </div>
            <h1 className="text-[2rem] font-light mb-4">{t('success_title')}</h1>
            <p className="text-[15px] font-light text-neutral-600 mb-8 leading-relaxed">
              {t('success_desc')}
            </p>
            <Link 
              href="/"
              className="inline-block bg-black text-white px-8 py-4 rounded-lg text-[15px] font-medium hover:bg-black/90 transition-colors"
            >
              {t('back_home')}
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 text-near-black pb-24">
      <SiteHeader logoHref="/" />
      
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-near-black hover:opacity-70 font-light mb-12 transition-opacity"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>{t('btn_prev')}</span>
        </Link>

        <div className="mb-12">
          <h1 className="text-[2rem] md:text-[2.5rem] font-light mb-2 leading-[1.2]">
            {t('title')}
          </h1>
          <p className="text-base text-neutral-600 font-light">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* Left Column: Form Content */}
          <div className="bg-white p-6 md:p-10 rounded-[20px] shadow-sm">
            
            {/* Step 1: General & VIN */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b border-gray-100">{t('step1_title')}</h2>
                <InputField label={t('vin')} name="vin" value={formData.vin} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('make')}</label>
                    <input type="text" readOnly value="Porsche" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-light text-neutral-500" />
                  </div>
                  <SelectField label={t('model')} name="model" value={formData.model} onChange={handleChange} options={porscheModels} required />
                  <InputField label={t('year')} name="modelYear" type="number" value={formData.modelYear} onChange={handleChange} required />
                  <InputField label={t('trim')} name="trimLevel" value={formData.trimLevel} onChange={handleChange} placeholder="e.g. Carrera S" />
                  <InputField label={t('mileage')} name="mileage" type="number" value={formData.mileage} onChange={handleChange} required />
                  <InputField label={t('ext_color')} name="exteriorColor" value={formData.exteriorColor} onChange={handleChange} />
                  <InputField label={t('int_color')} name="interiorColor" value={formData.interiorColor} onChange={handleChange} />
                  <SelectField label={t('fuel')} name="fuelType" value={formData.fuelType} onChange={handleChange} options={fuelTypes} />
                  <SelectField label={t('transmission')} name="transmission" value={formData.transmission} onChange={handleChange} options={['Automatic', 'Manual']} />
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b border-gray-100">{t('step2_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label={t('asking_price')} name="askingPrice" type="number" value={formData.askingPrice} onChange={handleChange} required />
                  <CheckboxField label={t('negotiable')} name="isNegotiable" checked={formData.isNegotiable} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <InputField label={t('payment_methods')} name="paymentMethods" value={formData.paymentMethods} onChange={handleChange} placeholder="e.g. Wire Transfer, Cashiers Check" />
                  </div>
                  <CheckboxField label={t('lien')} name="hasLien" checked={formData.hasLien} onChange={handleChange} />
                  <CheckboxField label={t('trade_in')} name="acceptsTradeIn" checked={formData.acceptsTradeIn} onChange={handleChange} />
                  <InputField label={t('zip')} name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                  <InputField label={t('city')} name="city" value={formData.city} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Step 3: Condition */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b border-gray-100">{t('step3_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <CheckboxField label={t('accident')} name="hasAccident" checked={formData.hasAccident} onChange={handleChange} />
                    {formData.hasAccident && (
                      <InputField label={t('accident_desc')} name="accidentDescription" value={formData.accidentDescription} onChange={handleChange} />
                    )}
                  </div>
                  <div className="space-y-4">
                    <CheckboxField label={t('repaint')} name="hasRepaint" checked={formData.hasRepaint} onChange={handleChange} />
                    {formData.hasRepaint && (
                      <InputField label={t('repaint_desc')} name="repaintDescription" value={formData.repaintDescription} onChange={handleChange} />
                    )}
                  </div>
                  <CheckboxField label={t('mods')} name="hasModifications" checked={formData.hasModifications} onChange={handleChange} />
                  {formData.hasModifications && (
                    <InputField label={t('mods_desc')} name="modificationsDescription" value={formData.modificationsDescription} onChange={handleChange} />
                  )}
                  <CheckboxField label={t('flood')} name="hasFloodDamage" checked={formData.hasFloodDamage} onChange={handleChange} />
                  <CheckboxField label={t('warning_lights')} name="hasWarningLights" checked={formData.hasWarningLights} onChange={handleChange} />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1.5">{t('condition_desc')}</label>
                  <textarea 
                    name="conditionDescription" 
                    value={formData.conditionDescription} 
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-light text-near-black focus:outline-none focus:border-black resize-y" 
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents and History */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b border-gray-100">{t('step4_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CheckboxField label={t('service_records')} name="hasServiceRecords" checked={formData.hasServiceRecords} onChange={handleChange} />
                  <CheckboxField label={t('dealer_serviced')} name="dealerServiced" checked={formData.dealerServiced} onChange={handleChange} />
                  <SelectField label={t('title_status')} name="titleStatus" value={formData.titleStatus} onChange={handleChange} options={titleStatuses} />
                  <InputField label={t('owner_num')} name="ownerNumber" type="number" value={formData.ownerNumber} onChange={handleChange} />
                  <CheckboxField label={t('carfax')} name="hasCarfaxReport" checked={formData.hasCarfaxReport} onChange={handleChange} />
                  <CheckboxField label={t('recalls')} name="hasOpenRecalls" checked={formData.hasOpenRecalls} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Step 5: Contact Info */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-6 pb-4 border-b border-gray-100">{t('step5_title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label={t('fullname')} name="sellerFullName" value={formData.sellerFullName} onChange={handleChange} required />
                  <InputField label={t('email')} name="sellerEmail" type="email" value={formData.sellerEmail} onChange={handleChange} required />
                  <InputField label={t('phone')} name="sellerPhone" value={formData.sellerPhone} onChange={handleChange} />
                  <SelectField label={t('seller_type')} name="sellerType" value={formData.sellerType} onChange={handleChange} options={['Private', 'Dealer']} />
                </div>
              </div>
            )}

            {/* Step 6: Images */}
            {currentStep === 6 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-2">{t('step6_title')}</h2>
                <p className="text-sm text-neutral-500 mb-6 pb-4 border-b border-gray-100">Upload clear, well-lit photos under 10MB each.</p>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('req_images')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ImageUploadCard label={t('upload_front')} type="FRONT" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_rear')} type="REAR" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_side_l')} type="SIDE_LEFT" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_side_r')} type="SIDE_RIGHT" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_interior')} type="INTERIOR" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_odometer')} type="ODOMETER" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                    <ImageUploadCard label={t('upload_dash')} type="DASHBOARD" images={images} onAdd={onImageAdd} onRemove={removeImage} required />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t('opt_images')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ImageUploadCard label={t('upload_wheels')} type="WHEEL_TIRE" images={images} onAdd={onImageAdd} onRemove={removeImage} />
                    <ImageUploadCard label={t('upload_engine')} type="ENGINE_BAY" images={images} onAdd={onImageAdd} onRemove={removeImage} />
                    <ImageUploadCard label={t('upload_damage')} type="DAMAGE" images={images} onAdd={onImageAdd} onRemove={removeImage} />
                    <ImageUploadCard label={t('upload_title')} type="TITLE_DOC" images={images} onAdd={onImageAdd} onRemove={removeImage} sensitive />
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h2 className="text-xl font-medium mb-2">{t('step7_title')}</h2>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800 text-sm mb-6">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p>{t('review_desc')}</p>
                </div>

                <div className="space-y-6 text-sm">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3 text-base">Vehicle</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-neutral-500">VIN</span><span className="font-medium text-right">{formData.vin || '-'}</span>
                      <span className="text-neutral-500">Vehicle</span><span className="font-medium text-right">{formData.make} {formData.model} {formData.trimLevel} ({formData.modelYear})</span>
                      <span className="text-neutral-500">Mileage</span><span className="font-medium text-right">{formData.mileage?.toLocaleString() || '-'}</span>
                      <span className="text-neutral-500">Colors</span><span className="font-medium text-right">{formData.exteriorColor || '-'} / {formData.interiorColor || '-'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3 text-base">Pricing</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-neutral-500">Asking Price</span><span className="font-medium text-right">${formData.askingPrice?.toLocaleString() || '-'}</span>
                      <span className="text-neutral-500">Location</span><span className="font-medium text-right">{formData.city || '-'}, {formData.zipCode || '-'}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3 text-base">Contact</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-neutral-500">Name</span><span className="font-medium text-right">{formData.sellerFullName}</span>
                      <span className="text-neutral-500">Email</span><span className="font-medium text-right">{formData.sellerEmail}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3 text-base">Images ({images.length})</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map(img => (
                        <div key={img.type} className="w-16 h-16 rounded overflow-hidden flex-shrink-0 relative border border-gray-200">
                           <Image src={img.preview} alt={img.type} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons within main area */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('btn_prev')}
                </button>
              ) : <div></div>}
              
              {currentStep < STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg text-[15px] font-medium hover:bg-black/90 transition-colors"
                >
                  {t('btn_next')} <ChevronRight size={18} strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg text-[15px] font-medium hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {t('btn_submit')}
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:sticky lg:top-[5.5rem] hidden lg:block">
            <div className="bg-white rounded-[20px] shadow-sm p-8 border border-gray-200 space-y-6">
              <div>
                <p className="text-sm text-neutral-500 mb-2">Step {currentStep} of {STEPS}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                  <div className="bg-black h-1.5 rounded-full transition-all duration-300" style={{ width: `${(currentStep / STEPS) * 100}%` }}></div>
                </div>
              </div>
              
              <h3 className="font-medium text-lg border-b border-gray-100 pb-2">Listing Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Vehicle</span>
                  <span className="font-medium text-right line-clamp-1">{formData.model ? `${formData.make} ${formData.model}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Asking Price</span>
                  <span className="font-medium text-right">{formData.askingPrice ? `$${formData.askingPrice.toLocaleString()}` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">VIN</span>
                  <span className="font-medium text-right uppercase">{formData.vin || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Images Uploaded</span>
                  <span className="font-medium text-right text-blue-600">{images.length}/11</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}

// Subcomponents for Form
function InputField({ label, type = 'text', ...props }: { label: string, name: string, value?: string | number, onChange: any, type?: string, required?: boolean, placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-near-black">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...props}
        value={props.value ?? ''}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl font-light text-near-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-shadow"
      />
    </div>
  )
}

function SelectField({ label, options, ...props }: { label: string, name: string, value?: string, onChange: any, options: string[], required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-near-black">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        value={props.value ?? ''}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl font-light text-near-black focus:outline-none focus:border-black appearance-none"
      >
        <option value="" disabled>Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CheckboxField({ label, ...props }: { label: string, name: string, checked?: boolean, onChange: any }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-0.5">
        <input type="checkbox" className="peer sr-only" {...props} checked={props.checked || false} />
        <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-black peer-checked:border-black transition-colors">
          <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
        </div>
      </div>
      <span className="text-sm font-medium text-neutral-800 pt-0.5 select-none">{label}</span>
    </label>
  )
}

function ImageUploadCard({ label, type, images, onAdd, onRemove, required, sensitive }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const existing = images.find((i: any) => i.type === type)

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="text-xs font-medium text-neutral-700 min-h-[48px] flex items-end pb-1">
        <span>{label} {required && <span className="text-red-500 ml-1">*</span>}</span>
      </div>
      
      {existing ? (
        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-gray-200 group">
          <Image src={existing.preview} alt={label} fill className="object-cover" />
          <button 
            type="button" 
            onClick={() => onRemove(type)}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors group p-4 text-center"
        >
          <UploadCloud className="text-gray-400 group-hover:text-black mb-2 transition-colors" size={24} />
          <span className="text-[11px] text-gray-500 group-hover:text-black font-medium transition-colors">
            {sensitive ? 'Upload Private' : 'Upload Image'}
          </span>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files?.[0]) onAdd(e.target.files[0], type)
          e.target.value = ''
        }} 
      />
    </div>
  )
}
