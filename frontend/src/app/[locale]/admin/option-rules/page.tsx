'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit2, Trash2, Search, ShieldAlert, Zap, AlertCircle, ArrowRight } from 'lucide-react'
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

import { optionRuleService, OptionRule, OptionRuleFormData } from '@/services/option-rule'
import { optionItemService, OptionItem } from '@/services/option-item'
import { authService, getErrorMessage } from '@/services/auth'

export default function OptionRulesPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [rules, setRules] = useState<OptionRule[]>([])
  const [optionItems, setOptionItems] = useState<OptionItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<OptionRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<OptionRule | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<OptionRuleFormData>({
    sourceOptionId: 0,
    targetOptionId: 0,
    ruleType: 'REQUIRES'
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionRuleService.findAll(searchKeyword, currentPage - 1, pageSize)
      setRules(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchDependencies = useCallback(async () => {
    try {
      const optionsData = await optionItemService.findAll('', 0, 1000)
      setOptionItems(optionsData.content)
    } catch (error) { console.error('Failed to fetch dependencies', error) }
  }, [])

  useEffect(() => { 
    fetchRules()
    fetchDependencies()
  }, [fetchRules, fetchDependencies])

  const handleOpenModal = (item?: OptionRule) => {
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (item) {
      setEditingRule(item)
      setFormData({ sourceOptionId: item.sourceOptionId, targetOptionId: item.targetOptionId, ruleType: item.ruleType })
    } else {
      setEditingRule(null)
      setFormData({ 
        sourceOptionId: optionItems.length > 0 ? optionItems[0].id : 0, 
        targetOptionId: optionItems.length > 1 ? optionItems[1].id : (optionItems.length > 0 ? optionItems[0].id : 0),
        ruleType: 'REQUIRES'
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) { toast.warning(t('no_permission')); return }
    if (!formData.sourceOptionId || !formData.targetOptionId || !formData.ruleType) { 
      toast.error(t('fill_required'))
      return 
    }

    setSaving(true)
    try {
      if (editingRule) {
        await optionRuleService.update(editingRule.id, formData)
        toast.success(t('option_updated'))
      } else {
        await optionRuleService.create(formData)
        toast.success(t('option_created'))
      }
      setIsModalOpen(false)
      fetchRules()
    } catch (error) { toast.error(getErrorMessage(error)) }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!deletingRule || !isAdmin) return
    setSaving(true)
    try {
      await optionRuleService.delete(deletingRule.id)
      toast.success(t('option_deleted'))
      setIsDeleteModalOpen(false)
      setDeletingRule(null)
      fetchRules()
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
      key: 'sourceOptionName', 
      label: t('source_option'), 
      sortable: true,
      render: (v: string) => (
        <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
      )
    },
    { 
      key: 'ruleType', 
      label: t('rule_type'), 
      align: 'center' as const, 
      render: (v: string) => (
        <div className="flex flex-col items-center gap-1">
          {v === 'REQUIRES' ? (
            <Badge variant="success" className="uppercase text-[9px] font-black tracking-widest px-3 py-1 bg-green-500/10 text-green-600 border-none">
              Requires ➕
            </Badge>
          ) : (
            <Badge variant="destructive" className="uppercase text-[9px] font-black tracking-widest px-3 py-1 bg-brand-red/10 text-brand-red border-none">
              Conflicts ⛔
            </Badge>
          )}
          <ArrowRight size={12} className="text-gray-300" />
        </div>
      )
    },
    { 
      key: 'targetOptionName', 
      label: t('target_option'), 
      sortable: true,
      render: (v: string) => (
        <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
      )
    },
    ...(isAdmin ? [{
      key: 'actions' as keyof OptionRule, 
      label: t('actions'), 
      align: 'right' as const,
      render: (_: any, row: OptionRule) => (
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
              setDeletingRule(row)
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
    titleKey: 'option_rules_management',
    subtitleKey: 'option_rules_subtitle',
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
            placeholder={t('search') || 'Search rules...'}
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
            {t('add_option_rule')}
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={rules}
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
        <DialogContent className="sm:max-w-[500px] p-0 rounded-none border-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingRule ? t('edit_option_rule') : t('add_option_rule')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-[0.2em] text-gray-400">
              {editingRule ? t('update_option_info') : t('add_option_rule_subtitle')}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('source_option')} *</Label>
              <Select
                value={formData.sourceOptionId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, sourceOptionId: parseInt(val) })}
              >
                <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                  <SelectValue placeholder={t('source_option')} />
                </SelectTrigger>
                <SelectContent>
                  {optionItems.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()} className="uppercase font-bold text-[10px]">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('rule_type')} *</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={formData.ruleType === 'REQUIRES' ? 'brand' : 'outline'}
                  onClick={() => setFormData({ ...formData, ruleType: 'REQUIRES' })}
                  className="uppercase text-[9px] font-black h-11"
                >
                  <Zap size={14} className="mr-2" />
                  Requires
                </Button>
                <Button
                  type="button"
                  variant={formData.ruleType === 'CONFLICTS' ? 'destructive' : 'outline'}
                  onClick={() => setFormData({ ...formData, ruleType: 'CONFLICTS' })}
                  className="uppercase text-[9px] font-black h-11"
                >
                  <AlertCircle size={14} className="mr-2" />
                  Conflicts
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('target_option')} *</Label>
              <Select
                value={formData.targetOptionId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, targetOptionId: parseInt(val) })}
              >
                <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                  <SelectValue placeholder={t('target_option')} />
                </SelectTrigger>
                <SelectContent>
                  {optionItems.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id.toString()} className="uppercase font-bold text-[10px]">
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-[0.2em] h-12 px-10 italic font-black shadow-lg">
                {editingRule ? t('update') : t('create')}
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
          setDeletingRule(null)
        }}
        loading={saving}
      />
    </div>
  )
}
