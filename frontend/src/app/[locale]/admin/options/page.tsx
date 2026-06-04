'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, Layers, Hash } from 'lucide-react'
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
import { Label } from '@/components/base/ui/label'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

import { optionCategoryService, OptionCategory, OptionCategoryFormData } from '@/services/option-category'
import { authService, getErrorMessage } from '@/services/auth'

export default function OptionsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [options, setOptions] = useState<OptionCategory[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<OptionCategory | null>(null)
  const [deletingOption, setDeletingOption] = useState<OptionCategory | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<OptionCategoryFormData>({
    name: '',
    displayOrder: 0,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchOptions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionCategoryService.findAll(searchKeyword, currentPage - 1, pageSize)
      setOptions(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  useEffect(() => { fetchOptions() }, [fetchOptions])

  const handleOpenModal = (item?: OptionCategory) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (item) {
      setEditingOption(item)
      setFormData({ name: item.name, displayOrder: item.displayOrder || 0 })
    } else {
      setEditingOption(null)
      setFormData({ name: '', displayOrder: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.name.trim()) { toast.error(t('fill_required')); return }

    setSaving(true)
    try {
      if (editingOption) {
        await optionCategoryService.update(editingOption.id, formData)
        toast.success(t('option_updated'))
      } else {
        await optionCategoryService.create(formData)
        toast.success(t('option_created'))
      }
      setIsModalOpen(false)
      fetchOptions()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingOption || !isAdmin) return
    setSaving(true)
    try {
      await optionCategoryService.delete(deletingOption.id)
      toast.success(t('option_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingOption(null)
      fetchOptions()
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
      key: 'name', 
      label: t('option_name'), 
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-brand-red" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
        </div>
      )
    },
    { 
      key: 'displayOrder', 
      label: t('option_display_order'), 
      align: 'center' as const, 
      render: (v: number) => (
        <Badge variant="secondary" className="font-mono text-eyebrow">
          {v ?? '—'}
        </Badge>
      )
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof OptionCategory, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: OptionCategory) => (
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
              setDeletingOption(row)
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
    titleKey: 'options_management',
    subtitleKey: 'options_subtitle',
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
            placeholder={t('search_options') || 'Search options...'}
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
            {t('add_option')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={options}
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
        <DialogContent className="sm:max-w-modal p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingOption ? t('edit_option') : t('add_new_option')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-porsche-wide text-gray-400">
              {editingOption ? t('update_option_info') : t('add_option_subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_name')} *</Label>
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
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('option_display_order')}</Label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  placeholder={t('option_placeholder_order')}
                  value={formData.displayOrder || ''}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="pl-9 font-mono h-11"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-porsche-wide h-12 px-10 italic font-black shadow-lg">
                {editingOption ? t('update') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('option_confirm_delete')}
        description={t('option_confirm_delete_msg')}
        itemLabel={deletingOption?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingOption(null)
        }}
        loading={saving}
      />
    </div>
  )
}
