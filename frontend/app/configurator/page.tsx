'use client'

import { useState } from 'react'
import { ChevronLeft, Heart, Share2, ChevronRight, Info, Search, MapPin, Toggle2 } from 'lucide-react'

export default function ConfiguratorPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary')
  const [expandedSection, setExpandedSection] = useState<string | null>('exterior-colors')
  const [searchRadius, setSearchRadius] = useState('nationwide')
  const [expandSearch, setExpandSearch] = useState(false)

  return (
    <div className="bg-white min-h-screen">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-[2px]">
              <ChevronLeft size={20} />
            </button>
            <button className="flex items-center gap-2 text-sm font-light hover:opacity-75">
              <Heart size={18} />
              <span>Save</span>
            </button>
            <button className="flex items-center gap-2 text-sm font-light hover:opacity-75">
              <Share2 size={18} />
              <span>Create Porsche Code</span>
            </button>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-500">Monthly Payment</p>
              <p className="text-lg font-medium">$3,773.65 /mo</p>
              <p className="text-xs text-gray-400">Calculate monthly pay...</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">$223,750</p>
              <p className="text-xs text-gray-400">All information is subj...</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-2 rounded-[2px] font-light text-sm transition-colors ${
                  activeTab === 'summary' 
                    ? 'border border-black' 
                    : 'border border-gray-300 hover:border-black'
                }`}
              >
                Summary
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-6 py-2 rounded-[2px] font-light text-sm transition-colors ${
                  activeTab === 'details' 
                    ? 'bg-black text-white' 
                    : 'border border-gray-300 hover:border-black'
                }`}
              >
                Request details
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-28 flex gap-8 max-w-7xl mx-auto px-6 py-8">
        {/* Left Column - Image Viewer */}
        <div className="flex-1">
          {/* Main Image */}
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg overflow-hidden mb-6 relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
              alt="Taycan Turbo S"
              className="w-full h-96 object-cover"
            />
            {/* Image Controls */}
            <div className="absolute bottom-6 left-6 flex gap-3">
              <button className="bg-white p-3 rounded-[2px] hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="bg-white p-3 rounded-[2px] hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 015.646 5.646L3 7.293M21 12a9 9 0 01-9 9m0 0l2.293-2.293M3 12a9 9 0 019-9m0 0l-2.293 2.293m11.414 4.414l1.414 1.414" />
                </svg>
              </button>
              <button className="bg-white p-3 rounded-[2px] hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </button>
              <button className="bg-white p-3 rounded-[2px] hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>
            </div>
            <button className="absolute bottom-6 right-6 bg-white px-4 py-2 rounded-[2px] font-light text-sm hover:bg-gray-100">
              Open 360° View
            </button>
            <button className="absolute top-6 right-6 bg-white p-3 rounded-[2px] hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-20 h-20 rounded-[2px] overflow-hidden border-2 ${
                  i === 0 ? 'border-black' : 'border-gray-300'
                } cursor-pointer hover:border-black transition-colors`}
              >
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                  alt={`Gallery ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Configuration Panel */}
        <div className="w-96">
          {/* Model Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-light mb-2">Taycan Turbo S <span className="text-sm text-gray-600">2026</span></h1>
            <button className="text-sm font-light text-black underline hover:opacity-75">
              Technical data and standard equipment
            </button>
          </div>

          {/* Configuration Recommendation */}
          <div className="bg-gray-50 p-4 rounded-[2px] mb-8 flex items-start gap-3">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png" alt="Config" className="w-16 h-16 rounded-[2px]" />
            <div>
              <p className="font-light text-sm">Discover configuration recommendations</p>
              <button className="flex items-center gap-1 text-blue-600 text-xs font-light mt-1 hover:opacity-75">
                See all <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Search Equipment */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search equipment options"
              className="w-full px-4 py-3 border border-gray-300 rounded-[2px] font-light text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* Color Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-light mb-4">Exterior Colors</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-light mb-3">Contrasts <span className="text-gray-400">$0</span></p>
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-[2px] cursor-pointer hover:border-black" title="White" />
                  <div className="w-10 h-10 bg-black border-2 border-gray-300 rounded-[2px] cursor-pointer hover:border-black" title="Black" />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-light mb-3">Shades <span className="text-gray-400">$0</span></p>
                <div className="flex gap-2">
                  {[0.3, 0.5, 0.7, 0.9].map((opacity) => (
                    <div
                      key={opacity}
                      className="w-10 h-10 bg-gray-400 border-2 border-gray-300 rounded-[2px] cursor-pointer hover:border-black transition-colors"
                      style={{ opacity }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Summary Section */}
      {activeTab === 'summary' && (
        <div className="border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-3 gap-12">
            {/* Left - Equipment List */}
            <div className="col-span-2">
              <h2 className="text-xl font-light mb-8">Your selected equipment</h2>

              {/* Exterior Colors & Wheels */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'exterior-colors' ? null : 'exterior-colors')}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-light">Exterior Colors & Wheels <span className="text-gray-400 font-normal">2</span></h3>
                  </div>
                  <span className="text-2xl text-gray-400">{expandedSection === 'exterior-colors' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'exterior-colors' && (
                  <div className="pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-gray-300 rounded-[2px]" />
                        <div>
                          <p className="font-light">White</p>
                          <p className="text-xs text-gray-400">OQ</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-gray-500">ℹ</span>
                        <span>$0</span>
                        <button className="text-blue-600 font-light text-sm">Change</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 border border-gray-300 rounded-[2px] flex items-center justify-center text-white text-xs">⚙</div>
                        <div>
                          <p className="font-light">21" Aero Design Wheels</p>
                          <p className="text-xs text-gray-400">65K</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-gray-400 text-sm">Standard Equipment</span>
                        <button className="text-blue-600 font-light text-sm">Change</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interior Colors & Seats */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'interior-colors' ? null : 'interior-colors')}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-50"
                >
                  <h3 className="font-light">Interior Colors & Seats <span className="text-gray-400 font-normal">2</span></h3>
                  <span className="text-2xl text-gray-400">{expandedSection === 'interior-colors' ? '−' : '+'}</span>
                </button>
              </div>

              {/* Exterior */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'exterior' ? null : 'exterior')}
                  className="w-full flex items-center justify-between py-4 hover:bg-gray-50"
                >
                  <h3 className="font-light">Exterior <span className="text-gray-400 font-normal">1</span></h3>
                  <span className="text-2xl text-gray-400">{expandedSection === 'exterior' ? '−' : '+'}</span>
                </button>
              </div>
            </div>

            {/* Right - Pricing Summary */}
            <div className="border-l border-gray-200 pl-8">
              <h3 className="text-lg font-light mb-8">Total MSRP*</h3>
              <p className="text-4xl font-light mb-12">$223,750</p>

              <div className="space-y-6 text-sm">
                <div>
                  <p className="text-gray-500 font-light">Monthly Payment</p>
                  <p className="font-light text-lg">$3,773.65</p>
                  <button className="text-blue-600 text-xs font-light mt-1">Calculate Monthly Payment</button>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-gray-500 font-light mb-4">Base MSRP</p>
                  <p className="font-light">$221,400</p>
                </div>
                <div>
                  <p className="text-gray-500 font-light mb-2">Price for Equipment</p>
                  <p className="font-light">$0</p>
                </div>
                <div>
                  <p className="text-gray-500 font-light mb-2">Delivery, Processing and Handling Fee</p>
                  <p className="font-light">$2,350</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mt-12">
                <button className="w-full bg-black text-white py-3 rounded-[2px] font-light text-sm hover:bg-gray-900">
                  Request details
                </button>
                <button className="w-full border border-black py-3 rounded-[2px] font-light text-sm hover:bg-gray-50">
                  Explore Payment & Trade-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Search Section */}
      <div className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-light mb-8">Why wait when your dream already exists?</h2>

          {/* Search Controls */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="City or ZIP code"
                className="w-full px-4 py-3 border border-gray-400 rounded-[2px] font-light text-sm focus:outline-none focus:border-black"
              />
            </div>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(e.target.value)}
              className="px-6 py-3 border border-gray-400 rounded-[2px] font-light text-sm focus:outline-none focus:border-black"
            >
              <option>Nationwide</option>
              <option>50 miles</option>
              <option>100 miles</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={expandSearch}
                onChange={(e) => setExpandSearch(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-light text-sm">Expand search to model range</span>
            </label>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 gap-8">
            {[
              {
                name: '2026 Porsche Taycan 4',
                image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-HvPGlp3DPixDvG3erPCAGZBzmGc4OR.png',
                condition: 'New Car',
                mileage: '0 mi',
                year: '2026',
                location: 'Porsche Mechanicsburg',
                price: '$135,670.00',
              },
              {
                name: '2026 Porsche Taycan 4 Black Edition',
                image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-HvPGlp3DPixDvG3erPCAGZBzmGc4OR.png',
                condition: 'New Car',
                mileage: '0 mi',
                year: '2026',
                location: 'Porsche St. Louis',
                price: '$145,000.00',
              },
            ].map((car, idx) => (
              <div key={idx} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <img src={car.image} alt={car.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h4 className="text-lg font-light mb-2">{car.name}</h4>
                  <p className="text-sm text-gray-600 font-light mb-2">{car.condition} · {car.year} · {car.mileage}</p>
                  <p className="text-sm text-gray-600 font-light mb-4">{car.location}</p>
                  <p className="text-2xl font-light mb-4">{car.price}</p>
                  <button className="w-full text-right text-black font-light hover:opacity-75">→</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
