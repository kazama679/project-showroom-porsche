'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, Car, Calendar, DollarSign, Users, Fuel, Settings, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/base/ui/select'
import { Label } from '@/components/base/ui/label'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

import { carModelService, CarModelItem, CarModelFormData } from '@/services/car-model'
import { carSeriesService, CarSeries } from '@/services/car-series'
import { bodyTypeService, BodyType } from '@/services/body-type'
import { authService, getErrorMessage } from '@/services/auth'

export default function CarsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

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

  const [formData, setFormData] = useState<CarModelFormData>({
    name: '', year: new Date().getFullYear(), basePrice: 0,
    shortDescription: '', fuelType: 'Gasoline', transmission: 'Automatic',
    seats: 4, isActive: true, seriesId: null, bodyTypeId: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carModelService.findAll(searchKeyword, currentPage - 1, pageSize)
      setCars(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchDependencies = useCallback(async () => {
    try {
      const [seriesData, bodyTypesData] = await Promise.all([
        carSeriesService.findAll('', 0, 100),
        bodyTypeService.findAll()
      ])
      setSeriesList(seriesData.content)
      setBodyTypes(bodyTypesData)
    } catch (error) { console.error('Failed to fetch dependencies') }
  }, [])

  useEffect(() => { fetchCars() }, [fetchCars])
  useEffect(() => { fetchDependencies() }, [fetchDependencies])

  const handleOpenModal = (item?: CarModelItem) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.name.trim() || !formData.basePrice) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingCar) {
        await carModelService.update(editingCar.id, formData)
        toast.success(t('model_updated'))
      } else {
        await carModelService.create(formData)
        toast.success(t('model_created'))
      }
      setIsModalOpen(false)
      fetchCars()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCar || !isAdmin) return
    setSaving(true)
    try {
      await carModelService.delete(deletingCar.id)
      toast.success(t('model_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingCar(null)
      fetchCars()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const columns = useMemo(() => [
    { 
      key: 'id', 
      label: 'ID', 
      align: 'center' as const,
      render: (v: number) => <span className="font-mono text-[10px] text-gray-400">#{v}</span>
    },
    { 
      key: 'name', 
      label: t('model_name'), 
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Car size={14} className="text-gray-400" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{val}</span>
        </div>
      )
    },
    { 
      key: 'seriesName', 
      label: t('model_series'),
      render: (v: any) => <Badge variant="secondary" className="uppercase text-[9px] font-bold">{v || '—'}</Badge>
    },
    { 
      key: 'year', 
      label: t('model_year'), 
      align: 'center' as const, 
      sortable: true,
      render: (v: number) => (
        <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-gray-400">
          <Calendar size={12} />
          {v}
        </div>
      )
    },
    { 
      key: 'basePrice', 
      label: t('model_price'), 
      align: 'right' as const, 
      render: (v: number) => <span className="font-bold italic text-brand-red">{formatPrice(v)}</span>
    },
    { 
      key: 'isActive', 
      label: t('status'), 
      align: 'center' as const,
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'secondary'} className="uppercase text-[9px] tracking-widest font-bold">
          {v ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof CarModelItem, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: CarModelItem) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
            onClick={() => handleOpenModal(row)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-brand-red"
            onClick={() => {
              setDeletingCar(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    }] : []),
  ], [isAdmin, t])

  useAdminPage({
    titleKey: 'cars',
    subtitleKey: 'model_subtitle',
  })

  return (
    <div className="space-y-6">
      {isAuthenticated && !isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-none border border-brand-red/30 bg-brand-red/5 text-brand-red">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <p className="text-[10px] uppercase font-bold tracking-widest">{t('no_permission')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('search_models') || 'Search models...'}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        {isAdmin && (
          <Button
            variant="brand"
            onClick={() => handleOpenModal()}
            className="uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-10 px-6"
          >
            <Plus size={16} className="mr-2" />
            {t('add_model')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={cars}
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

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingCar ? t('edit_model') : t('add_new_model')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400">
              {editingCar ? t('update_model_info') : t('add_model_subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_name')} *</Label>
              <div className="relative">
                <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('model_placeholder_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9 font-bold uppercase h-11"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_series')} *</Label>
                <Select
                  value={formData.seriesId?.toString() || ''}
                  onValueChange={(val) => setFormData({ ...formData, seriesId: parseInt(val) })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue placeholder={t('select_series')} />
                  </SelectTrigger>
                  <SelectContent>
                    {seriesList.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()} className="uppercase font-bold text-[10px]">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Body Type *</Label>
                <Select
                  value={formData.bodyTypeId?.toString() || ''}
                  onValueChange={(val) => setFormData({ ...formData, bodyTypeId: parseInt(val) })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()} className="uppercase font-bold text-[10px]">
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_year')} *</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="pl-9 font-mono h-11"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_price')} *</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    placeholder={t('model_placeholder_price')}
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    className="pl-9 font-mono h-11 text-brand-red font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_fuel_type')}</Label>
                <div className="relative">
                  <Fuel size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="pl-9 uppercase font-bold h-11 text-[10px]"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_transmission')}</Label>
                <div className="relative">
                  <Settings size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="pl-9 uppercase font-bold h-11 text-[10px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_seats')}</Label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  value={formData.seats || ''}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })}
                  className="pl-9 font-mono h-11"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('model_description')}</Label>
              <Input
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="h-11"
              />
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-[0.2em] h-12 px-12 italic italic font-black shadow-lg">
                {editingCar ? t('update') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('model_confirm_delete')}
        description={t('model_confirm_delete_msg')}
        itemLabel={deletingCar?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingCar(null)
        }}
        loading={saving}
      />
    </div>
  )
}
