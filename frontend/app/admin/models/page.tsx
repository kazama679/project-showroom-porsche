'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, Settings, ListChecks } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'
import { useLanguage } from '@/lib/language-context'
import { carModelService, CarModelItem, CarModelFormData } from '@/lib/car-model'
import { carSeriesService, CarSeries } from '@/lib/car-series'
import { carSpecService, CarSpecsDTO } from '@/lib/car-specs'
import { bodyTypeService, BodyType } from '@/lib/body-type'
import { authService, getErrorMessage } from '@/lib/auth'
import { ModelOptionsModal } from '@/components/admin/model-options-modal'

export default function ModelsPage() {
  const { t } = useLanguage()

  const [models, setModels] = useState<CarModelItem[]>([])
  const [seriesList, setSeriesList] = useState<CarSeries[]>([])
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<CarModelItem | null>(null)
  const [deletingModel, setDeletingModel] = useState<CarModelItem | null>(null)
  const [saving, setSaving] = useState(false)

  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false)
  const [currentSpecsModel, setCurrentSpecsModel] = useState<CarModelItem | null>(null)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [currentOptionsModel, setCurrentOptionsModel] = useState<CarModelItem | null>(null)
  const [specsFormData, setSpecsFormData] = useState<CarSpecsDTO>({ performance: null, engine: null, electric: null })

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

  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carModelService.findAll(searchKeyword, currentPage - 1, pageSize)
      setModels(data.content)
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

  useEffect(() => { fetchModels() }, [fetchModels])
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
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (item) {
      setEditingModel(item)
      setFormData({
        name: item.name, year: item.year, basePrice: item.basePrice,
        shortDescription: item.shortDescription || '', fuelType: item.fuelType || 'Gasoline',
        transmission: item.transmission || 'Automatic', seats: item.seats || 4,
        isActive: item.isActive ?? true,
        seriesId: item.seriesId || null,
        bodyTypeId: item.bodyTypeId || null,
      })
    } else {
      setEditingModel(null)
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
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (!formData.name.trim() || !formData.basePrice) { showAlertMessage(t('admin.fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingModel) {
        await carModelService.update(editingModel.id, formData)
        showAlertMessage(t('admin.model_updated'), 'success')
      } else {
        await carModelService.create(formData)
        showAlertMessage(t('admin.model_created'), 'success')
      }
      setIsModalOpen(false); fetchModels()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: CarModelItem) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setDeletingModel(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingModel || !isAdmin) return
    setSaving(true)
    try {
      await carModelService.delete(deletingModel.id)
      showAlertMessage(t('admin.model_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingModel(null); fetchModels()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenOptionsModal = (item: CarModelItem) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setCurrentOptionsModel(item)
    setIsOptionsModalOpen(true)
  }

  const handleOpenSpecsModal = async (item: CarModelItem) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setCurrentSpecsModel(item)
    setLoading(true)
    try {
      const specs = await carSpecService.getSpecsByCarModelId(item.id)
      setSpecsFormData({
        performance: specs?.performance || { horsepower: null, acceleration0100: null, topSpeed: null },
        engine: specs?.engine || { engineType: '', drivetrain: '', fuelConsumption: null },
        electric: specs?.electric || { rangeKm: null, batteryCapacity: null, chargingTime: null }
      })
      setIsSpecsModalOpen(true)
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSpecs = async () => {
    if (!currentSpecsModel || !isAdmin) return
    setSaving(true)
    try {
      await carSpecService.saveSpecs(currentSpecsModel.id, specsFormData)
      showAlertMessage(t('admin.specs_updated'), 'success')
      setIsSpecsModalOpen(false)
    } catch (error) {
      showAlertMessage(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <PageLayout title={t('admin.model_management')} subtitle={t('admin.model_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
            <input type="text" placeholder={t('admin.search_models')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('admin.add_model')}
            </Button>
          )}
        </div>
      }>
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
            <p className="text-xs font-medium text-[#8F8F8F] dark:text-[#D2D2D2] uppercase tracking-wider">{t('admin.model_total')}</p>
            <p className="text-2xl font-bold text-[#181818] dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'name', label: t('admin.model_name'), sortable: true },
              { key: 'seriesName', label: t('admin.model_series'), render: (v: any) => v || '—' },
              { key: 'year', label: t('admin.model_year'), align: 'center' },
              { key: 'basePrice', label: t('admin.model_price'), align: 'right', render: (v: any) => formatPrice(v) },
              { key: 'transmission', label: t('admin.model_transmission'), render: (v: any) => v || '—' },
              ...(isAdmin ? [{
                key: 'actions' as keyof CarModelItem, label: t('admin.actions'), align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenOptionsModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.manage_model_options')}>
                      <ListChecks size={16} className="text-[#1a73e8]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenSpecsModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.manage_specs')}>
                      <Settings size={16} className="text-[#188038]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.edit')}>
                      <Edit2 size={16} className="text-[#8F8F8F]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.delete')}>
                      <Trash2 size={16} className="text-[#DA291C]" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={models} loading={loading}
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
        title={editingModel ? t('admin.edit_model') : t('admin.add_new_model')}
        subtitle={editingModel ? t('admin.update_model_info') : t('admin.add_model_subtitle')}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingModel ? t('admin.update') : t('admin.create')}</Button>
        </>}>
        <div className="space-y-4">
          <FormInput label={t('admin.model_name')} placeholder={t('admin.model_placeholder_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('admin.model_series')} placeholder={t('admin.select_series')}
              options={seriesList.map(s => ({ label: s.name, value: s.id }))}
              value={formData.seriesId || ''}
              onChange={(e) => setFormData({ ...formData, seriesId: parseInt(e.target.value) })} required />
            <Select label="Body Type" placeholder="Select body type"
              options={bodyTypes.map(b => ({ label: b.name, value: b.id }))}
              value={formData.bodyTypeId || ''}
              onChange={(e) => setFormData({ ...formData, bodyTypeId: parseInt(e.target.value) })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput label={t('admin.model_year')} type="number" value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} required />
            <FormInput label={t('admin.model_price')} type="number" placeholder={t('admin.model_placeholder_price')} value={formData.basePrice || ''}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label={t('admin.model_fuel_type')} placeholder={t('admin.model_fuel_type')}
              options={[
                { label: t('admin.fuel_gasoline'), value: 'Gasoline' },
                { label: t('admin.fuel_electric'), value: 'Electric' },
                { label: t('admin.fuel_hybrid'), value: 'Hybrid' }
              ]}
              value={formData.fuelType || 'Gasoline'}
              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })} />
            <FormInput label={t('admin.model_transmission')} value={formData.transmission}
              onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} />
          </div>
          <FormInput label={t('admin.model_seats')} type="number" value={formData.seats || ''}
            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })} />
          <FormInput label={t('admin.model_description')} value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('admin.model_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('admin.delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-[#DA291C]/10 dark:bg-[#DA291C]/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-[#DA291C]" />
          </div>
          <div>
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{t('admin.model_confirm_delete_msg')}</p>
            {deletingModel && <p className="text-sm font-semibold text-[#181818] dark:text-white mt-2">{deletingModel.name}</p>}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isSpecsModalOpen} onClose={() => setIsSpecsModalOpen(false)} title={`${t('admin.manage_specs')} - ${currentSpecsModel?.name}`} size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setIsSpecsModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSaveSpecs} loading={saving}>{t('admin.update')}</Button>
        </>}>
        <div className="space-y-6">
          {/* Performance Specs */}
          <div>
            <h4 className="font-semibold text-lg border-b pb-2 mb-4">{t('admin.performance_specs')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label={t('admin.horsepower')} type="number" value={specsFormData.performance?.horsepower || ''}
                onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, horsepower: parseInt(e.target.value) || null } })} />
              <FormInput label={t('admin.acceleration')} type="number" value={specsFormData.performance?.acceleration0100 || ''}
                onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, acceleration0100: parseFloat(e.target.value) || null } })} />
              <FormInput label={t('admin.top_speed')} type="number" value={specsFormData.performance?.topSpeed || ''}
                onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, topSpeed: parseInt(e.target.value) || null } })} />
            </div>
          </div>

          {/* Engine Specs */}
          {(currentSpecsModel?.fuelType === 'Gasoline' || currentSpecsModel?.fuelType === 'Hybrid' || !currentSpecsModel?.fuelType) && (
            <div>
              <h4 className="font-semibold text-lg border-b pb-2 mb-4">{t('admin.engine_specs')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label={t('admin.engine_type')} value={specsFormData.engine?.engineType || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, engineType: e.target.value } })} />
                <FormInput label={t('admin.drivetrain')} value={specsFormData.engine?.drivetrain || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, drivetrain: e.target.value } })} />
                <FormInput label={t('admin.fuel_consumption')} type="number" value={specsFormData.engine?.fuelConsumption || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, fuelConsumption: parseFloat(e.target.value) || null } })} />
              </div>
            </div>
          )}

          {/* Electric Specs */}
          {(currentSpecsModel?.fuelType === 'Electric' || currentSpecsModel?.fuelType === 'Hybrid') && (
            <div>
              <h4 className="font-semibold text-lg border-b pb-2 mb-4">{t('admin.electric_specs')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label={t('admin.range')} type="number" value={specsFormData.electric?.rangeKm || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, rangeKm: parseInt(e.target.value) || null } })} />
                <FormInput label={t('admin.battery_capacity')} type="number" value={specsFormData.electric?.batteryCapacity || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, batteryCapacity: parseFloat(e.target.value) || null } })} />
                <FormInput label={t('admin.charging_time')} type="number" value={specsFormData.electric?.chargingTime || ''}
                  onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, chargingTime: parseFloat(e.target.value) || null } })} />
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ModelOptionsModal
        isOpen={isOptionsModalOpen}
        model={currentOptionsModel}
        onClose={() => {
          setIsOptionsModalOpen(false)
          setCurrentOptionsModel(null)
        }}
        onNotify={showAlertMessage}
        labels={{
          title: t('admin.model_options_title'),
          assignedTitle: t('admin.model_options_assigned'),
          addTitle: t('admin.model_options_add'),
          searchAssigned: t('admin.model_options_search_assigned'),
          searchOptions: t('admin.model_options_search_add'),
          searchHint: t('admin.model_options_search_hint'),
          noAssigned: t('admin.model_options_no_assigned'),
          noResults: t('admin.model_options_no_results'),
          add: t('admin.create'),
          delete: t('admin.delete'),
          cancel: t('common.cancel'),
          confirmDelete: t('admin.model_options_confirm_delete'),
          confirmDeleteMsg: t('admin.model_options_confirm_delete_msg'),
          optionAdded: t('admin.model_options_added'),
          optionDeleted: t('admin.model_options_deleted'),
          alreadyAssigned: t('admin.model_options_already_assigned'),
          total: t('admin.total'),
        }}
      />
    </PageLayout>
  )
}
