'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'
import { useLanguage } from '@/lib/language-context'
import { optionRuleService, OptionRule, OptionRuleFormData } from '@/lib/option-rule'
import { optionItemService, OptionItem } from '@/lib/option-item'
import { authService, getErrorMessage } from '@/lib/auth'

export default function OptionRulesPage() {
  const { t } = useLanguage()

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

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<OptionRuleFormData>({
    sourceOptionId: 0,
    targetOptionId: 0,
    ruleType: 'REQUIRES'
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionRuleService.findAll(searchKeyword, currentPage - 1, pageSize)
      setRules(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
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

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: OptionRule) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
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

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (!formData.sourceOptionId || !formData.targetOptionId || !formData.ruleType) { 
      showAlertMessage(t('admin.fill_required'), 'error'); 
      return 
    }

    setSaving(true)
    try {
      if (editingRule) {
        await optionRuleService.update(editingRule.id, formData)
        showAlertMessage(t('admin.option_updated'), 'success')
      } else {
        await optionRuleService.create(formData)
        showAlertMessage(t('admin.option_created'), 'success')
      }
      setIsModalOpen(false); fetchRules()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: OptionRule) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setDeletingRule(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingRule || !isAdmin) return
    setSaving(true)
    try {
      await optionRuleService.delete(deletingRule.id)
      showAlertMessage(t('admin.option_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingRule(null); fetchRules()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  return (
    <PageLayout title={t('admin.option_rules_management')} subtitle={t('admin.option_rules_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
            <input type="text" placeholder={t('admin.search')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('admin.add_option_rule')}
            </Button>
          )}
        </div>
      }>
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-sm border border-modena-yellow/30 bg-modena-yellow/10 dark:bg-modena-yellow/20">
            <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('admin.no_permission')}</p>
          </div>
        )}
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-5">
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">{t('admin.option_total')}</p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'sourceOptionName', label: t('admin.source_option'), sortable: true },
              { key: 'ruleType', label: t('admin.rule_type'), align: 'center', render: (v: any) => v === 'REQUIRES' ? 'Requires ➕' : 'Conflicts ⛔' },
              { key: 'targetOptionName', label: t('admin.target_option'), sortable: true },
              ...(isAdmin ? [{
                key: 'actions' as keyof OptionRule, label: t('admin.actions'), align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('admin.edit')}>
                      <Edit2 size={16} className="text-mid-gray" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('admin.delete')}>
                      <Trash2 size={16} className="text-brand-red" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={rules} loading={loading}
            pagination={{
              pageSize,
              currentPage,
              total: totalElements,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize
            }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingRule ? t('admin.edit_option_rule') : t('admin.add_option_rule')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingRule ? t('admin.update') : t('admin.create')}</Button>
        </>}>
        <div className="space-y-4">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">
              {t('admin.source_option')} <span className="text-brand-red">*</span>
            </label>
            <select
              value={formData.sourceOptionId || ''}
              onChange={(e) => setFormData({ ...formData, sourceOptionId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white"
              required
            >
              <option value="" disabled>{t('admin.source_option')}</option>
              {optionItems.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">
              {t('admin.rule_type')} <span className="text-brand-red">*</span>
            </label>
            <select
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
              className="w-full px-4 py-2 border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white"
              required
            >
              <option value="REQUIRES">Requires</option>
              <option value="CONFLICTS">Conflicts</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">
              {t('admin.target_option')} <span className="text-brand-red">*</span>
            </label>
            <select
              value={formData.targetOptionId || ''}
              onChange={(e) => setFormData({ ...formData, targetOptionId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white"
              required
            >
              <option value="" disabled>{t('admin.target_option')}</option>
              {optionItems.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('admin.option_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('admin.delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('admin.option_confirm_delete_msg')}</p>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
