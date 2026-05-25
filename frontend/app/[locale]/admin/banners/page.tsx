'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { useAdminPage } from "@/components/admin/admin-page-context";
import { Alert } from '@/components/admin/alert'
import { useTranslations } from 'next-intl';
import { homeBannerService, HomeBannerItem, HomeBannerFormData } from '@/lib/home-banner'
import { carModelService, CarModelItem } from '@/lib/car-model'
import { authService, getErrorMessage } from '@/lib/auth'

export default function BannersPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [banners, setBanners] = useState<HomeBannerItem[]>([])
  const [carModels, setCarModels] = useState<CarModelItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HomeBannerItem | null>(null)
  const [deletingBanner, setDeletingBanner] = useState<HomeBannerItem | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<HomeBannerFormData>({
    carModelId: null,
    title: '',
    type: 'CARD',
    videoUrl: '',
    imageUrl: '',
    displayOrder: 1,
    isActive: true,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  useAdminPage({
    titleKey: 'banners',
    subtitleKey: 'banners_subtitle',
    actions: (
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input
            type="text"
            placeholder={t('search_banners')}
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => handleTypeFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white outline-none focus:border-brand-red transition-colors"
        >
          <option value="">All Types</option>
          <option value="HERO">Hero Banner</option>
          <option value="CARD">Featured Card</option>
        </select>
        {isAdmin && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            {t('add_banner')}
          </Button>
        )}
      </div>
    ),
  })

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const data = await homeBannerService.findAll(searchKeyword, currentPage - 1, pageSize, searchType || undefined)
      setBanners(data.content)
      setTotalElements(data.totalElements)
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, currentPage, pageSize, searchType])

  const fetchCarModels = useCallback(async () => {
    try {
      const data = await carModelService.findAll('', 0, 100)
      setCarModels(data.content)
    } catch (error) {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  useEffect(() => {
    fetchCarModels()
  }, [fetchCarModels])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      setCurrentPage(1)
    }, 400)
    setSearchTimeout(timeout)
  }

  const handleTypeFilterChange = (value: string) => {
    setSearchType(value)
    setCurrentPage(1)
  }

  const handleOpenModal = (item?: HomeBannerItem) => {
    if (!isAdmin) {
      showAlertMessage(t('no_permission'), 'warning')
      return
    }
    if (item) {
      setEditingBanner(item)
      setFormData({
        carModelId: item.carModelId,
        title: item.title,
        type: item.type,
        videoUrl: item.videoUrl || '',
        imageUrl: item.imageUrl || '',
        displayOrder: item.displayOrder,
        isActive: item.isActive,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        carModelId: carModels.length > 0 ? carModels[0].id : null,
        title: '',
        type: 'CARD',
        videoUrl: '',
        imageUrl: '',
        displayOrder: 1,
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) {
      showAlertMessage(t('no_permission'), 'warning')
      return
    }
    if (!formData.title.trim()) {
      showAlertMessage(t('fill_required'), 'error')
      return
    }

    setSaving(true)
    try {
      if (editingBanner) {
        await homeBannerService.update(editingBanner.id, formData)
        showAlertMessage(t('banner_updated'), 'success')
      } else {
        await homeBannerService.create(formData)
        showAlertMessage(t('banner_created'), 'success')
      }
      setIsModalOpen(false)
      fetchBanners()
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (item: HomeBannerItem) => {
    if (!isAdmin) {
      showAlertMessage(t('no_permission'), 'warning')
      return
    }
    setDeletingBanner(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingBanner || !isAdmin) return
    setSaving(true)
    try {
      await homeBannerService.delete(deletingBanner.id)
      showAlertMessage(t('banner_deleted'), 'success')
      setIsDeleteModalOpen(false)
      setDeletingBanner(null)
      fetchBanners()
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-sm border border-modena-yellow/30 bg-modena-yellow/10 dark:bg-modena-yellow/20">
            <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('no_permission')}</p>
          </div>
        )}
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-5">
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">
              {t('banner_total')}
            </p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'title', label: t('banner_title'), sortable: true },
              {
                key: 'type',
                label: t('banner_type'),
                render: (v: any) =>
                  v === 'HERO' ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                      HERO BANNER
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      FEATURED CARD
                    </span>
                  ),
              },
              { key: 'carModelName', label: t('banner_car_model'), render: (v: any) => v || '—' },
              { key: 'displayOrder', label: t('banner_display_order'), align: 'center' },
              {
                key: 'isActive',
                label: t('status'),
                align: 'center',
                render: (v: any) =>
                  v ? (
                    <span className="text-green-600 font-semibold">{t('active')}</span>
                  ) : (
                    <span className="text-red-500 font-semibold">{t('inactive')}</span>
                  ),
              },
              ...(isAdmin
                ? [
                    {
                      key: 'actions' as keyof HomeBannerItem,
                      label: t('actions'),
                      align: 'center' as const,
                      render: (value: any, row: any) => (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenModal(row)
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 size={16} className="text-mid-gray" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDeleteModal(row)
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 size={16} className="text-brand-red" />
                          </button>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
            data={banners}
            loading={loading}
            pagination={{
              pageSize,
              currentPage,
              total: totalElements,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? t('edit_banner') : t('add_banner')}
        subtitle={editingBanner ? 'Update homepage banner details' : 'Add new homepage banner'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {tCommon('cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {editingBanner ? t('update') : t('create')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label={t('banner_title')}
            placeholder="e.g. Cayenne S E-Hybrid. or Panamera GTS."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('banner_type')}
              options={[
                { label: 'Hero Banner (Ảnh 1)', value: 'HERO' },
                { label: 'Featured Card (Ảnh 2)', value: 'CARD' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
            <Select
              label={t('banner_car_model')}
              placeholder={t('select_car_model')}
              options={carModels.map((c) => ({ label: c.name, value: c.id }))}
              value={formData.carModelId || ''}
              onChange={(e) =>
                setFormData({ ...formData, carModelId: e.target.value ? parseInt(e.target.value) : null })
              }
              required
            />
          </div>

          {formData.type === 'HERO' ? (
            <FormInput
              label={t('banner_video_url')}
              placeholder="e.g. /home/porsche.mp4 or YouTube video stream URL"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
          ) : (
            <FormInput
              label={t('banner_image_url')}
              placeholder="e.g. https://example.com/porsche.png"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label={t('banner_display_order')}
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
              required
            />
            <Select
              label={t('status')}
              options={[
                { label: t('active'), value: 'true' },
                { label: t('inactive'), value: 'false' },
              ]}
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              required
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('banner_confirm_delete')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>
              {tCommon('cancel')}
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('banner_confirm_delete_msg')}</p>
            {deletingBanner && (
              <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingBanner.title}</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
