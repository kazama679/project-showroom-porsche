'use client'

import Image from 'next/image'
import { InventoryItem, formatPrice } from '@/lib/configurator-data'

type ConfiguratorInventorySearchProps = {
  items: InventoryItem[]
}

export function ConfiguratorInventorySearch({ items }: ConfiguratorInventorySearchProps) {
  return (
    <section className="bg-[#f5f5f5] py-16 border-t border-[#e5e5e5]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-light text-[#181818] mb-8">
          Why wait when your dream already exists?
        </h2>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="City or ZIP code"
            className="flex-1 px-4 py-3 border border-[#999] rounded-lg text-sm font-light focus:outline-none focus:border-black bg-white"
          />
          <select
            aria-label="Search radius"
            className="px-6 py-3 border border-[#999] rounded-lg text-sm font-light focus:outline-none focus:border-black bg-white"
            defaultValue="nationwide"
          >
            <option value="nationwide">Nationwide</option>
            <option value="50">50 miles</option>
            <option value="100">100 miles</option>
            <option value="250">250 miles</option>
          </select>
          <label className="flex items-center gap-2 px-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-black" />
            <span className="text-sm font-light text-[#181818]">
              Expand search to model range
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((car) => (
            <article
              key={car.id}
              className="bg-white rounded-xl overflow-hidden border border-[#e5e5e5] hover:shadow-lg transition-shadow group cursor-pointer"
            >
              <div className="relative h-48 bg-[#f0f0f0]">
                <Image src={car.image} alt={car.name} fill unoptimized className="object-cover" />
              </div>
              <div className="p-6">
                <h4 className="text-lg font-light text-[#181818] mb-1">{car.name}</h4>
                <p className="text-sm text-[#666] font-light mb-1">
                  {car.condition} · {car.year} · {car.mileage}
                </p>
                <p className="text-sm text-[#666] font-light mb-4">{car.location}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-light text-[#181818]">{formatPrice(car.price)}</p>
                  <span className="text-[#181818] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
