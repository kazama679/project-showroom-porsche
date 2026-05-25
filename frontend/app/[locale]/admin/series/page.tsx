'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'
import { useTranslations } from 'next-intl';
import { carSeriesService, CarSeries, CarSeriesFormData } from '@/lib/car-series'
import { brandService, Brand } from '@/lib/brand'
import { authService, getErrorMessage } from '@/lib/auth'

export default function SeriesPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<CarSeries | null>(null)
  const [deletingSeries, setDeletingSeries] = useState<CarSeries | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<CarSeriesFormData>({
    name: '',
    description: '',
    isActive: true,
    brandId: null,
    image: null,
    video: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carSeriesService.findAll(searchKeyword, currentPage - 1, pageSize)
      setSeriesList(data.content)
      setTotalElements(data.totalElements)
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, currentPage, pageSize])

  const fetchBrands = useCallback(async () => {
    try {
      const data = await brandService.findAll('', 0, 100)
      setBrands(data.content)
    } catch (error) { /* ignore */ }
  }, [])

  useEffect(() => { fetchSeries() }, [fetchSeries])
  useEffect(() => { fetchBrands() }, [fetchBrands])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: CarSeries) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (item) {
      setEditingSeries(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        isActive: item.isActive ?? true,
        brandId: item.brandId || null,
        image: null,
        video: null,
      })
    } else {
      setEditingSeries(null)
      setFormData({ name: '', description: '', isActive: true, brandId: brands.length > 0 ? brands[0].id : null, image: null, video: null })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (!formData.name.trim()) { showAlertMessage(t('fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingSeries) {
        await carSeriesService.update(editingSeries.id, formData)
        showAlertMessage(t('series_updated'), 'success')
      } else {
        await carSeriesService.create(formData)
        showAlertMessage(t('series_created'), 'success')
      }
      setIsModalOpen(false)
      fetchSeries()
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (item: CarSeries) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    setDeletingSeries(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSeries || !isAdmin) return
    setSaving(true)
    try {
      await carSeriesService.delete(deletingSeries.id)
      showAlertMessage(t('series_deleted'), 'success')
      setIsDeleteModalOpen(false)
      setDeletingSeries(null)
      fetchSeries()
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout
      title={t('series_management')}
      subtitle={t('series_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input type="text" placeholder={t('search_series')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('add_series')}
            </Button>
          )}
        </div>
      }
    >
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
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">{t('series_total')}</p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'name', label: t('series_name'), sortable: true },
              { key: 'brandName', label: t('series_brand'), render: (value: any) => value || '—' },
              { key: 'imageUrl', label: 'Image', align: 'center', render: (value: any) => value ? <Image src={value} alt="Series" width={64} height={40} unoptimized className="object-cover rounded" /> : '—' },
              { key: 'description', label: t('series_description'), render: (value: any) => value || '—' },
              { key: 'isActive', label: t('series_status'), align: 'center',
                render: (value: any) => (
                  <Badge variant={value ? 'success' : 'default'}>
                    {value ? t('active') : t('inactive')}
                  </Badge>
                ),
              },
              ...(isAdmin ? [{
                key: 'actions' as keyof CarSeries,
                label: t('actions'),
                align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row as CarSeries) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('edit')}>
                      <Edit2 size={16} className="text-mid-gray" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row as CarSeries) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('delete')}>
                      <Trash2 size={16} className="text-brand-red" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={seriesList}
            loading={loading}
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
        title={editingSeries ? t('edit_series') : t('add_new_series')}
        subtitle={editingSeries ? t('update_series_info') : t('add_series_subtitle')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingSeries ? t('update') : t('create')}</Button>
        </>}>
        <div className="space-y-4">
          <FormInput label={t('series_name')} placeholder={t('series_placeholder_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Select label={t('series_brand')} placeholder={t('select_brand')}
            options={brands.map(b => ({ label: b.name, value: b.id }))}
            value={formData.brandId || ''}
            onChange={(e) => setFormData({ ...formData, brandId: parseInt(e.target.value) })} required />
          <FormInput label={t('series_description')} placeholder={t('series_placeholder_desc')} value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">Image (Cloudinary)</label>
            {editingSeries?.imageUrl && !formData.image && (
              <div className="mb-2">
                <Image src={editingSeries.imageUrl} alt="Current Series" width={128} height={128} unoptimized className="object-contain bg-gray-100 dark:bg-neutral-900 rounded" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full text-sm text-mid-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-neutral-700 file:text-near-black dark:file:text-white hover:file:bg-neutral-200 dark:hover:file:bg-[#505050] transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">Video (Cloudinary)</label>
            {editingSeries?.videoUrl && !formData.video && (
              <div className="mb-2">
                <video src={editingSeries.videoUrl} controls className="h-32 object-contain bg-gray-100 dark:bg-neutral-900 rounded"></video>
              </div>
            )}
            <input type="file" accept="video/*" onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
              className="w-full text-sm text-mid-gray file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-neutral-700 file:text-near-black dark:file:text-white hover:file:bg-neutral-200 dark:hover:file:bg-[#505050] transition-colors" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('series_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('series_confirm_delete_msg')}</p>
            {deletingSeries && <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingSeries.name}</p>}
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
