'use client'

import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Settings2,
  Camera,
  RefreshCw,
} from 'lucide-react'
import { GalleryImage } from '@/utils/configurator-data'

type ConfiguratorViewerProps = {
  images: GalleryImage[]
  activeIndex: number
  onSelectImage: (index: number) => void
  modelName: string
  year: number
  onOpen360?: () => void
}

export function ConfiguratorViewer({
  images,
  activeIndex,
  onSelectImage,
  modelName,
  year,
  onOpen360,
}: ConfiguratorViewerProps) {
  const activeImage = images[activeIndex] ?? images[0]
  const canScrollLeft = activeIndex > 0
  const canScrollRight = activeIndex < images.length - 1

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between mb-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-near-black">{modelName}</h1>
          <p className="text-sm text-dark-gray font-light mt-0.5">{year}</p>
        </div>
        <button
          type="button"
          className="text-sm font-light underline underline-offset-2 hover:opacity-70 text-near-black"
        >
          Technical data and standard equipment
        </button>
      </div>

      <div className="relative flex-1 min-h-[280px] md:min-h-[420px] bg-gray-100 rounded-xl overflow-hidden group mt-[-1px]">
        <Image
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          unoptimized
          priority
          className="object-cover transition-opacity duration-300"
        />

        <button
          type="button"
          aria-label="Open fullscreen"
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Maximize2 size={16} strokeWidth={1.5} />
        </button>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            type="button"
            aria-label="Visualisation settings"
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Settings2 size={16} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Download screenshot"
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Camera size={16} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Start comparison"
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpen360}
          className="absolute bottom-4 right-4 px-5 py-2.5 bg-white/90 backdrop-blur rounded-full text-sm font-light shadow-sm hover:bg-white transition-colors"
        >
          Open 360° View
        </button>
      </div>

      <div className="relative mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => onSelectImage(index)}
              className={`relative flex-shrink-0 w-[72px] h-[52px] md:w-[88px] md:h-[64px] rounded-lg overflow-hidden border-2 transition-all ${
                index === activeIndex
                  ? 'border-black shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.src} alt={img.alt} fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            aria-label="Previous"
            onClick={() => onSelectImage(activeIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Next"
            onClick={() => onSelectImage(activeIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
