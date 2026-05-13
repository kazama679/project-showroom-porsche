'use client'

import { useState } from 'react'
import { Copy, ArrowLeftRight, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function SavedVehiclesPage() {
  const [activeTab, setActiveTab] = useState('configurations')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-light mb-8">
            Your saved vehicles.
          </h1>
          <button className="px-6 py-3 border-2 border-black rounded-[2px] font-medium text-sm tracking-[1.28px] hover:bg-black hover:text-white transition-all duration-300">
            <ArrowLeftRight size={18} className="inline mr-2" />
            Compare vehicles
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-16 border-b border-gray-300 pb-4">
          <button
            onClick={() => setActiveTab('configurations')}
            className={`pb-2 font-medium text-sm tracking-wide transition-all duration-300 ${
              activeTab === 'configurations'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Configurations (1)
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-2 font-medium text-sm tracking-wide transition-all duration-300 ${
              activeTab === 'listings'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Listings (0)
          </button>
        </div>

        {/* Configurations Tab */}
        {activeTab === 'configurations' && (
          <div className="space-y-12">
            {/* Saved Configurations Heading */}
            <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
              Saved configurations
            </h2>

            {/* Configuration Card */}
            <div className="bg-white rounded-[4px] overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                {/* Left: Car Images */}
                <div className="md:col-span-2">
                  {/* Main Image */}
                  <div className="mb-3 rounded-[2px] overflow-hidden bg-gray-200 h-64">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                      alt="Porsche Taycan Turbo S"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-[2px] overflow-hidden bg-gray-200 h-24">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                        alt="Thumbnail 1"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="rounded-[2px] overflow-hidden bg-gray-200 h-24">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                        alt="Thumbnail 2"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="rounded-[2px] overflow-hidden bg-gray-200 h-24">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-unrSSOkEFYoYPeYupVKuVrb5OozLpY.png"
                        alt="Thumbnail 3"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  {/* Info Section */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-light mb-2">
                        Porsche Taycan Turbo S
                      </h3>
                      <p className="text-sm text-gray-600">
                        Porsche Code PT6DA3K7{' '}
                        <button className="ml-2 hover:opacity-75">
                          <Copy size={16} className="inline" />
                        </button>
                        · Configuration created on 4/23/2026
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-700">
                        <span className="font-medium">White</span>
                        <span>·</span>
                        <span>
                          Leather Interior in Black with Turbonite Accents
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <span className="font-medium">Electric</span>
                        <span>·</span>
                        <span>938 hp / 690 kW</span>
                        <span>·</span>
                        <span>All-wheel-drive</span>
                        <span>·</span>
                        <span>Automatic</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button className="px-6 py-3 bg-black text-white font-medium text-sm rounded-[2px] hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2">
                      Show Details
                    </button>
                    <button className="px-6 py-3 border-2 border-black text-black font-medium text-sm rounded-[2px] hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-2">
                      <ArrowLeftRight size={16} />
                      Compare
                    </button>
                    <button className="px-6 py-3 border-2 border-black text-black font-medium text-sm rounded-[2px] hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-2">
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-[4px] p-12 text-center space-y-6">
              <h3 className="text-2xl font-light">
                Do you want to configure another Porsche and add it to this list?
              </h3>
              <button className="px-6 py-3 border-2 border-black text-black font-medium text-sm rounded-[2px] hover:bg-black hover:text-white transition-all duration-300">
                Create new configuration
              </button>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-12">
            {/* Saved Listings Heading */}
            <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
              Saved listings
            </h2>

            {/* Empty State */}
            <div className="bg-white rounded-[4px] p-16 text-center space-y-8">
              <div className="space-y-3">
                <h3 className="text-2xl font-light">
                  You have no saved listings yet.
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  It appears like you have not saved any Porsche yet. You can
                  select save to add your favorite Porsche to this list.
                </p>
              </div>
              <button className="px-6 py-3 border-2 border-black text-black font-medium text-sm rounded-[2px] hover:bg-black hover:text-white transition-all duration-300">
                Browse and save listings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
