'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, FileText, ImageIcon, Settings2, Car, Layers, CheckCircle2, XCircle, UploadCloud } from 'lucide-react'
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
import { Checkbox } from '@/components/base/ui/checkbox'
import { Label } from '@/components/base/ui/label'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

import { carImageService, CarImage, CarImageFormData } from '@/services/car-image'
import { carModelService, CarModelItem } from '@/services/car-model'
import { authService, getErrorMessage } from '@/services/auth'

export default function MediaPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

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

  const [formData, setFormData] = useState<CarImageFormData>({
    image: null,
    imageType: 'exterior',
    sortOrder: 0,
    isDefault: false,
    carModelId: null,
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carImageService.findAll(searchKeyword, currentPage - 1, pageSize)
      setMediaList(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchModels = useCallback(async () => {
    try {
      const data = await carModelService.findAll('', 0, 100)
      setModelsList(data.content)
    } catch (error) { console.error('Failed to fetch models') }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])
  useEffect(() => { fetchModels() }, [fetchModels])

  const handleOpenModal = (item?: CarImage) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (item) {
      setEditingMedia(item)
      setFormData({
        image: null,
        imageType: item.imageType,
        sortOrder: item.sortOrder || 0,
        isDefault: item.isDefault || false,
        carModelId: item.carModelId || null,
      })
      setPreviewUrl(item.imageUrl)
    } else {
      setEditingMedia(null)
      setFormData({
        image: null, imageType: 'exterior', sortOrder: 0, isDefault: false,
        carModelId: modelsList.length > 0 ? modelsList[0].id : null,
      })
      setPreviewUrl(null)
    }
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, image: file })
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.imageType.trim() || (!editingMedia && !formData.image)) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingMedia) {
        await carImageService.update(editingMedia.id, formData)
        toast.success(t('media_updated'))
      } else {
        await carImageService.create(formData)
        toast.success(t('media_created'))
      }
      setIsModalOpen(false)
      fetchMedia()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMedia || !isAdmin) return
    setSaving(true)
    try {
      await carImageService.delete(deletingMedia.id)
      toast.success(t('media_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingMedia(null)
      fetchMedia()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { 
      key: 'id', 
      label: 'ID', 
      align: 'center' as const,
      render: (v: number) => <span className="font-mono text-[10px] text-gray-400">#{v}</span>
    },
    { 
      key: 'imageUrl', 
      label: t('media_image_url'),
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 flex items-center justify-center flex-shrink-0 overflow-hidden group relative">
            {value ? (
              <Image 
                src={value} 
                alt="" 
                width={48} 
                height={48} 
                unoptimized 
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            ) : <ImageIcon size={20} className="text-gray-400" />}
          </div>
          <span className="truncate max-w-[150px] font-mono text-[10px] text-gray-400 group-hover:text-near-black dark:group-hover:text-white transition-colors">
            {value?.split('/').pop() || '—'}
          </span>
        </div>
      ),
    },
    { 
      key: 'imageType', 
      label: t('media_image_type'), 
      sortable: true,
      render: (v: string) => <Badge variant="secondary" className="uppercase text-[9px] font-bold tracking-widest">{v}</Badge>
    },
    { 
      key: 'carModelName', 
      label: t('media_car_model'), 
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <Car size={14} className="text-gray-400" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v || '—'}</span>
        </div>
      )
    },
    { 
      key: 'isDefault', 
      label: t('media_is_default'), 
      align: 'center' as const,
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'secondary'} className="uppercase text-[9px] tracking-widest font-bold">
          {v ? (
            <span className="flex items-center gap-1.5"><CheckCircle2 size={10} /> {tCommon('yes')}</span>
          ) : (
            <span className="flex items-center gap-1.5"><XCircle size={10} /> {tCommon('no')}</span>
          )}
        </Badge>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof CarImage, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: CarImage) => (
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
              setDeletingMedia(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    }] : []),
  ], [isAdmin, t, tCommon])

  useAdminPage({
    titleKey: 'media_management',
    subtitleKey: 'media_subtitle',
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
            placeholder={t('search_media') || 'Search media...'}
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
            {t('add_media')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={mediaList}
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
        <DialogContent className="sm:max-w-[550px] p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingMedia ? t('edit_media') : t('add_new_media')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400">
              {editingMedia ? t('update_media_info') : t('add_media_subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Image Asset *</Label>
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-neutral-900 border dark:border-neutral-800 p-2">
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill 
                      unoptimized 
                      className="object-contain" 
                    />
                  </div>
                )}
                <div className="relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-300 dark:border-neutral-700 p-8 flex flex-col items-center justify-center gap-3 group-hover:border-brand-red group-hover:bg-brand-red/5 transition-all">
                    <UploadCloud size={32} className="text-gray-400 group-hover:text-brand-red transition-colors" />
                    <p className="text-xs uppercase font-bold tracking-widest text-gray-500 group-hover:text-near-black dark:group-hover:text-white">
                      {formData.image ? formData.image.name : 'Select file or drag & drop'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('media_image_type')} *</Label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t('media_placeholder_type')}
                    value={formData.imageType}
                    onChange={(e) => setFormData({ ...formData, imageType: e.target.value })}
                    className="pl-9 uppercase font-bold h-11 text-[10px]"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('media_car_model')} *</Label>
                <Select
                  value={formData.carModelId?.toString() || ''}
                  onValueChange={(val) => setFormData({ ...formData, carModelId: parseInt(val) })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue placeholder={t('select_model')} />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsList.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()} className="uppercase font-bold text-[10px]">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('media_sort_order')}</Label>
                <div className="relative">
                  <Settings2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    value={formData.sortOrder || ''}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="pl-9 font-mono h-11"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pb-3">
                <Checkbox 
                  id="isDefault" 
                  checked={formData.isDefault} 
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                  className="rounded-none border-gray-300 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                />
                <Label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
                  {t('media_is_default')}
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-[0.2em] h-12 px-12 italic italic font-black shadow-lg">
                {editingMedia ? t('update') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('media_confirm_delete')}
        description={t('media_confirm_delete_msg')}
        itemLabel={deletingMedia?.imageUrl?.split('/').pop()}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingMedia(null)
        }}
        loading={saving}
      />
    </div>
  )
}
