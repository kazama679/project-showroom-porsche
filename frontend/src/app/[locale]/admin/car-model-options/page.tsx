'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert, Car, Settings2, CheckCircle2, XCircle } from 'lucide-react'
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

import { carModelOptionService, CarModelOption, CarModelOptionFormData } from '@/services/car-model-option'
import { optionItemService, OptionItem } from '@/services/option-item'
import { carModelService, CarModelItem } from '@/services/car-model'
import { authService, getErrorMessage } from '@/services/auth'

export default function CarModelOptionsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [assignments, setAssignments] = useState<CarModelOption[]>([])
  const [carModels, setCarModels] = useState<CarModelItem[]>([])
  const [optionItems, setOptionItems] = useState<OptionItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<CarModelOption | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<CarModelOption | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<CarModelOptionFormData>({
    carModelId: 0,
    optionItemId: 0,
    isDefault: false
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await carModelOptionService.findAll(searchKeyword, currentPage - 1, pageSize)
      setAssignments(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchDependencies = useCallback(async () => {
    try {
      const [modelsData, optionsData] = await Promise.all([
        carModelService.findAll('', 0, 1000),
        optionItemService.findAll('', 0, 1000)
      ])
      setCarModels(modelsData.content)
      setOptionItems(optionsData.content)
    } catch (error) { console.error('Failed to fetch dependencies', error) }
  }, [])

  useEffect(() => { 
    fetchAssignments()
    fetchDependencies()
  }, [fetchAssignments, fetchDependencies])

  const handleOpenModal = (item?: CarModelOption) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (item) {
      setEditingAssignment(item)
      setFormData({ carModelId: item.carModelId, optionItemId: item.optionItemId, isDefault: item.isDefault || false })
    } else {
      setEditingAssignment(null)
      setFormData({ 
        carModelId: carModels.length > 0 ? carModels[0].id : 0, 
        optionItemId: optionItems.length > 0 ? optionItems[0].id : 0,
        isDefault: false
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.carModelId || !formData.optionItemId) { 
      toast.error(t('fill_required'))
      return 
    }

    setSaving(true)
    try {
      if (editingAssignment) {
        await carModelOptionService.update(editingAssignment.id, formData)
        toast.success(t('option_updated'))
      } else {
        await carModelOptionService.create(formData)
        toast.success(t('option_created'))
      }
      setIsModalOpen(false)
      fetchAssignments()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAssignment || !isAdmin) return
    setSaving(true)
    try {
      await carModelOptionService.delete(deletingAssignment.id)
      toast.success(t('option_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingAssignment(null)
      fetchAssignments()
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
      key: 'carModelName', 
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
      key: 'optionItemName', 
      label: t('option_item_name'), 
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-brand-red" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{val}</span>
        </div>
      )
    },
    { 
      key: 'isDefault', 
      label: 'Default', 
      align: 'center' as const, 
      render: (v: boolean) => (
        <Badge variant={v ? 'success' : 'secondary'} className="uppercase text-micro tracking-widest font-bold">
          {v ? (
            <span className="flex items-center gap-1.5"><CheckCircle2 size={10} /> {tCommon('yes')}</span>
          ) : (
            <span className="flex items-center gap-1.5"><XCircle size={10} /> {tCommon('no')}</span>
          )}
        </Badge>
      )
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof CarModelOption, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: CarModelOption) => (
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
              setDeletingAssignment(row)
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
    titleKey: 'car_model_options_management',
    subtitleKey: 'car_model_options_subtitle',
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
            placeholder={t('search') || 'Search assignment...'}
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
            {t('add_car_model_option')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={assignments}
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
              {editingAssignment ? t('edit_car_model_option') : t('add_car_model_option')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-porsche-wide text-gray-400">
              Assign options items to specific vehicle models
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">
                {t('model_name')} <span className="text-brand-red">*</span>
              </Label>
              <Select
                value={formData.carModelId.toString()}
                onValueChange={(val) => setFormData({ ...formData, carModelId: parseInt(val) })}
              >
                <SelectTrigger className="h-12 font-bold uppercase">
                  <SelectValue placeholder={t('select_model')} />
                </SelectTrigger>
                <SelectContent>
                  {carModels.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()} className="uppercase font-bold text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">
                {t('option_item_name')} <span className="text-brand-red">*</span>
              </Label>
              <Select
                value={formData.optionItemId.toString()}
                onValueChange={(val) => setFormData({ ...formData, optionItemId: parseInt(val) })}
              >
                <SelectTrigger className="h-12 font-bold uppercase">
                  <SelectValue placeholder={t('select_option_item')} />
                </SelectTrigger>
                <SelectContent>
                  {optionItems.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()} className="uppercase font-bold text-xs text-brand-red">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2 pb-2">
              <Checkbox 
                id="isDefault" 
                checked={formData.isDefault} 
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
                className="rounded-none border-gray-300 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
              />
              <Label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
                {t('set_as_default') || 'Set as Default Option'}
              </Label>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-porsche-wide h-12 px-12 italic italic font-black shadow-lg">
                {editingAssignment ? t('update') : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('option_confirm_delete')}
        description={t('option_confirm_delete_msg')}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingAssignment(null)
        }}
        loading={saving}
      />
    </div>
  )
}
