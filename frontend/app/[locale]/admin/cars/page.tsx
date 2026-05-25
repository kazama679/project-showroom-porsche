'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { carModelService, CarModelItem, CarModelFormData } from '@/lib/car-model'
import { carSeriesService, CarSeries } from '@/lib/car-series'
import { bodyTypeService, BodyType } from '@/lib/body-type'
import { authService, getErrorMessage } from '@/lib/auth'

export default function CarsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [cars, setCars] = useState<CarModelItem[]>([])
  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<CarModelItem | null>(null)
  const [deletingCar, setDeletingCar] = useState<CarModelItem | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<CarModelFormData>({
    name: '', year: new Date().getFullYear(), basePrice: 0,
    shortDescription: '', fuelType: 'Gasoline', transmission: 'Automatic',
    seats: 4, isActive: true, seriesId: null, bodyTypeId: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carModelService.findAll(searchKeyword, currentPage - 1, pageSize)
      setCars(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchSeries = useCallback(async () => {
    try {
      const data = await carSeriesService.findAll('', 0, 100)
      setSeriesList(data.content)
    } catch (error) { /* ignore */ }
  }, [])

  const fetchBodyTypes = useCallback(async () => {
    try {
      const data = await bodyTypeService.findAll()
      setBodyTypes(data)
    } catch (error) { /* ignore */ }
  }, [])

  useEffect(() => { fetchCars() }, [fetchCars])
  useEffect(() => { fetchSeries() }, [fetchSeries])
  useEffect(() => { fetchBodyTypes() }, [fetchBodyTypes])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: CarModelItem) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (item) {
      setEditingCar(item)
      setFormData({
        name: item.name, year: item.year, basePrice: item.basePrice,
        shortDescription: item.shortDescription || '', fuelType: item.fuelType || 'Gasoline',
        transmission: item.transmission || 'Automatic', seats: item.seats || 4,
        isActive: item.isActive ?? true,
        seriesId: item.seriesId || null,
        bodyTypeId: item.bodyTypeId || null,
      })
    } else {
      setEditingCar(null)
      setFormData({
        name: '', year: new Date().getFullYear(), basePrice: 0,
        shortDescription: '', fuelType: 'Gasoline', transmission: 'Automatic',
        seats: 4, isActive: true,
        seriesId: seriesList.length > 0 ? seriesList[0].id : null,
        bodyTypeId: bodyTypes.length > 0 ? bodyTypes[0].id : null,
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (!formData.name.trim() || !formData.basePrice) { showAlertMessage(t('fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingCar) {
        await carModelService.update(editingCar.id, formData)
        showAlertMessage(t('model_updated'), 'success')
      } else {
        await carModelService.create(formData)
        showAlertMessage(t('model_created'), 'success')
      }
      setIsModalOpen(false); fetchCars()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: CarModelItem) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    setDeletingCar(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCar || !isAdmin) return
    setSaving(true)
    try {
      await carModelService.delete(deletingCar.id)
      showAlertMessage(t('model_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingCar(null); fetchCars()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  return (
    <PageLayout title={t('cars')} subtitle={t('model_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input type="text" placeholder={t('search_models')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('add_model')}
            </Button>
          )}
        </div>
      }>
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
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">{t('model_total')}</p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'name', label: t('model_name'), sortable: true },
              { key: 'seriesName', label: t('model_series'), render: (v: any) => v || '—' },
              { key: 'year', label: t('model_year'), align: 'center', sortable: true },
              { key: 'basePrice', label: t('model_price'), align: 'right', render: (v: any) => formatPrice(v) },
              { key: 'transmission', label: t('model_transmission'), render: (v: any) => v || '—' },
              { key: 'isActive', label: t('status'), align: 'center',
                render: (v: any) => (
                  <Badge variant={v ? 'success' : 'default'}>
                    {v ? t('active') : t('inactive')}
                  </Badge>
                ),
              },
              ...(isAdmin ? [{
                key: 'actions' as keyof CarModelItem, label: t('actions'), align: 'center' as const,
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
            data={cars} loading={loading}
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
        title={editingCar ? t('edit_model') : t('add_new_model')}
        subtitle={editingCar ? t('update_model_info') : t('add_model_subtitle')}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingCar ? t('update') : t('create')}</Button>
        </>}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <FormInput label={t('model_name')} placeholder={t('model_placeholder_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('model_series')} placeholder={t('select_series')}
              options={seriesList.map(s => ({ label: s.name, value: s.id }))}
              value={formData.seriesId || ''}
              onChange={(e) => setFormData({ ...formData, seriesId: parseInt(e.target.value) })} required />
            <Select label="Body Type" placeholder="Select body type"
              options={bodyTypes.map(b => ({ label: b.name, value: b.id }))}
              value={formData.bodyTypeId || ''}
              onChange={(e) => setFormData({ ...formData, bodyTypeId: parseInt(e.target.value) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label={t('model_year')} type="number" value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} required />
            <FormInput label={t('model_price')} type="number" placeholder={t('model_placeholder_price')} value={formData.basePrice || ''}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label={t('model_fuel_type')} value={formData.fuelType}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })} />
            <FormInput label={t('model_transmission')} value={formData.transmission}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} />
          </div>
          <FormInput label={t('model_seats')} type="number" value={formData.seats || ''}
            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })} />
          <FormInput label={t('model_description')} value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('model_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('model_confirm_delete_msg')}</p>
            {deletingCar && <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingCar.name}</p>}
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
