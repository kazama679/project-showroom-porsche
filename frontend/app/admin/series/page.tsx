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
import { useLanguage } from '@/lib/language-context'
import { carSeriesService, CarSeries, CarSeriesFormData } from '@/lib/car-series'
import { brandService, Brand } from '@/lib/brand'
import { authService, getErrorMessage } from '@/lib/auth'

export default function SeriesPage() {
  const { t } = useLanguage()

  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
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
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
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
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (!formData.name.trim()) { showAlertMessage(t('admin.fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingSeries) {
        await carSeriesService.update(editingSeries.id, formData)
        showAlertMessage(t('admin.series_updated'), 'success')
      } else {
        await carSeriesService.create(formData)
        showAlertMessage(t('admin.series_created'), 'success')
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
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setDeletingSeries(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSeries || !isAdmin) return
    setSaving(true)
    try {
      await carSeriesService.delete(deletingSeries.id)
      showAlertMessage(t('admin.series_deleted'), 'success')
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
      title={t('admin.series_management')}
      subtitle={t('admin.series_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
            <input type="text" placeholder={t('admin.search_series')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('admin.add_series')}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-[2px] border border-[#F6E500]/30 bg-[#F6E500]/10 dark:bg-[#F6E500]/20">
            <ShieldAlert size={20} className="text-[#B8A500] flex-shrink-0" />
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{t('admin.no_permission')}</p>
          </div>
        )}

        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-5">
            <p className="text-xs font-medium text-[#8F8F8F] dark:text-[#D2D2D2] uppercase tracking-wider">{t('admin.series_total')}</p>
            <p className="text-2xl font-bold text-[#181818] dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'name', label: t('admin.series_name'), sortable: true },
              { key: 'brandName', label: t('admin.series_brand'), render: (value: any) => value || '—' },
              { key: 'imageUrl', label: 'Image', align: 'center', render: (value: any) => value ? <Image src={value} alt="Series" width={64} height={40} unoptimized className="object-cover rounded" /> : '—' },
              { key: 'description', label: t('admin.series_description'), render: (value: any) => value || '—' },
              { key: 'isActive', label: t('admin.series_status'), align: 'center',
                render: (value: any) => (
                  <Badge variant={value ? 'success' : 'default'}>
                    {value ? t('admin.active') : t('admin.inactive')}
                  </Badge>
                ),
              },
              ...(isAdmin ? [{
                key: 'actions' as keyof CarSeries,
                label: t('admin.actions'),
                align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row as CarSeries) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.edit')}>
                      <Edit2 size={16} className="text-[#8F8F8F]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row as CarSeries) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.delete')}>
                      <Trash2 size={16} className="text-[#DA291C]" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={seriesList}
            loading={loading}
            pagination={{ pageSize, currentPage, total: totalElements, onPageChange: setCurrentPage }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingSeries ? t('admin.edit_series') : t('admin.add_new_series')}
        subtitle={editingSeries ? t('admin.update_series_info') : t('admin.add_series_subtitle')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingSeries ? t('admin.update') : t('admin.create')}</Button>
        </>}>
        <div className="space-y-4">
          <FormInput label={t('admin.series_name')} placeholder={t('admin.series_placeholder_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Select label={t('admin.series_brand')} placeholder={t('admin.select_brand')}
            options={brands.map(b => ({ label: b.name, value: b.id }))}
            value={formData.brandId || ''}
            onChange={(e) => setFormData({ ...formData, brandId: parseInt(e.target.value) })} required />
          <FormInput label={t('admin.series_description')} placeholder={t('admin.series_placeholder_desc')} value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#181818] dark:text-[#D2D2D2]">Image (Cloudinary)</label>
            {editingSeries?.imageUrl && !formData.image && (
              <div className="mb-2">
                <Image src={editingSeries.imageUrl} alt="Current Series" width={128} height={128} unoptimized className="object-contain bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              className="w-full text-sm text-[#8F8F8F] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#F5F5F5] dark:file:bg-[#404040] file:text-[#181818] dark:file:text-white hover:file:bg-[#EBEBEB] dark:hover:file:bg-[#505050] transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[#181818] dark:text-[#D2D2D2]">Video (Cloudinary)</label>
            {editingSeries?.videoUrl && !formData.video && (
              <div className="mb-2">
                <video src={editingSeries.videoUrl} controls className="h-32 object-contain bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded"></video>
              </div>
            )}
            <input type="file" accept="video/*" onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
              className="w-full text-sm text-[#8F8F8F] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#F5F5F5] dark:file:bg-[#404040] file:text-[#181818] dark:file:text-white hover:file:bg-[#EBEBEB] dark:hover:file:bg-[#505050] transition-colors" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('admin.series_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('admin.delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-[#DA291C]/10 dark:bg-[#DA291C]/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-[#DA291C]" />
          </div>
          <div>
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{t('admin.series_confirm_delete_msg')}</p>
            {deletingSeries && <p className="text-sm font-semibold text-[#181818] dark:text-white mt-2">{deletingSeries.name}</p>}
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
