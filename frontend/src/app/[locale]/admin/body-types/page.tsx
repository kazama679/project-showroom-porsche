'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ShieldAlert, Search } from 'lucide-react'
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

import {
  bodyTypeService,
  BodyType,
  BodyTypeFormData,
} from '@/services/body-type'
import { authService, getErrorMessage } from '@/services/auth'

export default function BodyTypesPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [items, setItems] = useState<BodyType[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BodyType | null>(null)
  const [deletingItem, setDeletingItem] = useState<BodyType | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<BodyTypeFormData>({
    name: '',
    description: null,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await bodyTypeService.findAll()
      setItems(data)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleOpenModal = (item?: BodyType) => {
    if (!isAdmin) {
      toast.error(t('no_permission'))
      return
    }
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description ?? null,
      })
    } else {
      setEditingItem(null)
      setFormData({ name: '', description: null })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error(t('no_permission'))
      return
    }
    if (!formData.name.trim()) {
      toast.error(t('fill_required'))
      return
    }

    setSaving(true)
    try {
      if (editingItem) {
        await bodyTypeService.update(editingItem.id, formData)
        toast.success(tCommon('update_success'))
      } else {
        await bodyTypeService.create(formData)
        toast.success(tCommon('create_success'))
      }
      setIsModalOpen(false)
      fetchAll()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDeleteModal = (item: BodyType) => {
    if (!isAdmin) {
      toast.error(t('no_permission'))
      return
    }
    setDeletingItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem || !isAdmin) return
    setSaving(true)
    try {
      await bodyTypeService.delete(deletingItem.id)
      toast.success(tCommon('delete_success'))
      setIsDeleteModalOpen(false)
      setDeletingItem(null)
      fetchAll()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  useAdminPage({
    titleKey: 'body_design_management',
    subtitleKey: 'body_design_subtitle',
  })

  const columns = [
    { key: 'id', label: 'ID', align: 'center' as const, sortable: true },
    { key: 'name', label: t('body_design_name'), sortable: true, render: (v: string) => <span className="font-bold uppercase text-near-black dark:text-white tracking-tight">{v}</span> },
    {
      key: 'description',
      label: t('body_design_description'),
      render: (v: any) => <span className="text-gray-500 text-sm">{v || '—'}</span>,
    },
    ...(isAdmin
      ? [
          {
            key: 'actions' as keyof BodyType,
            label: t('actions'),
            align: 'right' as const,
            render: (_: any, row: any) => (
              <div className="flex gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenModal(row as BodyType)}
                  className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
                  title={t('edit')}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDeleteModal(row as BodyType)}
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
            id="body-type-search"
            placeholder={t('search_body_designs')}
            className="pl-9 w-64"
          />
        </div>
        {isAdmin && (
          <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            {t('add_body_design')}
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
          data={items}
          loading={loading}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('edit_body_design') : t('add_body_design')}
            </DialogTitle>
            <DialogDescription>{t('body_design_subtitle')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="typeName" className="text-xs uppercase font-bold tracking-wider">{t('body_design_name')}</Label>
              <Input
                id="typeName"
                placeholder={t('body_design_name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="typeDesc" className="text-xs uppercase font-bold tracking-wider">{t('body_design_description')}</Label>
              <Input
                id="typeDesc"
                placeholder={t('body_design_description')}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave} loading={saving}>
              {editingItem ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('confirm_delete')}
        description={t('are_you_sure')}
        itemLabel={deletingItem?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={saving}
      />
    </div>
  )
}
