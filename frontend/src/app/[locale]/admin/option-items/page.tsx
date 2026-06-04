'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, ShieldAlert, Layers, Hash, DollarSign, ImageIcon } from 'lucide-react'
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
import { Textarea } from '@/components/base/ui/textarea'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

import { optionItemService, OptionItem, OptionItemFormData } from '@/services/option-item'
import { optionGroupService, OptionGroup } from '@/services/option-group'
import { authService, getErrorMessage } from '@/services/auth'

export default function OptionItemsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [items, setItems] = useState<OptionItem[]>([])
  const [groups, setGroups] = useState<OptionGroup[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OptionItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<OptionItem | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<OptionItemFormData>({
    optionGroupId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: ''
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionItemService.findAll(searchKeyword, currentPage - 1, pageSize)
      setItems(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchGroups = useCallback(async () => {
    try {
      const data = await optionGroupService.findAll('', 0, 1000)
      setGroups(data.content)
    } catch (error) { console.error('Failed to fetch groups', error) }
  }, [])

  useEffect(() => { 
    fetchItems()
    fetchGroups()
  }, [fetchItems, fetchGroups])

  const handleOpenModal = (item?: OptionItem) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (item) {
      setEditingItem(item)
      setFormData({ 
        optionGroupId: item.optionGroupId, 
        name: item.name, 
        description: item.description || '',
        price: item.price || 0,
        imageUrl: item.imageUrl || ''
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        optionGroupId: groups.length > 0 ? groups[0].id : 0, 
        name: '', 
        description: '',
        price: 0,
        imageUrl: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.name.trim() || !formData.optionGroupId) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingItem) {
        await optionItemService.update(editingItem.id, formData)
        toast.success(t('option_updated'))
      } else {
        await optionItemService.create(formData)
        toast.success(t('option_created'))
      }
      setIsModalOpen(false)
      fetchItems()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem || !isAdmin) return
    setSaving(true)
    try {
      await optionItemService.delete(deletingItem.id)
      toast.success(t('option_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingItem(null)
      fetchItems()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const columns = useMemo(() => [
    { 
      key: 'id', 
      label: 'ID', 
      align: 'center' as const,
      render: (v: number) => <span className="font-mono text-eyebrow text-gray-400">#{v}</span>
    },
    {
      key: 'imageUrl',
      label: t('media_image_url'),
      render: (v: string | null) => (
        <div className="w-14 h-10 bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 flex items-center justify-center overflow-hidden">
          {v ? (
            <Image
              src={v}
              alt=""
              width={56}
              height={40}
              unoptimized
              className="w-full h-full object-cover transition-transform hover:scale-110"
            />
          ) : <ImageIcon size={14} className="text-gray-300" />}
        </div>
      ),
    },
    { 
      key: 'name', 
      label: t('option_item_name'), 
      sortable: true,
      render: (v: string) => <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
    },
    { 
      key: 'optionGroupName', 
      label: t('option_item_group'), 
      sortable: true,
      render: (v: string) => <Badge variant="secondary" className="uppercase text-micro font-bold tracking-widest">{v || '—'}</Badge>
    },
    { 
      key: 'price', 
      label: t('option_item_price'), 
      align: 'right' as const,
      render: (v: number) => (
        <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-brand-red">
          {v ? `$${v.toLocaleString()}` : <span className="text-gray-400">FREE</span>}
        </div>
      )
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof OptionItem, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: OptionItem) => (
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
              setDeletingItem(row)
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
    titleKey: 'option_items_management',
    subtitleKey: 'option_items_subtitle',
  })

  return (
    <div className="space-y-6">
      {isAuthenticated && !isAdmin && (
        <div className="flex items-center gap-3 p-4 rounded-none border border-brand-red/30 bg-brand-red/5 text-brand-red">
          <ShieldAlert size={20} className="flex-shrink-0" />
          <p className="text-eyebrow uppercase font-bold tracking-widest">{t('no_permission')}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('search_options') || 'Search items...'}
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
            {t('add_option_item')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={items}
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
        <DialogContent className="sm:max-w-2xl p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingItem ? t('edit_option_item') : t('add_option_item')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-porsche-wide text-gray-400">
              {editingItem ? t('update_option_info') : t('add_option_item_subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_item_name')} *</Label>
                <div className="relative">
                  <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={t('option_placeholder_name')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9 uppercase font-bold h-11"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_item_group')} *</Label>
                <Select
                  value={formData.optionGroupId?.toString() || ''}
                  onValueChange={(val) => setFormData({ ...formData, optionGroupId: parseInt(val) })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-eyebrow">
                    <SelectValue placeholder={t('option_item_group')} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()} className="uppercase font-bold text-eyebrow">
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_item_price')}</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="pl-9 font-mono h-11"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Image Asset URL</Label>
                <div className="relative">
                  <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="https://..."
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="pl-9 h-11 text-eyebrow font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Asset Preview</Label>
              <div className="relative w-full h-32 bg-gray-50 dark:bg-neutral-900 border-2 border-dashed border-light-gray-surface dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                {formData.imageUrl?.trim() ? (
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <ImageIcon size={24} className="mx-auto text-gray-300" />
                    <p className="text-micro uppercase font-bold tracking-widest text-gray-400">No image provided</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_item_description') || 'Description'}</Label>
              <Textarea
                placeholder="Item specification details..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-review-textarea rounded-none resize-none text-xs"
              />
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-porsche-wide h-12 px-10 italic font-black shadow-lg">
                {editingItem ? t('update') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('option_confirm_delete')}
        description={t('option_confirm_delete_msg')}
        itemLabel={deletingItem?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingItem(null)
        }}
        loading={saving}
      />
    </div>
  )
}
