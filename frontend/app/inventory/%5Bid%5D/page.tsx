'use client'

import { useState } from 'react'
import { Menu, User, Heart, ChevronDown, ChevronUp, Copy, Info } from 'lucide-react'
import Link from 'next/link'

interface CarDetail {
  id: number
  year: number
  model: string
  condition: string
  exteriorColor: string
  interiorColor: string
  specs: {
    mileage: string
    previousOwners: number
    warranty: string
    engine: string
    transmission: string
    drivetrain: string
    power: string
    acceleration: string
  }
  price: number
  dealership: string
  address: string
  website: string
  stockNumber: string
  vin: string
  images: string[]
  includeOptions: string[]
}

const carData: CarDetail = {
  id: 1,
  year: 2025,
  model: '718 Cayman Style Edition (982)',
  condition: 'Certified Pre-Owned',
  exteriorColor: 'Vanadium Grey Metallic',
  interiorColor: 'Standard Interior in Black with Leather Package',
  specs: {
    mileage: '140 mi',
    previousOwners: 0,
    warranty: '24 months',
    engine: 'Gasoline',
    transmission: 'Manual',
    drivetrain: 'Rear-wheel-drive',
    power: '300 hp / 221 kW',
    acceleration: '4.9 sec'
  },
  price: 88000,
  dealership: 'Porsche Downtown Chicago',
  address: '570 W. Monroe Street, Chicago, IL, 60661',
  website: 'Go to website',
  stockNumber: 'SK255334',
  vin: 'WP0AA2A87SK255334',
  images: [
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578375050575-6d5129474d6e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1579399112114-a88a93fef664?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1594933707802-59b8b8b4b5a1?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=300&h=300&fit=crop'
  ],
  includeOptions: [
    '"718" Logo on Rear in High Gloss Black',
    'Headlight Cleaning System Covers in Deviated Exterior Color – Black',
    'Window Trim and Window Triangle in High Gloss Black',
    'Exterior Decals in Black',
    'Rear Side Air Intake Grilles Painted – Black',
    'Rear Wing in High Gloss Black',
    'Door Handles in High Gloss Black',
    '"PORSCHE" Logo on Rear in Satin Black',
    'Power Sport Seats (14-way) with Memory Package',
    'GT Sport Steering Wheel in Leather',
    'Ventilated Seats',
    'Navigation including Porsche Connect',
    'Smartphone Compartment',
    'BOSE® Surround Sound System',
    'Power Folding Exterior Mirrors incl. Courtesy Lighting',
    'Preparation for Porsche Dashcam (Front)'
  ]
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['options'])
  const car = carData

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-black">
            <Menu size={20} />
            <span className="text-sm">Menu</span>
          </button>
          <div className="flex-1 flex justify-center">
            <span className="font-light tracking-wider">PORSCHE</span>
          </div>
          <div className="flex items-center gap-4">
            <Heart size={20} />
            <div className="relative">
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</div>
              <Heart size={20} />
            </div>
            <User size={20} />
          </div>
        </div>
      </header>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link href="/inventory" className="flex items-center gap-2 text-black hover:text-gray-600">
          <span>← To search results</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Left - Gallery */}
          <div className="col-span-2">
            <div className="mb-8">
              {/* Main image */}
              <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={car.images[0]}
                  alt={car.model}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badges */}
              <div className="flex gap-3 mb-4">
                <div className="bg-black text-white px-3 py-1 rounded text-xs font-semibold">Sound</div>
                <div className="bg-black text-white px-3 py-1 rounded text-xs font-semibold">34 Images</div>
              </div>

              {/* Thumbnail grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {car.images.map((img, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Open Gallery button */}
              <button className="w-full px-6 py-3 bg-black text-white font-semibold text-sm rounded hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
                <span>📷</span>
                <span>Open Gallery</span>
              </button>
            </div>

            {/* Car details */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-2">{car.year} Porsche {car.model}</h1>
              <p className="text-gray-600 mb-6">{car.condition}</p>

              {/* Color swatches */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-gray-600 rounded border border-gray-400" />
                    <span className="font-semibold text-sm">Exterior color</span>
                  </div>
                  <p className="text-gray-700">{car.exteriorColor}</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-black rounded border border-gray-400" />
                    <span className="font-semibold text-sm">Interior color</span>
                  </div>
                  <p className="text-gray-700">{car.interiorColor}</p>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-8 border-t border-b border-gray-200 py-8">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Mileage</p>
                  <p className="text-2xl font-bold">{car.specs.mileage}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Previous Owners</p>
                  <p className="text-2xl font-bold">{car.specs.previousOwners}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Porsche Approved Warranty</p>
                  <p className="text-2xl font-bold">{car.specs.warranty}</p>
                </div>
              </div>

              {/* Additional specs */}
              <div className="grid grid-cols-3 gap-8 border-b border-gray-200 py-8">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Engine</p>
                  <p className="font-semibold">{car.specs.engine}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Transmission</p>
                  <p className="font-semibold">{car.specs.transmission}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Drivetrain</p>
                  <p className="font-semibold">{car.specs.drivetrain}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 border-b border-gray-200 py-8">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Maximum power combustion engine</p>
                  <p className="font-semibold">{car.specs.power}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Acceleration 0-60 mph</p>
                  <p className="font-semibold">{car.specs.acceleration}</p>
                </div>
                <div />
              </div>
            </div>

            {/* Important Resources */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Important Resources</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-200 rounded-lg text-left font-semibold text-sm hover:bg-blue-300 transition-colors">
                  Vehicle Information
                </button>
                <button className="p-4 bg-blue-200 rounded-lg text-left font-semibold text-sm hover:bg-blue-300 transition-colors">
                  Vehicle History
                </button>
              </div>
            </div>

            {/* Included Options */}
            <div>
              <button
                onClick={() => toggleSection('options')}
                className="w-full flex items-center justify-between p-6 bg-gray-100 rounded-lg mb-4 hover:bg-gray-200 transition-colors"
              >
                <h2 className="text-xl font-bold">Included Options</h2>
                <ChevronDown size={20} className={expandedSections.includes('options') ? 'rotate-180' : ''} />
              </button>

              {expandedSections.includes('options') && (
                <div className="space-y-4">
                  {car.includeOptions.map((option, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 border-b border-gray-200">
                      <span className="text-gray-600 flex-shrink-0 mt-1">
                        <Info size={18} />
                      </span>
                      <p className="text-gray-800">{option}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right - Sidebar */}
          <div>
            <div className="bg-white border border-gray-300 rounded-lg p-6 sticky top-6">
              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold mb-1">${car.price.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Excl. taxes, incl. fees</p>
              </div>

              {/* CTA Buttons */}
              <button className="w-full px-6 py-3 bg-black text-white font-semibold text-sm rounded mb-3 hover:bg-gray-900 transition-colors">
                Contact Dealership
              </button>

              <button className="w-full px-6 py-3 border border-black text-black font-semibold text-sm rounded mb-3 hover:bg-gray-50 transition-colors">
                Explore Payment and Trade-In
              </button>

              <button className="w-full px-6 py-3 border border-black text-black font-semibold text-sm rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <Heart size={18} />
                <span>Save</span>
              </button>

              {/* Dealership Info */}
              <div className="mt-8 pt-8 border-t border-gray-300">
                <p className="font-bold text-black mb-3">{car.dealership}</p>
                <p className="text-sm text-gray-700 mb-4">{car.address}</p>
                <a href="#" className="text-sm text-blue-600 underline">{car.website}</a>

                {/* Stock and VIN */}
                <div className="mt-6 space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Stock Number:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-black">{car.stockNumber}</p>
                      <button className="text-gray-400 hover:text-black">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">VIN:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-black">{car.vin}</p>
                      <button className="text-gray-400 hover:text-black">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
