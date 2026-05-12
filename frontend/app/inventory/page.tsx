'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, User, Heart, Search, ChevronDown, Plus, Info } from 'lucide-react'

interface Car {
  id: number
  name: string
  year: number
  model: string
  image: string
  condition: string
  color: string
  interiorColor: string
  specs: {
    mileage: string
    engine: string
    transmission: string
    drivetrain: string
    power: string
    acceleration: string
  }
  price: number
  dealership: string
  video: boolean
  images: number
}

const cars: Car[] = [
  {
    id: 1,
    name: '718 Cayman',
    year: 2025,
    model: '718 Cayman (982)',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=500&h=400&fit=crop',
    condition: 'New',
    color: 'Shark Blue',
    interiorColor: 'Gray',
    specs: {
      mileage: '0 mi',
      engine: 'Gasoline',
      transmission: 'Manual',
      drivetrain: 'Rear-wheel-drive',
      power: '300 hp / 221 kW',
      acceleration: '4.9 sec'
    },
    price: 95735,
    dealership: 'Porsche Mechanicsburg',
    video: true,
    images: 15
  },
  {
    id: 2,
    name: '718 Cayman',
    year: 2025,
    model: '718 Cayman (982)',
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=500&h=400&fit=crop',
    condition: 'Certified Pre-Owned',
    color: 'Carmine Red',
    interiorColor: 'Black',
    specs: {
      mileage: '8,222 mi',
      engine: 'Gasoline',
      transmission: 'PDK (Automatic)',
      drivetrain: 'Rear-wheel-drive',
      power: '300 hp / 221 kW',
      acceleration: '3.5 sec'
    },
    price: 84991,
    dealership: 'Porsche Marin',
    video: true,
    images: 18
  },
  {
    id: 3,
    name: '718 Cayman',
    year: 2024,
    model: '718 Cayman Style Edition (MY24) (982)',
    image: 'https://images.unsplash.com/photo-1578375050575-6d5129474d6e?w=500&h=400&fit=crop',
    condition: 'Certified Pre-Owned',
    color: 'Racing Yellow',
    interiorColor: 'Black',
    specs: {
      mileage: '1,240 mi',
      engine: 'Gasoline',
      transmission: 'PDK (Automatic)',
      drivetrain: 'Rear-wheel-drive',
      power: '300 hp / 220 kW',
      acceleration: '3.6 sec'
    },
    price: 85945,
    dealership: 'Porsche Marin',
    video: true,
    images: 22
  }
]

export default function InventoryPage() {
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['Condition'])
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['New'])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState('Nationwide (0)')

  const toggleFilter = (filter: string) => {
    setExpandedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    )
  }

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const colors = [
    { name: 'Black', count: 10, circle: '#000000' },
    { name: 'White', count: 4, circle: '#FFFFFF' },
    { name: 'Silver', count: 5, circle: '#C0C0C0' },
    { name: 'Chalk', count: 3, circle: '#E8E8E8' },
    { name: 'Grey', count: 9, circle: '#808080' },
    { name: 'Blue', count: 12, circle: '#0000FF' },
    { name: 'Red', count: 4, circle: '#FF0000' },
    { name: 'Brown', count: 0, circle: '#8B4513' },
    { name: 'Yellow', count: 3, circle: '#FFFF00' },
    { name: 'Green', count: 4, circle: '#008000' },
    { name: 'Violet', count: 0, circle: '#EE82EE' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
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

      {/* Main content */}
      <div className="flex">
        {/* Left sidebar - Filters */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 p-6 max-h-screen overflow-y-auto">
          <h2 className="text-2xl font-bold mb-8">Porsche 718 Cayman</h2>
          <p className="text-sm text-gray-600 mb-8">New and pre-owned cars for sale.</p>

          {/* Location Filter */}
          <div className="mb-8">
            <h3 className="font-semibold text-black mb-4">Location</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search Zipcode or City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Radius</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full p-3 border border-gray-400 text-sm focus:outline-none bg-white"
              >
                <option>Nationwide (0)</option>
                <option>25 miles</option>
                <option>50 miles</option>
              </select>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-8 border-t border-gray-300 pt-8">
            <button
              onClick={() => toggleFilter('Condition')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className="font-semibold text-black">Condition</h3>
              <ChevronDown size={16} className={expandedFilters.includes('Condition') ? 'rotate-180' : ''} />
            </button>
            {expandedFilters.includes('Condition') && (
              <div className="space-y-3">
                {['New', 'Pre-Owned', 'Certified Pre-Owned', 'Classic'].map(condition => (
                  <label key={condition} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(condition)}
                      onChange={() => toggleCondition(condition)}
                      className="w-4 h-4 border border-gray-400"
                    />
                    <span className="text-sm text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Model Lines Filter */}
          <div className="mb-8 border-t border-gray-300 pt-8">
            <button
              onClick={() => toggleFilter('ModelLines')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className="font-semibold text-black">Model Lines</h3>
              <ChevronDown size={16} />
            </button>
            {expandedFilters.includes('ModelLines') && (
              <select className="w-full p-3 border border-gray-400 text-sm bg-white">
                <option>718/Boxster/Cayman (25+)</option>
              </select>
            )}
          </div>

          {/* Exterior Color */}
          <div className="mb-8 border-t border-gray-300 pt-8">
            <button
              onClick={() => toggleFilter('Color')}
              className="w-full flex items-center justify-between mb-4"
            >
              <h3 className="font-semibold text-black">Exterior Color</h3>
              <span className="text-xs">−</span>
            </button>
            {expandedFilters.includes('Color') && (
              <div className="space-y-2">
                {colors.map(color => (
                  <label key={color.name} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="w-4 h-4 border border-gray-400"
                    />
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color.circle }}
                    />
                    <span className="text-sm text-gray-700">
                      {color.name} ({color.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right content - Listings */}
        <div className="flex-1 p-8">
          {/* Search bar and sort */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {['718/Boxster/Cayman', '718 Cayman', '982'].map((filter, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded text-sm">
                  {filter}
                  <button className="text-gray-500 hover:text-black">×</button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded">
              <Search size={16} />
              <span className="text-sm text-gray-600">E-Mail me new results</span>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded text-sm bg-white">
              <option>Sort By: Recommended</option>
            </select>
          </div>

          {/* Car listings */}
          <div className="grid grid-cols-1 gap-8">
            {cars.map((car) => (
              <div key={car.id} className="flex gap-6 bg-white border border-gray-200 p-4 rounded-lg hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative w-96 h-80 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                  {car.video && (
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-xs font-semibold">
                      Sound
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded text-xs font-semibold">
                    {car.images} Images
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{car.year} {car.model}</h3>
                    <p className="text-sm text-gray-600 mb-4">{car.condition}</p>

                    <div className="flex gap-2 mb-6">
                      <span className="text-sm font-semibold">{car.color}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-sm text-gray-600">{car.interiorColor}</span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">{car.specs.engine}</span>
                        <span className="text-gray-400"> · </span>
                        <span>{car.specs.mileage}</span>
                        <span className="text-gray-400"> · </span>
                        <span>{car.specs.power}</span>
                        <span className="text-gray-400"> · </span>
                        <span>{car.specs.drivetrain}</span>
                        <span className="text-gray-400"> · </span>
                        <span>{car.specs.transmission}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <p className="text-3xl font-bold mb-1">${car.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Excl. taxes, incl. fees</p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Individualize payment:</span> <a href="#" className="underline">Retail Finance</a>
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Link
                        href={`/inventory/${car.id}`}
                        className="flex-1 px-6 py-3 bg-black text-white text-center font-semibold text-sm rounded hover:bg-gray-900 transition-colors"
                      >
                        Show details
                      </Link>
                      <button className="px-6 py-3 border border-black text-black font-semibold text-sm rounded hover:bg-gray-50 transition-colors">
                        Save
                      </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-4">{car.dealership}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
