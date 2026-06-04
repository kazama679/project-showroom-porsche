'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, ShieldAlert, Upload, Film } from 'lucide-react'
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
import { Badge } from '@/components/base/ui/badge'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

import { carSeriesService, CarSeries, CarSeriesFormData } from '@/services/car-series'
import { brandService, Brand } from '@/services/brand'
import { authService, getErrorMessage } from '@/services/auth'

export default function SeriesPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

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

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carSeriesService.findAll(searchKeyword, currentPage - 1, pageSize)
      setSeriesList(data.content)
      setTotalElements(data.totalElements)
    } catch (error) {
      toast.error(getErrorMessage(error))
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
    if (!isAdmin) { toast.error(t('no_permission')); return }
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
    if (!isAdmin) { toast.error(t('no_permission')); return }
    if (!formData.name.trim()) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingSeries) {
        await carSeriesService.update(editingSeries.id, formData)
        toast.success(t('series_updated'))
      } else {
        await carSeriesService.create(formData)
        toast.success(t('series_created'))
      }
      setIsModalOpen(false)
      fetchSeries()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (item: CarSeries) => {
    if (!isAdmin) { toast.error(t('no_permission')); return }
    setDeletingSeries(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSeries || !isAdmin) return
    setSaving(true)
    try {
      await carSeriesService.delete(deletingSeries.id)
      toast.success(t('series_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingSeries(null)
      fetchSeries()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  useAdminPage({
    titleKey: 'series_management',
    subtitleKey: 'series_subtitle',
  })

  const columns = [
    { key: 'id', label: 'ID', align: 'center' as const, sortable: true },
    { 
      key: 'name', 
      label: t('series_name'), 
      sortable: true,
      render: (v: string, row: any) => (
        <div className="flex items-center gap-3">
          {(row as CarSeries).imageUrl && (
            <div className="w-12 h-8 bg-gray-50 dark:bg-neutral-800 border rounded-sm overflow-hidden flex-shrink-0">
              <Image src={(row as CarSeries).imageUrl!} alt={v} width={48} height={32} unoptimized className="object-cover w-full h-full" />
            </div>
          )}
          <span className="font-bold uppercase text-near-black dark:text-white tracking-tight">{v}</span>
        </div>
      )
    },
    { key: 'brandName', label: t('series_brand'), render: (v: any) => <span className="text-sm text-gray-500">{v || '—'}</span> },
    { key: 'description', label: t('series_description'), render: (v: any) => <span className="text-sm line-clamp-1 max-w-toolbar-code">{v || '—'}</span> },
    { 
      key: 'isActive', 
      label: t('series_status'), 
      align: 'center' as const,
      render: (v: any) => (
        <Badge variant={v ? 'success' : 'outline'}>
          {v ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof CarSeries,
      label: t('actions'),
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenModal(row as CarSeries)}
            className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenDeleteModal(row as CarSeries)}
            className="h-8 w-8 text-gray-400 hover:text-brand-red"
            title={t('delete')}
          >
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
            id="series-search"
            placeholder={t('search_series')}
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        {isAdmin && (
          <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            {t('add_series')}
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
          data={seriesList}
          loading={loading}
          pagination={{
            pageSize,
            currentPage,
            total: totalElements,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSeries ? t('edit_series') : t('add_new_series')}</DialogTitle>
            <DialogDescription>
              {editingSeries ? t('update_series_info') : t('add_series_subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="seriesName" className="text-xs uppercase font-bold tracking-wider">{t('series_name')}</Label>
                <Input
                  id="seriesName"
                  placeholder={t('series_placeholder_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">{t('series_brand')}</Label>
                <Select value={formData.brandId?.toString() || ''} onValueChange={(val) => setFormData({ ...formData, brandId: parseInt(val) })}>
                  <SelectTrigger><SelectValue placeholder={t('select_brand')} /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seriesDesc" className="text-xs uppercase font-bold tracking-wider">{t('series_description')}</Label>
              <Input
                id="seriesDesc"
                placeholder={t('series_placeholder_desc')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Visual Identity (Image)</Label>
                <div className="flex items-center gap-3 p-3 border border-dashed rounded-sm bg-gray-50/50 dark:bg-neutral-900/50">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-800 border rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.image ? (
                      <Image src={URL.createObjectURL(formData.image)} alt="Preview" width={48} height={48} className="object-cover h-full" />
                    ) : editingSeries?.imageUrl ? (
                      <Image src={editingSeries.imageUrl} alt="Existing" width={48} height={48} unoptimized className="object-cover h-full" />
                    ) : (
                      <Upload size={20} className="text-gray-300" />
                    )}
                  </div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                    className="cursor-pointer file:bg-transparent file:border-0 file:text-eyebrow h-8"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Dynamic Showcase (Video)</Label>
                <div className="flex items-center gap-3 p-3 border border-dashed rounded-sm bg-gray-50/50 dark:bg-neutral-900/50">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-800 border rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.video ? (
                      <Film size={20} className="text-brand-red" />
                    ) : editingSeries?.videoUrl ? (
                      <Film size={20} className="text-brand-red" />
                    ) : (
                      <Film size={20} className="text-gray-300" />
                    )}
                  </div>
                  <Input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setFormData({ ...formData, video: e.target.files?.[0] || null })}
                    className="cursor-pointer file:bg-transparent file:border-0 file:text-eyebrow h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave} loading={saving}>
              {editingSeries ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('series_confirm_delete')}
        description={t('series_confirm_delete_msg')}
        itemLabel={deletingSeries?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={saving}
      />
    </div>
  )
}
