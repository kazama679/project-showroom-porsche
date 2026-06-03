'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Rotate3D,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GalleryImage } from '@/utils/configurator-data'
import type { ConfigOption } from '@/utils/configurator-data'
import { CarModel3DViewer } from '@/components/features/configurator/car-model-3d-viewer'
import { Porsche3DStream } from '@/components/features/configurator/porsche-3d-stream'

type ConfiguratorViewerProps = {
  images: GalleryImage[]
  activeIndex: number
  onSelectImage: (index: number) => void
  modelName: string
  year: number
  onOpen360?: () => void
  porscheModelCode?: string | null
  local3dModelUrl?: string | null
  selectedPaintOption?: ConfigOption
  selectedWheelOption?: ConfigOption
}

export function ConfiguratorViewer({
  images,
  activeIndex,
  onSelectImage,
  modelName,
  year,
  onOpen360,
  porscheModelCode,
  local3dModelUrl,
  selectedPaintOption,
  selectedWheelOption,
}: ConfiguratorViewerProps) {
  const t = useTranslations('configurator')
  const [show3DModel, setShow3DModel] = useState(() => Boolean(local3dModelUrl))
  const activeImage = images[activeIndex] ?? images[0]
  const canScrollLeft = activeIndex > 0
  const canScrollRight = activeIndex < images.length - 1
  const is3DEnabled = Boolean(local3dModelUrl || porscheModelCode)
  const isShowing3D = is3DEnabled && show3DModel

  useEffect(() => {
    if (local3dModelUrl) setShow3DModel(true)
  }, [local3dModelUrl])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between px-1 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            {t('porscheConfigurator')}
          </p>
          <h1 className="mt-1 text-3xl font-light text-near-black md:text-4xl">{modelName}</h1>
          <p className="mt-1 text-sm font-light text-dark-gray">{year}</p>
        </div>
      </div>

      <div className="group relative flex-1 overflow-hidden rounded-lg border border-neutral-100 bg-gradient-to-b from-gray-50 to-white min-h-[360px] md:min-h-[560px]">
        {isShowing3D ? (
          local3dModelUrl ? (
            <CarModel3DViewer
              modelUrl={local3dModelUrl}
              paintColorHex={selectedPaintOption?.colorHex || selectedPaintOption?.color}
              paintMaterialTarget={selectedPaintOption?.materialTarget}
              wheelMeshName={selectedWheelOption?.meshName}
              wheelVariantKey={selectedWheelOption?.meshName || selectedWheelOption?.name}
              className="absolute inset-0"
            />
          ) : (
            <Porsche3DStream modelCode={porscheModelCode as string} className="absolute inset-0" />
          )
        ) : (
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            fill
            unoptimized
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-contain p-6 transition-opacity duration-300 md:p-10"
          />
        )}

        <button
          type="button"
          aria-label={t('openFullscreen')}
          onClick={onOpen360}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <Maximize2 size={16} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          disabled={!is3DEnabled}
          onClick={() => setShow3DModel((current) => !current)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-light shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Rotate3D size={16} strokeWidth={1.5} />
          {isShowing3D ? t('close3dModel') : t('open3dModel')}
        </button>
      </div>

      <div className="relative mt-4">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={t('showImage', { current: index + 1, total: images.length })}
              onClick={() => onSelectImage(index)}
              className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border bg-gray-50 transition-all md:h-16 md:w-24 ${
                index === activeIndex
                  ? 'border-black opacity-100'
                  : 'border-transparent opacity-65 hover:opacity-100'
              }`}
            >
              <Image src={img.src} alt={img.alt} fill unoptimized className="object-contain p-1" />
            </button>
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            aria-label={t('previous')}
            onClick={() => onSelectImage(activeIndex - 1)}
            className="absolute left-0 top-1/2 flex h-8 w-8 -translate-x-1 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label={t('next')}
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
