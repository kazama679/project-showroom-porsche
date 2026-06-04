'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, Settings, ListChecks } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Button } from '@/components/base/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/base/ui/dialog'
import { Input } from '@/components/base/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/base/ui/select'
import { Label } from '@/components/base/ui/label'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

import { carModelService, CarModelItem, CarModelFormData } from '@/services/car-model'
import { carSeriesService, CarSeries } from '@/services/car-series'
import { carSpecService, CarSpecsDTO } from '@/services/car-specs'
import { bodyTypeService, BodyType } from '@/services/body-type'
import { authService, getErrorMessage } from '@/services/auth'
import { ModelOptionsModal } from '@/components/features/admin/model-options-modal'

export default function ModelsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

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

  const [formData, setFormData] = useState<CarModelFormData>({
    name: '', year: new Date().getFullYear(), basePrice: 0,
    shortDescription: '', fuelType: 'Gasoline', transmission: 'Automatic',
    seats: 4, isActive: true, seriesId: null, bodyTypeId: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carModelService.findAll(searchKeyword, currentPage - 1, pageSize)
      setModels(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
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
    if (!isAdmin) { toast.error(t('no_permission')); return }
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
    if (!isAdmin) { toast.error(t('no_permission')); return }
    if (!formData.name.trim() || !formData.basePrice) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingModel) {
        await carModelService.update(editingModel.id, formData)
        toast.success(t('model_updated'))
      } else {
        await carModelService.create(formData)
        toast.success(t('model_created'))
      }
      setIsModalOpen(false); fetchModels()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: CarModelItem) => {
    if (!isAdmin) { toast.error(t('no_permission')); return }
    setDeletingModel(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingModel || !isAdmin) return
    setSaving(true)
    try {
      await carModelService.delete(deletingModel.id)
      toast.success(t('model_deleted'))
      setIsDeleteModalOpen(false); setDeletingModel(null); fetchModels()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleOpenOptionsModal = (item: CarModelItem) => {
    if (!isAdmin) { toast.error(t('no_permission')); return }
    setCurrentOptionsModel(item)
    setIsOptionsModalOpen(true)
  }

  const handleOpenSpecsModal = async (item: CarModelItem) => {
    if (!isAdmin) { toast.error(t('no_permission')); return }
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
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSpecs = async () => {
    if (!currentSpecsModel || !isAdmin) return
    setSaving(true)
    try {
      await carSpecService.saveSpecs(currentSpecsModel.id, specsFormData)
      toast.success(t('specs_updated'))
      setIsSpecsModalOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  useAdminPage({
    titleKey: 'model_management',
    subtitleKey: 'model_subtitle',
  })

  const columns = [
    { key: 'id', label: 'ID', align: 'center' as const, sortable: true },
    { key: 'name', label: t('model_name'), sortable: true, render: (v: string) => <span className="font-bold uppercase text-near-black dark:text-white">{v}</span> },
    { key: 'seriesName', label: t('model_series'), render: (v: any) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    { key: 'year', label: t('model_year'), align: 'center' as const },
    { key: 'basePrice', label: t('model_price'), align: 'right' as const, render: (v: any) => <span className="font-mono font-semibold">{formatPrice(v)}</span> },
    { key: 'transmission', label: t('model_transmission'), render: (v: any) => <span className="text-xs uppercase bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded-sm">{v || '—'}</span> },
    ...(isAdmin ? [{
      key: 'actions' as keyof CarModelItem, label: t('actions'), align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" onClick={() => handleOpenOptionsModal(row)} title={t('manage_model_options')} className="h-8 w-8 text-blue-500 hover:text-blue-600">
            <ListChecks size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenSpecsModal(row)} title={t('manage_specs')} className="h-8 w-8 text-green-500 hover:text-green-600">
            <Settings size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(row)} title={t('edit')} className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white">
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteModal(row)} title={t('delete')} className="h-8 w-8 text-gray-400 hover:text-brand-red">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="model-search"
            placeholder={t('search_models')}
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        {isAdmin && (
          <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            {t('add_model')}
          </Button>
        )}
      </div>

      {isAuthenticated && !isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-sm border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">{t('no_permission')}</p>
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={models}
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingModel ? t('edit_model') : t('add_new_model')}</DialogTitle>
            <DialogDescription>{editingModel ? t('update_model_info') : t('add_model_subtitle')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="modelName" className="text-xs uppercase font-bold tracking-wider">{t('model_name')}</Label>
              <Input id="modelName" placeholder={t('model_placeholder_name')} value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('model_series')}</Label>
                <Select value={formData.seriesId?.toString() || ''} onValueChange={(val) => setFormData({ ...formData, seriesId: parseInt(val) })}>
                  <SelectTrigger><SelectValue placeholder={t('select_series')} /></SelectTrigger>
                  <SelectContent>
                    {seriesList.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Body Type</Label>
                <Select value={formData.bodyTypeId?.toString() || ''} onValueChange={(val) => setFormData({ ...formData, bodyTypeId: parseInt(val) })}>
                  <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('model_year')}</Label>
                <Input type="number" value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('model_price')}</Label>
                <Input type="number" placeholder={t('model_placeholder_price')} value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('model_fuel_type')}</Label>
                <Select value={formData.fuelType || 'Gasoline'} onValueChange={(val) => setFormData({ ...formData, fuelType: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasoline">{t('fuel_gasoline')}</SelectItem>
                    <SelectItem value="Electric">{t('fuel_electric')}</SelectItem>
                    <SelectItem value="Hybrid">{t('fuel_hybrid')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('model_transmission')}</Label>
                <Input value={formData.transmission} onChange={(e) => setFormData({ ...formData, transmission: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold tracking-wider">{t('model_seats')}</Label>
              <Input type="number" value={formData.seats || ''} onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })} />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold tracking-wider">{t('model_description')}</Label>
              <Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
            <Button variant="brand" onClick={handleSave} loading={saving}>{editingModel ? tCommon('update') : tCommon('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('model_confirm_delete')}
        description={t('model_confirm_delete_msg')}
        itemLabel={deletingModel?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={saving}
      />

      <Dialog open={isSpecsModalOpen} onOpenChange={setIsSpecsModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('manage_specs')} - {currentSpecsModel?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-dialog-scroll overflow-y-auto pr-2">
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-brand-red flex items-center gap-2">
                <Settings size={14} /> {t('performance_specs')}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('horsepower')}</Label>
                  <Input type="number" value={specsFormData.performance?.horsepower || ''}
                    onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, horsepower: parseInt(e.target.value) || null } })} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-eyebrow uppercase font-bold text-gray-500 text-nowrap">{t('acceleration')}</Label>
                  <Input type="number" value={specsFormData.performance?.acceleration0100 || ''}
                    onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, acceleration0100: parseFloat(e.target.value) || null } })} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('top_speed')}</Label>
                  <Input type="number" value={specsFormData.performance?.topSpeed || ''}
                    onChange={(e) => setSpecsFormData({ ...specsFormData, performance: { ...specsFormData.performance!, topSpeed: parseInt(e.target.value) || null } })} />
                </div>
              </div>
            </div>

            {(currentSpecsModel?.fuelType === 'Gasoline' || currentSpecsModel?.fuelType === 'Hybrid' || !currentSpecsModel?.fuelType) && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-red flex items-center gap-2">
                  <Settings size={14} /> {t('engine_specs')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('engine_type')}</Label>
                    <Input value={specsFormData.engine?.engineType || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, engineType: e.target.value } })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('drivetrain')}</Label>
                    <Input value={specsFormData.engine?.drivetrain || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, drivetrain: e.target.value } })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('fuel_consumption')}</Label>
                    <Input type="number" value={specsFormData.engine?.fuelConsumption || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, engine: { ...specsFormData.engine!, fuelConsumption: parseFloat(e.target.value) || null } })} />
                  </div>
                </div>
              </div>
            )}

            {(currentSpecsModel?.fuelType === 'Electric' || currentSpecsModel?.fuelType === 'Hybrid') && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-red flex items-center gap-2">
                  <Settings size={14} /> {t('electric_specs')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('range')}</Label>
                    <Input type="number" value={specsFormData.electric?.rangeKm || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, rangeKm: parseInt(e.target.value) || null } })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('battery_capacity')}</Label>
                    <Input type="number" value={specsFormData.electric?.batteryCapacity || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, batteryCapacity: parseFloat(e.target.value) || null } })} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-eyebrow uppercase font-bold text-gray-500">{t('charging_time')}</Label>
                    <Input type="number" value={specsFormData.electric?.chargingTime || ''}
                      onChange={(e) => setSpecsFormData({ ...specsFormData, electric: { ...specsFormData.electric!, chargingTime: parseFloat(e.target.value) || null } })} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
            <Button variant="brand" onClick={handleSaveSpecs} loading={saving}>{t('update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModelOptionsModal
        isOpen={isOptionsModalOpen}
        model={currentOptionsModel}
        onClose={() => {
          setIsOptionsModalOpen(false)
          setCurrentOptionsModel(null)
        }}
        onNotify={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
        labels={{
          title: t('model_options_title'),
          assignedTitle: t('model_options_assigned'),
          addTitle: t('model_options_add'),
          searchAssigned: t('model_options_search_assigned'),
          searchOptions: t('model_options_search_add'),
          searchHint: t('model_options_search_hint'),
          noAssigned: t('model_options_no_assigned'),
          noResults: t('model_options_no_results'),
          add: t('create'),
          addAsDefault: t('model_options_add_as_default'),
          delete: t('delete'),
          cancel: tCommon('cancel'),
          confirmDelete: t('model_options_confirm_delete'),
          confirmDeleteMsg: t('model_options_confirm_delete_msg'),
          optionAdded: t('model_options_added'),
          optionDeleted: t('model_options_deleted'),
          alreadyAssigned: t('model_options_already_assigned'),
          total: tCommon('total'),
          setDefault: t('model_options_set_default'),
          defaultLabel: t('model_options_default'),
          defaultUpdated: t('model_options_default_updated'),
        }}
      />
    </div>
  )
}
