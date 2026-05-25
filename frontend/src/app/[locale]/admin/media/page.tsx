'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, FileText } from 'lucide-react'
import { DataTable } from '@/components/features/admin/data-table'
import { Badge } from '@/components/features/admin/badge'
import { Button } from '@/components/features/admin/button'
import { Modal } from '@/components/features/admin/modal'
import { FormInput } from '@/components/features/admin/form-input'
import { Select } from '@/components/features/admin/select'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Alert } from '@/components/features/admin/alert'
import { useTranslations } from 'next-intl';
import { carImageService, CarImage, CarImageFormData } from '@/services/car-image'
import { carModelService, CarModelItem } from '@/services/car-model'
import { authService, getErrorMessage } from '@/services/auth'

export default function MediaPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [mediaList, setMediaList] = useState<CarImage[]>([])
  const [modelsList, setModelsList] = useState<CarModelItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<CarImage | null>(null)
  const [deletingMedia, setDeletingMedia] = useState<CarImage | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<CarImageFormData>({
    image: null,
    imageType: 'exterior',
    sortOrder: 0,
    isDefault: false,
    carModelId: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carImageService.findAll(searchKeyword, currentPage - 1, pageSize)
      setMediaList(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchModels = useCallback(async () => {
    try {
      const data = await carModelService.findAll('', 0, 100)
      setModelsList(data.content)
    } catch (error) { /* ignore */ }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])
  useEffect(() => { fetchModels() }, [fetchModels])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: CarImage) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (item) {
      setEditingMedia(item)
      setFormData({
        image: null,
        imageType: item.imageType,
        sortOrder: item.sortOrder || 0,
        isDefault: item.isDefault || false,
        carModelId: item.carModelId || null,
      })
    } else {
      setEditingMedia(null)
      setFormData({
        image: null, imageType: 'exterior', sortOrder: 0, isDefault: false,
        carModelId: modelsList.length > 0 ? modelsList[0].id : null,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (!formData.imageType.trim() || (!editingMedia && !formData.image)) { showAlertMessage(t('fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingMedia) {
        await carImageService.update(editingMedia.id, formData)
        showAlertMessage(t('media_updated'), 'success')
      } else {
        await carImageService.create(formData)
        showAlertMessage(t('media_created'), 'success')
      }
      setIsModalOpen(false); fetchMedia()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: CarImage) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    setDeletingMedia(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingMedia || !isAdmin) return
    setSaving(true)
    try {
      await carImageService.delete(deletingMedia.id)
      showAlertMessage(t('media_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingMedia(null); fetchMedia()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  useAdminPage({
    titleKey: 'media_management',
    subtitleKey: 'media_subtitle',
    actions: (
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input type="text" placeholder={t('search_media')} value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64" />
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            {t('add_media')}
          </Button>
        )}
      </div>
    ),
  })

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
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">{t('media_total')}</p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'imageUrl', label: t('media_image_url'),
                render: (value: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-red/10 rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {value ? (
                        <Image src={value} alt="" width={40} height={40} unoptimized className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DA291C" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/></svg>' }} />
                      ) : <FileText size={16} className="text-brand-red" />}
                    </div>
                    <span className="truncate max-w-[200px] text-xs">{value}</span>
                  </div>
                ),
              },
              { key: 'imageType', label: t('media_image_type'), sortable: true },
              { key: 'carModelName', label: t('media_car_model'), render: (v: any) => v || '—' },
              { key: 'isDefault', label: t('media_is_default'), align: 'center',
                render: (v: any) => (
                  <Badge variant={v ? 'success' : 'default'}>
                    {v ? t('yes') : t('no')}
                  </Badge>
                ),
              },
              ...(isAdmin ? [{
                key: 'actions' as keyof CarImage, label: t('actions'), align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('edit')}>
                      <Edit2 size={16} className="text-mid-gray" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('delete')}>
                      <Trash2 size={16} className="text-brand-red" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={mediaList} loading={loading}
            pagination={{
              pageSize,
              currentPage,
              total: totalElements,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize
            }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingMedia ? t('edit_media') : t('add_new_media')}
        subtitle={editingMedia ? t('update_media_info') : t('add_media_subtitle')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingMedia ? t('update') : t('create')}</Button>
        </>}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">Image (Cloudinary) *</label>
            {editingMedia?.imageUrl && !formData.image && (
              <div className="mb-2">
                <Image src={editingMedia.imageUrl} alt="Current Media" width={128} height={128} unoptimized className="object-contain bg-gray-100 dark:bg-neutral-900 rounded p-2" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full text-sm text-mid-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-neutral-700 file:text-near-black dark:file:text-white hover:file:bg-neutral-200 dark:hover:file:bg-[#505050] transition-colors" />
          </div>
          <FormInput label={t('media_image_type')} placeholder={t('media_placeholder_type')} value={formData.imageType}
            onChange={(e) => setFormData({ ...formData, imageType: e.target.value })} required />
          <Select label={t('media_car_model')} placeholder={t('select_model')}
            options={modelsList.map(m => ({ label: m.name, value: m.id }))}
            value={formData.carModelId || ''}
            onChange={(e) => setFormData({ ...formData, carModelId: parseInt(e.target.value) })} required />
          <div className="grid grid-cols-2 gap-4">
            <FormInput label={t('media_sort_order')} type="number" value={formData.sortOrder || ''}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
            <Select label={t('media_is_default')}
              options={[{ label: t('yes'), value: 'true' }, { label: t('no'), value: 'false' }]}
              value={formData.isDefault ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.value === 'true' })} />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('media_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('media_confirm_delete_msg')}</p>
            {deletingMedia && <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingMedia.imageUrl}</p>}
          </div>
        </div>
      </Modal>
    </>
  )
}
