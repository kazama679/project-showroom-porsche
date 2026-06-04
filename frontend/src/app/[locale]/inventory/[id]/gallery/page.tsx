'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation';
import Image from 'next/image'
import { ChevronUp } from 'lucide-react'
  
interface GalleryImage {
  id: string
  src: string
  alt: string
}

interface GalleryCategory {
  name: string
  count: number
  images: GalleryImage[]
  thumbnail: string
}

const galleryData: GalleryCategory[] = [
  {
    name: 'Exterior',
    count: 10,
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=200&h=150&fit=crop',
    images: Array(10).fill(0).map((_, i) => ({
      id: `ext-${i}`,
      src: `https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=1200&h=800&fit=crop`,
      alt: `Exterior view ${i + 1}`
    }))
  },
  {
    name: 'Interior',
    count: 13,
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad5c?w=200&h=150&fit=crop',
    images: Array(13).fill(0).map((_, i) => ({
      id: `int-${i}`,
      src: `https://images.unsplash.com/photo-1549399542-7e3f8b83ad5c?w=1200&h=800&fit=crop`,
      alt: `Interior view ${i + 1}`
    }))
  },
  {
    name: 'Highlights',
    count: 8,
    thumbnail: 'https://images.unsplash.com/photo-1493238792000-8311db92a54a?w=200&h=150&fit=crop',
    images: Array(8).fill(0).map((_, i) => ({
      id: `high-${i}`,
      src: `https://images.unsplash.com/photo-1493238792000-8311db92a54a?w=1200&h=800&fit=crop`,
      alt: `Highlight ${i + 1}`
    }))
  },
  {
    name: 'Sound',
    count: 2,
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=200&h=150&fit=crop',
    images: Array(2).fill(0).map((_, i) => ({
      id: `sound-${i}`,
      src: `https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1200&h=800&fit=crop`,
      alt: `Sound ${i + 1}`
    }))
  }
]

export default function CarGallery({ params }: { params: { id: string } }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const category = galleryData[activeCategory]
  const currentImage = category.images[activeImageIndex]
  const nextImages = category.images.slice(activeImageIndex + 1, activeImageIndex + 3)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-page mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">PORSCHE</Link>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded">★</button>
            <button className="relative p-2 hover:bg-gray-100 rounded">
              🔔
              <span className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">👤</button>
          </div>
        </div>
      </header>

      <div className="max-w-page mx-auto px-6 py-8">
        {/* Back Link */}
        <Link href={`/inventory/${params.id}`} className="flex items-center gap-2 text-gray-700 hover:text-black mb-8 text-sm">
          ← Back to Vehicle Details
        </Link>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          {galleryData.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(idx)
                setActiveImageIndex(0)
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all flex-shrink-0 ${
                activeCategory === idx
                  ? 'bg-gray-100 border-2 border-black'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={cat.thumbnail}
                alt={cat.name}
                width={96}
                height={96}
                unoptimized
                className="object-cover rounded"
              />
              <div className="text-center">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-gray-600">{cat.count}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-4xl font-light tracking-tight mb-2">{category.name}</h2>
          <p className="text-gray-600">{category.count} Images</p>
        </div>

        {/* Main Gallery View */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {/* Main Image */}
          <div className="col-span-2">
            <div className="bg-gray-100 aspect-photo rounded-lg overflow-hidden">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="flex flex-col gap-4">
            {nextImages.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(activeImageIndex + idx + 1)}
                className="bg-gray-100 aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-black transition-all"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
            {nextImages.length < 2 && (
              <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center text-gray-400">
                No more images
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gray-400 hover:bg-gray-500 text-white p-3 rounded transition-colors"
        >
          <ChevronUp size={24} />
        </button>
      </div>
    </div>
  )
}
