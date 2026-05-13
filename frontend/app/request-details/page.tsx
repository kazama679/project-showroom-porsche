'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronRight, Info } from 'lucide-react'

export default function RequestDetailsPage() {
  const [formData, setFormData] = useState({
    salutation: 'Mr',
    firstName: 'Quang',
    lastName: 'Nguyen',
    email: 'quanglienha123@gmail.com',
    countryCode: 'US +1',
    phone: '',
    message: 'Dear Porsche Center, I am interested in this Porsche.',
    dealer: '',
    financialOffer: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggleOffer = () => {
    setFormData(prev => ({
      ...prev,
      financialOffer: !prev.financialOffer
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button className="flex items-center gap-2 text-gray-900 font-light hover:opacity-75 transition-opacity">
            <ChevronRight size={18} className="rotate-180" />
            <span>Back to the Car Configurator</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Title */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-5xl font-light text-gray-900 mb-4 leading-tight">
            Let&apos;s talk about your build
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Contact us for help, quotes and consultation.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2px] space-y-8">
              {/* Section 1: Select Dealer */}
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-gray-900">
                  1. Select a local Porsche dealer
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-light text-gray-900">
                    Find a Porsche dealer near you <span className="text-red-600">*</span>
                  </label>
                  <p className="text-sm text-gray-500 font-light">Enter ZIP, town or street</p>
                  <input
                    type="text"
                    name="dealer"
                    placeholder="e.g. New York"
                    value={formData.dealer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Section 2: Contact Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-light text-gray-900">
                  2. Tell us how to contact you
                </h2>

                {/* Salutation */}
                <div>
                  <label htmlFor="salutation" className="block text-sm font-light text-gray-900 mb-2">
                    Salutation <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="salutation"
                    id="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Dr">Dr.</option>
                  </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-light text-gray-900 mb-2">
                      First name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-light text-gray-900 mb-2">
                      Last name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-light text-gray-900 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-light text-gray-900 mb-2">
                    Mobile number
                  </label>
                  <div className="flex gap-4">
                    <div className="w-32">
                      <p className="text-xs text-gray-500 font-light mb-1">Country code</p>
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      >
                        <option value="US +1">US +1</option>
                        <option value="CA +1">CA +1</option>
                        <option value="UK +44">UK +44</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-light mb-1">Phone number e.g. (201) 555-0123</p>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="(201) 555-0123"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-light text-gray-900 mb-2">
                    Your message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-900 rounded-[2px] font-light text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                {/* Financial Offer */}
                <button
                  type="button"
                  onClick={handleToggleOffer}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-900 rounded-[2px] text-gray-900 font-light hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">+</span>
                  <span>Add non-binding financial offer.</span>
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 p-6 rounded-[2px] space-y-4">
                <h3 className="text-lg font-light text-gray-900">Privacy Notice</h3>
                <p className="text-sm text-gray-700 font-light leading-relaxed">
                  By providing your contact information, we assume that you are consenting to be contacted by Porsche Cars North America, Inc. (PCNA), its affiliate companies and our Porsche Centers. To the extent permitted by law, your permission supersedes any prior opt-outs given to PCNA as well as any government registries of Do Not Call Lists. Your information may be used to inform you about Porsche products, services, news and events in accordance with our Privacy Notice which can be located{' '}
                  <button className="text-blue-600 hover:underline font-light">here</button>. You may opt out at any time by clicking the &quot;Unsubscribe&quot; link available in our newsletter, by calling 1-800-PORSCHE, or by sending an email to{' '}
                  <button className="text-blue-600 hover:underline font-light">privacy@porsche.us</button>. California residents may view our California Privacy Notice{' '}
                  <button className="text-blue-600 hover:underline font-light">here</button>.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-3 font-light rounded-[2px] hover:bg-gray-900 transition-colors"
              >
                Submit
              </button>

              {/* Footer Note */}
              <p className="text-xs text-gray-600 font-light">
                Fields marked with <span className="text-red-600">*</span> are mandatory
              </p>
              <p className="text-xs text-gray-600 font-light">
                This site is protected by reCAPTCHA and the Google{' '}
                <button className="text-blue-600 hover:underline">Privacy Policy</button> and{' '}
                <button className="text-blue-600 hover:underline">Terms of Service</button> apply.
              </p>
            </form>
          </div>

          {/* Right Column - Car Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white p-6 rounded-[2px]">
              {/* Car Image */}
              <div className="bg-gray-300 rounded-[2px] h-48 mb-6 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                  alt="Taycan Turbo S"
                  fill
                  unoptimized
                  className="object-cover rounded-[2px]"
                />
              </div>

              {/* Car Details */}
              <div className="space-y-2">
                <h3 className="text-xl font-light text-gray-900">Taycan Turbo S</h3>
                <p className="text-2xl font-light text-gray-900">$223,750.00</p>
                <p className="text-sm text-gray-600 font-light">Price</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
