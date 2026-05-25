'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeftRight,
  ExternalLink,
  Trash2,
  Copy,
  X,
  Bookmark,
  Camera,
} from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { authService } from '@/lib/auth'
import {
  carBuildApi,
  SavedVehicleConfig,
} from '@/lib/car-build-api'
import { formatPrice } from '@/lib/configurator-data'

/** Delete confirmation dialog (ảnh 4) */
function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Đóng"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <h3 className="text-xl font-light text-near-black mb-2 pr-8">
          Bạn có chắc chắn muốn xóa cấu hình này không?
        </h3>
        <p className="text-sm text-amber-700 font-light mb-6">
          Xin lưu ý rằng thao tác này không thể hoàn tác.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2.5 bg-near-black text-white text-sm font-medium rounded-md hover:bg-dark-surface transition-colors"
          >
            Xóa bỏ
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm text-dark-gray font-light hover:text-near-black transition-colors flex items-center gap-1.5"
          >
            <X size={14} />
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  )
}

/** A single saved vehicle card (ảnh 1 & 2) */
function SavedVehicleCard({
  config,
  onDelete,
  onViewDetails,
  onCompare,
}: {
  config: SavedVehicleConfig
  onDelete: () => void
  onViewDetails: () => void
  onCompare: () => void
}) {
  const [activeThumb, setActiveThumb] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  const displayImages = config.galleryImages.length > 0
    ? config.galleryImages
    : [config.imageUrl]

  const mainImage = displayImages[activeThumb] || config.imageUrl

  const createdDate = new Date(config.createdAt)
  const dateStr = `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`

  const handleCopy = () => {
    navigator.clipboard.writeText(config.porscheCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(300px,420px)_1fr] gap-0">
          {/* Left: Images */}
          <div className="p-4 md:p-5">
            {/* Main image */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3">
              <Image
                src={mainImage}
                alt={config.modelName}
                fill
                unoptimized
                className="object-cover"
              />
              {/* Camera icon / image count */}
              {displayImages.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-neutral-800/80 text-white rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-xs">
                  <Camera size={13} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {displayImages.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveThumb(i)}
                    className={`relative aspect-[4/3] rounded-md overflow-hidden bg-neutral-100 transition-all ${
                      activeThumb === i
                        ? 'ring-2 ring-near-black ring-offset-1'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${config.modelName} view ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info + Actions */}
          <div className="p-5 md:p-6 md:pl-2 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-xl md:text-2xl font-light text-near-black mb-1.5">
                  {config.modelName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-dark-gray font-light">
                  <span>Mã Porsche {config.porscheCode}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="hover:text-near-black transition-colors"
                    title={copied ? 'Đã sao chép!' : 'Sao chép mã'}
                  >
                    <Copy size={14} />
                  </button>
                  <span>·</span>
                  <span>Cấu hình được tạo vào ngày {dateStr}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-1.5 text-sm text-neutral-600">
                {(config.colorName || config.interiorName) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {config.colorName && (
                      <span className="font-medium text-near-black">{config.colorName}</span>
                    )}
                    {config.colorName && config.interiorName && <span>·</span>}
                    {config.interiorName && <span>{config.interiorName}</span>}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {config.engineInfo && (
                    <>
                      <span className="font-medium text-near-black">{config.engineInfo}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatPrice(config.totalPrice)}</span>
                  {config.driveType && (
                    <>
                      <span>·</span>
                      <span>{config.driveType}</span>
                    </>
                  )}
                  {config.transmission && (
                    <>
                      <span>·</span>
                      <span>{config.transmission}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                type="button"
                onClick={onViewDetails}
                className="px-5 py-2.5 bg-near-black text-white text-sm font-medium rounded-md hover:bg-dark-surface transition-colors flex items-center gap-2"
              >
                <ExternalLink size={15} />
                Hiển thị chi tiết
              </button>
              <button
                type="button"
                onClick={onCompare}
                className="px-5 py-2.5 border border-neutral-300 text-near-black text-sm font-light rounded-md hover:border-near-black transition-colors flex items-center gap-2"
              >
                <ArrowLeftRight size={15} />
                So sánh
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className="px-5 py-2.5 border border-neutral-300 text-near-black text-sm font-light rounded-md hover:border-near-black transition-colors flex items-center gap-2"
              >
                <Trash2 size={15} />
                Xóa bỏ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <DeleteConfirmDialog
          onConfirm={() => {
            setShowDeleteDialog(false)
            onDelete()
          }}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  )
}

/** Empty state (ảnh 5) */
function EmptyState() {
  return (
    <div className="bg-white rounded-lg p-12 md:p-16 text-center">
      <h3 className="text-2xl md:text-3xl font-light text-near-black mb-3">
        Bạn chưa lưu cấu hình nào.
      </h3>
      <p className="text-sm text-dark-gray font-light max-w-lg mx-auto mb-8">
        Để tạo và lưu lại chiếc Porsche trong mơ của bạn, vui lòng sử dụng Công cụ cấu hình xe Porsche.
      </p>
      <Link
        href="/configurator"
        className="inline-flex items-center gap-2 px-6 py-3 bg-near-black text-white text-sm font-medium rounded-md hover:bg-dark-surface transition-colors"
      >
        <ExternalLink size={15} />
        Tạo cấu hình mới
      </Link>
    </div>
  )
}

/** CTA Section at the bottom (ảnh 2) */
function AddMoreCTA() {
  return (
    <div className="bg-white rounded-lg p-10 md:p-12 text-center">
      <p className="text-base text-neutral-600 font-light mb-6">
        Bạn có muốn cấu hình thêm một chiếc Porsche khác và thêm nó vào danh sách này không?
      </p>
      <Link
        href="/configurator"
        className="inline-flex items-center gap-2 px-6 py-3 border border-near-black text-near-black text-sm font-medium rounded-md hover:bg-near-black hover:text-white transition-colors"
      >
        <ExternalLink size={15} />
        Tạo cấu hình mới
      </Link>
    </div>
  )
}

export default function SavedVehiclesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'configurations' | 'listings'>('configurations')
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicleConfig[]>([])
  const [loaded, setLoaded] = useState(false)

  const loadVehicles = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const builds = await carBuildApi.getMyBuilds()
        setSavedVehicles(builds)
      } else {
        setSavedVehicles([])
        // Optionally redirect to login here
      }
    } catch (error) {
      console.error('Failed to load saved vehicles', error)
      setSavedVehicles([])
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const handleDelete = async (id: string) => {
    try {
      await carBuildApi.deleteBuild(id)
      loadVehicles() // reload to show updated list
    } catch (error) {
      console.error('Failed to delete', error)
    }
  }

  const handleViewDetails = (config: SavedVehicleConfig) => {
    const selectionsParam = encodeURIComponent(JSON.stringify(config.selections))
    router.push(`/configurator/${config.modelId}?selections=${selectionsParam}`)
  }

  const handleCompare = () => {
    router.push('/compare-models')
  }

  const configCount = savedVehicles.length
  const listingCount = 0 // placeholder

  if (!loaded) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-near-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader logoHref="/" showBookmark />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-near-black mb-6" style={{ fontStyle: 'italic' }}>
            Các phương tiện đã lưu của bạn.
          </h1>
          <button
            type="button"
            onClick={handleCompare}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-near-black text-sm font-light rounded-md hover:border-near-black transition-colors"
          >
            <ArrowLeftRight size={16} />
            So sánh các loại xe
          </button>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('configurations')}
            className={`pb-1.5 text-sm font-light transition-colors ${
              activeTab === 'configurations'
                ? 'border-b-2 border-near-black text-near-black'
                : 'text-dark-gray hover:text-near-black'
            }`}
          >
            Cấu hình ({configCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`pb-1.5 text-sm font-light transition-colors ${
              activeTab === 'listings'
                ? 'border-b-2 border-near-black text-near-black'
                : 'text-dark-gray hover:text-near-black'
            }`}
          >
            Danh sách ({listingCount})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'configurations' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-light text-center text-near-black mb-6">
              Cấu hình đã lưu
            </h2>

            {configCount === 0 ? (
              <EmptyState />
            ) : (
              <>
                {savedVehicles.map((config) => (
                  <SavedVehicleCard
                    key={config.id}
                    config={config}
                    onDelete={() => handleDelete(config.id)}
                    onViewDetails={() => handleViewDetails(config)}
                    onCompare={handleCompare}
                  />
                ))}
                <AddMoreCTA />
              </>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-light text-center text-near-black mb-6">
              Danh sách đã lưu
            </h2>

            <div className="bg-white rounded-lg p-12 md:p-16 text-center">
              <h3 className="text-2xl font-light text-near-black mb-3">
                Bạn chưa lưu danh sách nào.
              </h3>
              <p className="text-sm text-dark-gray font-light max-w-md mx-auto mb-8">
                Có vẻ như bạn chưa lưu bất kỳ Porsche nào. Bạn có thể chọn lưu để thêm Porsche yêu thích vào danh sách này.
              </p>
              <Link
                href="/models"
                className="inline-flex items-center gap-2 px-6 py-3 border border-near-black text-near-black text-sm font-medium rounded-md hover:bg-near-black hover:text-white transition-colors"
              >
                Duyệt và lưu danh sách
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
