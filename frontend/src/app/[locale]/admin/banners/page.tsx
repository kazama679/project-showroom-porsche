'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, Video, Image, LayoutPanelLeft, MonitorPlay, UserCheck, ShieldAlert } from 'lucide-react'
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
import { Badge } from '@/components/base/ui/badge'
import { Switch } from '@/components/base/ui/switch'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { homeBannerService, HomeBannerItem, HomeBannerFormData } from '@/services/home-banner'
import { carModelService, CarModelItem } from '@/services/car-model'
import { authService, getErrorMessage } from '@/services/auth'

export default function BannersPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [banners, setBanners] = useState<HomeBannerItem[]>([])
  const [carModels, setCarModels] = useState<CarModelItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HomeBannerItem | null>(null)
  const [deletingBanner, setDeletingBanner] = useState<HomeBannerItem | null>(null)
  const [saving, setSaving] = useState(false)

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

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const typeParam = searchType === 'all' ? undefined : (searchType as any)
      const data = await homeBannerService.findAll(searchKeyword, currentPage - 1, pageSize, typeParam)
      setBanners(data.content)
      setTotalElements(data.totalElements)
    } catch (error) {
      toast.error(getErrorMessage(error))
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

  const handleOpenModal = (item?: HomeBannerItem) => {
    if (!isAdmin) {
      toast.warning(t('no_permission'))
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
      toast.warning(t('no_permission'))
      return
    }
    if (!formData.title.trim()) {
      toast.error(t('fill_required'))
      return
    }

    setSaving(true)
    try {
      if (editingBanner) {
        await homeBannerService.update(editingBanner.id, formData)
        toast.success(tCommon('update_success'))
      } else {
        await homeBannerService.create(formData)
        toast.success(tCommon('create_success'))
      }
      setIsModalOpen(false)
      fetchBanners()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingBanner || !isAdmin) return
    setSaving(true)
    try {
      await homeBannerService.delete(deletingBanner.id)
      toast.success(tCommon('delete_success'))
      setIsDeleteModalOpen(false)
      setDeletingBanner(null)
      fetchBanners()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  useAdminPage({
    titleKey: 'banners',
    subtitleKey: 'banners_subtitle',
  })

  const columns = [
    {
      key: 'id',
      label: 'ID',
      align: 'center' as const,
      sortable: true,
      render: (v: any) => <span className="font-mono text-eyebrow text-gray-400">#{v}</span>
    },
    {
      key: 'title',
      label: t('banner_title'),
      sortable: true,
      render: (v: string) => <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
    },
    {
      key: 'type',
      label: t('banner_type'),
      render: (v: string) => (
        <div className="flex items-center gap-2">
          {v === 'HERO' ? (
            <Badge variant="default" className="gap-1.5 py-0.5 rounded-none font-bold tracking-tighter">
              <MonitorPlay size={10} />
              HERO
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 py-0.5 rounded-none font-bold tracking-tighter border-black dark:border-white">
              <LayoutPanelLeft size={10} />
              CARD
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'carModelName',
      label: t('banner_car_model'),
      render: (v: string) => v ? (
        <Badge variant="secondary" className="font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
          {v}
        </Badge>
      ) : '—'
    },
    {
      key: 'displayOrder',
      label: t('banner_display_order'),
      align: 'center' as const,
      render: (v: number) => <span className="font-bold text-brand-red">{v}</span>
    },
    {
      key: 'isActive',
      label: t('status'),
      align: 'center' as const,
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'destructive'} className="uppercase text-micro tracking-widest font-bold">
          {v ? t('active') : t('inactive')}
        </Badge>
      ),
    },
    ...(isAdmin ? [{
      key: 'actions' as any,
      label: t('actions'),
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-1 justify-end">
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
              setDeletingBanner(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-6">
      {!isAdmin && isAuthenticated && (
        <div className="flex items-center gap-3 p-4 bg-brand-red/5 border border-brand-red/10 rounded-sm">
          <ShieldAlert size={20} className="text-brand-red" />
          <p className="text-sm font-medium text-brand-red italic">{t('no_permission')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('search_banners')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-select-compact h-10">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="HERO">Hero Banner</SelectItem>
              <SelectItem value="CARD">Featured Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <Button variant="brand" onClick={() => handleOpenModal()} className="h-10 uppercase tracking-widest text-xs font-bold w-full sm:w-auto">
            <Plus size={16} className="mr-2" />
            {t('add_banner')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
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

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="uppercase tracking-tighter text-2xl font-black italic">
              {editingBanner ? t('edit_banner') : t('add_banner')}
            </DialogTitle>
            <DialogDescription className="italic text-gray-400">
              {editingBanner ? 'Update homepage banner details' : 'Add new homepage banner'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6 font-porsche">
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Banner Title</Label>
              <Input
                placeholder="e.g. Cayenne S E-Hybrid."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="font-bold uppercase h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Banner Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HERO">Hero Banner (Full Screen)</SelectItem>
                    <SelectItem value="CARD">Featured Card (Small)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Target Car Model</Label>
                <Select 
                  value={formData.carModelId?.toString() || ''} 
                  onValueChange={(v) => setFormData({ ...formData, carModelId: v ? parseInt(v) : null })}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder={t('select_car_model')} /></SelectTrigger>
                  <SelectContent>
                    {carModels.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">
                {formData.type === 'HERO' ? 'Video Path / Stream URL' : 'Image URL'}
              </Label>
              <div className="relative">
                {formData.type === 'HERO' ? (
                  <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                ) : (
                  <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <Input
                  className="pl-10 h-11 font-mono text-xs"
                  placeholder={formData.type === 'HERO' ? '/home/porsche.mp4' : 'https://example.com/image.jpg'}
                  value={formData.type === 'HERO' ? formData.videoUrl || '' : formData.imageUrl || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [formData.type === 'HERO' ? 'videoUrl' : 'imageUrl']: e.target.value 
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-center">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                  className="h-11 font-bold italic w-24"
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Switch 
                  id="banner-active" 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="banner-active" className="text-eyebrow uppercase font-bold tracking-porsche-wide cursor-pointer">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs tracking-widest font-bold">
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave} loading={saving} className="uppercase text-xs tracking-widest font-bold h-11 px-8">
              {editingBanner ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('banner_confirm_delete')}
        description={t('banner_confirm_delete_msg')}
        itemLabel={deletingBanner?.title}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={saving}
      />
    </div>
  )
}
