'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, ShieldAlert, Globe, Upload } from 'lucide-react'
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
import { Label } from '@/components/base/ui/label'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

import { brandService, Brand, BrandFormData } from '@/services/brand'
import { authService, getErrorMessage } from '@/services/auth'

export default function BrandsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [brands, setBrands] = useState<Brand[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    country: '',
    logo: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const data = await brandService.findAll(searchKeyword, currentPage - 1, pageSize)
      setBrands(data.content)
      setTotalElements(data.totalElements)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [searchKeyword, currentPage, pageSize])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      setCurrentPage(1)
    }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (brand?: Brand) => {
    if (!isAdmin) {
      toast.error(t('brand_no_permission'))
      return
    }
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        country: brand.country,
        logo: null,
      })
    } else {
      setEditingBrand(null)
      setFormData({ name: '', country: '', logo: null })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error(t('brand_no_permission'))
      return
    }

    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error(t('brand_fill_required'))
      return
    }

    setSaving(true)
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, formData)
        toast.success(t('brand_updated'))
      } else {
        await brandService.create(formData)
        toast.success(t('brand_created'))
      }
      setIsModalOpen(false)
      fetchBrands()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (brand: Brand) => {
    if (!isAdmin) {
      toast.error(t('brand_no_permission'))
      return
    }
    setDeletingBrand(brand)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingBrand || !isAdmin) return

    setSaving(true)
    try {
      await brandService.delete(deletingBrand.id)
      toast.success(t('brand_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingBrand(null)
      fetchBrands()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  useAdminPage({
    titleKey: 'brand_management',
    subtitleKey: 'brand_subtitle',
  })

  const columns = [
    {
      key: 'id',
      label: 'ID',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'name',
      label: t('brand_name'),
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          {(row as Brand).logoUrl && (
            <div className="w-10 h-10 bg-gray-50 dark:bg-neutral-800 rounded-sm p-1 flex items-center justify-center border border-gray-100 dark:border-neutral-700">
              <Image
                src={(row as Brand).logoUrl!}
                alt={value}
                width={32}
                height={32}
                unoptimized
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
          )}
          <span className="font-bold uppercase text-near-black dark:text-white tracking-tight">{value}</span>
        </div>
      ),
    },
    {
      key: 'country',
      label: t('brand_country'),
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Globe size={14} />
          <span>{val}</span>
        </div>
      )
    },
    ...(isAdmin
      ? [
          {
            key: 'actions' as keyof Brand,
            label: t('actions'),
            align: 'right' as const,
            render: (_: any, row: any) => (
              <div className="flex gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenModal(row as Brand)}
                  className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
                  title={t('edit')}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDeleteModal(row as Brand)}
                  className="h-8 w-8 text-gray-400 hover:text-brand-red"
                  title={t('delete')}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="brand-search"
            placeholder={t('search_brands')}
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        {isAdmin && (
          <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            {t('add_brand')}
          </Button>
        )}
      </div>

      {isAuthenticated && !isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-sm border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">{t('brand_no_permission')}</p>
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={brands}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBrand ? t('edit_brand') : t('add_new_brand')}</DialogTitle>
            <DialogDescription>
              {editingBrand ? t('update_brand_info') : t('add_brand_subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brandName" className="text-xs uppercase font-bold tracking-wider">{t('brand_name')}</Label>
              <Input
                id="brandName"
                placeholder={t('brand_placeholder_name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="brandCountry" className="text-xs uppercase font-bold tracking-wider">{t('brand_country')}</Label>
              <Input
                id="brandCountry"
                placeholder={t('brand_placeholder_country')}
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Logo (Brand Mark)</Label>
              <div className="flex items-center gap-4 p-4 border border-dashed rounded-sm bg-gray-50/50 dark:bg-neutral-900/50">
                <div className="w-16 h-16 bg-white dark:bg-neutral-800 border rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                  {formData.logo ? (
                    <Image src={URL.createObjectURL(formData.logo)} alt="Preview" width={64} height={64} className="object-contain" />
                  ) : editingBrand?.logoUrl ? (
                    <Image src={editingBrand.logoUrl} alt="Existing" width={64} height={64} unoptimized className="object-contain" />
                  ) : (
                    <Upload size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Input 
                    id="brandLogo" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                    className="cursor-pointer file:bg-transparent file:border-0 file:text-xs file:font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">SVG or PNG recommended, transparent background</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave} loading={saving}>
              {editingBrand ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('brand_confirm_delete')}
        description={t('brand_confirm_delete_msg')}
        itemLabel={deletingBrand?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={saving}
      />
    </div>
  )
}
