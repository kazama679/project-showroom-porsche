'use client'

import { useState } from 'react'
import { Menu, Globe, User, ChevronRight } from 'lucide-react'

const variants = [
  'Coupé',
  'Cabriolet',
  'Targa',
  'GT',
  'Turbo Coupé',
  'Turbo Cabriolet',
  'GT Cabriolet'
]

export default function ModelDetailPage() {
  const [selectedVariant, setSelectedVariant] = useState('Coupé')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 py-6">
          <button className="text-black flex items-center gap-2 md:hidden hover:opacity-75 transition-opacity">
            <Menu size={20} />
            <span className="text-xs font-medium">Menu</span>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-black text-base font-medium tracking-[0.15em]">PORSCHE</h1>
          </div>
          
          <div className="flex items-center gap-8">
            <button className="text-black hidden md:block hover:opacity-75 transition-opacity">
              <Globe size={18} />
            </button>
            <button className="text-black hover:opacity-75 transition-opacity">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Button */}
      <button className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-8 font-medium text-sm tracking-wider z-40 hover:bg-blue-700 transition-colors writing-vertical-rl">
        Feedback
      </button>

      {/* Section 1: Model Overview */}
      <section className="bg-gray-50 py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Car Image */}
          <div className="flex justify-center mb-12">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%201-f6ZGZXvdMr8bDd5dyqOV3cImvzjVV7.png"
              alt="911 Carrera 4S"
              className="h-96 object-contain"
            />
          </div>

          {/* Variant Tabs */}
          <div className="flex justify-center gap-8 mb-12 border-b border-gray-300 pb-4">
            {variants.map((variant) => (
              <button
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                className={`text-sm font-light tracking-wide transition-colors duration-300 pb-2 ${
                  selectedVariant === variant
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {variant}
              </button>
            ))}
          </div>

          {/* Model Title */}
          <h2 className="text-5xl md:text-6xl font-light text-center mb-6 text-black">
            911 Carrera 4S
          </h2>

          {/* Fuel Badge */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-[2px]">
              Gasoline
            </span>
          </div>

          {/* Price */}
          <p className="text-center text-lg font-light text-black">
            From $ 164,500<sup>¹</sup>
          </p>
        </div>
      </section>

      {/* Section 2: Car Detail with CTAs */}
      <section className="bg-white py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Car Image */}
          <div className="flex justify-center mb-12">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%202-84s4M59JntU7zJvCPLZHBMefMvRnhu.png"
              alt="911 Carrera 4S Detail"
              className="h-80 object-contain"
            />
          </div>

          {/* Variant Tabs */}
          <div className="flex justify-center gap-8 mb-12 border-b border-gray-300 pb-4">
            {variants.map((variant) => (
              <button
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                className={`text-sm font-light tracking-wide transition-colors duration-300 pb-2 ${
                  selectedVariant === variant
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {variant}
              </button>
            ))}
          </div>

          {/* Model Info */}
          <div className="text-center mb-12">
            <h3 className="text-5xl md:text-6xl font-light text-black mb-4">
              911 Carrera 4S
            </h3>
            <div className="mb-4">
              <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-[2px]">
                Gasoline
              </span>
            </div>
            <p className="text-lg font-light text-black">
              From $ 164,500<sup>¹</sup>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-black text-white font-medium text-sm rounded-[2px] hover:bg-gray-900 transition-colors duration-300">
              Change model variant
            </button>
            <button className="px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors duration-300">
              Build Your Porsche
            </button>
            <button className="px-8 py-3 bg-white text-black border border-black font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors duration-300">
              New and Used Inventory
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-600 font-light mt-8 max-w-3xl mx-auto">
            ¹ Manufacturer&apos;s Suggested Retail Price. Excludes options; taxes; title; registration; delivery, processing and handling fee; dealer charges; potential tariffs. Dealer sets actual selling price.
          </p>
        </div>
      </section>

      {/* Section 3: Specifications */}
      <section className="bg-gray-50 py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Specs */}
            <div className="space-y-12">
              <div>
                <p className="text-6xl md:text-7xl font-light text-black">3.3<span className="text-3xl">s</span></p>
                <p className="text-sm font-light text-gray-600 mt-2">0 - 60 mph</p>
              </div>
              <div>
                <p className="text-6xl md:text-7xl font-light text-black">473<span className="text-3xl">hp</span></p>
                <p className="text-sm font-light text-gray-600 mt-2">Max. engine power</p>
              </div>
              <div>
                <p className="text-6xl md:text-7xl font-light text-black">191<span className="text-3xl">mph</span></p>
                <p className="text-sm font-light text-gray-600 mt-2">Top track speed (with summer tires)</p>
              </div>
              <button className="px-6 py-3 bg-white border border-black text-black font-medium text-sm rounded-[2px] hover:bg-gray-50 transition-colors duration-300">
                Technical Specs
              </button>
            </div>

            {/* Right: Car Image */}
            <div className="flex justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%203-FKTWtNO1C4aijNCErVSZL6Aj4hCywR.png"
                alt="911 Front View"
                className="h-96 object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Editorial Content */}
      <section className="bg-white py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* 911 Logo */}
          <div className="flex justify-center mb-16">
            <div className="text-4xl font-black tracking-tight">911</div>
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {/* Main large image */}
            <div className="col-span-2 md:col-span-2 md:row-span-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-o5L6AORJEs0cmXV6PVITfC5WEDbCXC.png"
                alt="Rear view driving"
                className="w-full h-full object-cover rounded-[4px]"
              />
            </div>

            {/* Top right small */}
            <div className="col-span-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-o5L6AORJEs0cmXV6PVITfC5WEDbCXC.png"
                alt="Coastal road"
                className="w-full h-40 object-cover rounded-[4px]"
              />
            </div>

            {/* Bottom right small */}
            <div className="col-span-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%BA%A2nh%204-o5L6AORJEs0cmXV6PVITfC5WEDbCXC.png"
                alt="Interior steering wheel"
                className="w-full h-40 object-cover rounded-[4px]"
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-4xl md:text-5xl font-light text-black mb-8">
              Thrill of the 911.
            </h3>
            <p className="text-base font-light text-gray-700 leading-relaxed mb-8">
              Anyone who dreams of a Porsche usually has a certain image in their mind. For over 60 years, the 911 has been the epitome of an incredibly powerful sports car with day-to-day usability. Take a seat behind the wheel of the 911 and discover the unique blend of performance and engineering that makes it stand out.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
