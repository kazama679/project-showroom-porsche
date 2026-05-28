'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Moon,
  RefreshCw,
  Rotate3D,
  Settings2,
  Sun,
} from 'lucide-react'
import { GalleryImage } from '@/utils/configurator-data'
import { Porsche3DStream } from '@/components/features/configurator/porsche-3d-stream'

type ConfiguratorViewerProps = {
  images: GalleryImage[]
  activeIndex: number
  onSelectImage: (index: number) => void
  modelName: string
  year: number
  onOpen360?: () => void
  porscheModelCode?: string | null
}

export function ConfiguratorViewer({
  images,
  activeIndex,
  onSelectImage,
  modelName,
  year,
  onOpen360,
  porscheModelCode,
}: ConfiguratorViewerProps) {
  const [show3DModel, setShow3DModel] = useState(false)
  const activeImage = images[activeIndex] ?? images[0]
  const canScrollLeft = activeIndex > 0
  const canScrollRight = activeIndex < images.length - 1
  const is3DEnabled = Boolean(porscheModelCode)
  const isShowing3D = is3DEnabled && show3DModel

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between px-1 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Porsche configurator
          </p>
          <h1 className="mt-1 text-3xl font-light text-near-black md:text-4xl">{modelName}</h1>
          <p className="mt-1 text-sm font-light text-dark-gray">{year}</p>
        </div>
        <button
          type="button"
          className="hidden text-sm font-light text-near-black underline underline-offset-4 hover:opacity-70 md:inline"
        >
          Technical data and standard equipment
        </button>
      </div>

      <div className="group relative flex-1 overflow-hidden rounded-[6px] bg-[#f3f3f3] min-h-[360px] md:min-h-[560px]">
        {isShowing3D ? (
          <Porsche3DStream modelCode={porscheModelCode as string} className="absolute inset-0" />
        ) : (
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            unoptimized
            priority
            className="object-cover transition-opacity duration-300"
          />
        )}

        <div className="absolute left-4 top-4 flex rounded-full bg-white/90 p-1 shadow-sm backdrop-blur">
          {['Exterior', 'Interior', '3D'].map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={mode === '3D' && !is3DEnabled}
              onClick={() => {
                if (mode === '3D') {
                  setShow3DModel(true)
                } else {
                  setShow3DModel(false)
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-40 ${
                mode === '3D' && isShowing3D
                  ? 'bg-black text-white'
                  : 'text-near-black hover:bg-neutral-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Open fullscreen"
          onClick={onOpen360}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <Maximize2 size={16} strokeWidth={1.5} />
        </button>

        <div className="absolute right-4 top-20 flex flex-col gap-2">
          {[
            { label: 'Visualisation settings', icon: Settings2 },
            { label: 'Download screenshot', icon: Camera },
            { label: 'Start comparison', icon: RefreshCw },
            { label: 'Day mode', icon: Sun },
            { label: 'Night mode', icon: Moon },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <Icon size={16} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!is3DEnabled}
          onClick={() => setShow3DModel((current) => !current)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-light shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Rotate3D size={16} strokeWidth={1.5} />
          {isShowing3D ? 'Đóng model 3D' : 'Mở model 3D'}
        </button>
      </div>

      <div className="relative mt-4">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => onSelectImage(index)}
              className={`relative h-[56px] w-[82px] flex-shrink-0 overflow-hidden rounded-[4px] border transition-all md:h-[70px] md:w-[104px] ${
                index === activeIndex
                  ? 'border-black opacity-100'
                  : 'border-transparent opacity-65 hover:opacity-100'
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
            className="absolute left-0 top-1/2 flex h-8 w-8 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Next"
            onClick={() => onSelectImage(activeIndex + 1)}
            className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
