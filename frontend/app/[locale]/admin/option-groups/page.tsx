'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { useAdminPage } from '@/components/admin/admin-page-context'
import { Alert } from '@/components/admin/alert'
import { useTranslations } from 'next-intl';
import { optionGroupService, OptionGroup, OptionGroupFormData } from '@/lib/option-group'
import { optionCategoryService, OptionCategory } from '@/lib/option-category'
import { authService, getErrorMessage } from '@/lib/auth'

export default function OptionGroupsPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [groups, setGroups] = useState<OptionGroup[]>([])
  const [categories, setCategories] = useState<OptionCategory[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<OptionGroup | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<OptionGroupFormData>({
    categoryId: 0,
    name: '',
    displayOrder: 0,
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionGroupService.findAll(searchKeyword, currentPage - 1, pageSize)
      setGroups(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setLoading(false) }
  }, [searchKeyword, currentPage, pageSize])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await optionCategoryService.findAll('', 0, 1000)
      setCategories(data.content)
    } catch (error) { console.error('Failed to fetch categories', error) }
  }, [])

  useEffect(() => { 
    fetchGroups()
    fetchCategories()
  }, [fetchGroups, fetchCategories])

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: OptionGroup) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (item) {
      setEditingGroup(item)
      setFormData({ categoryId: item.categoryId, name: item.name, displayOrder: item.displayOrder || 0 })
    } else {
      setEditingGroup(null)
      setFormData({ categoryId: categories.length > 0 ? categories[0].id : 0, name: '', displayOrder: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    if (!formData.name.trim() || !formData.categoryId) { showAlertMessage(t('fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingGroup) {
        await optionGroupService.update(editingGroup.id, formData)
        showAlertMessage(t('option_updated'), 'success')
      } else {
        await optionGroupService.create(formData)
        showAlertMessage(t('option_created'), 'success')
      }
      setIsModalOpen(false); fetchGroups()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: OptionGroup) => {
    if (!isAdmin) { showAlertMessage(t('no_permission'), 'warning'); return }
    setDeletingGroup(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingGroup || !isAdmin) return
    setSaving(true)
    try {
      await optionGroupService.delete(deletingGroup.id)
      showAlertMessage(t('option_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingGroup(null); fetchGroups()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  useAdminPage({
    titleKey: 'option_groups_management',
    subtitleKey: 'option_groups_subtitle',
    actions: (
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input type="text" placeholder={t('search_options')} value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors w-64" />
        </div>
        {isAdmin && (
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
            {t('add_option_group')}
          </Button>
        )}
      </div>
    ),
  })

  return (
    <>
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-sm border border-modena-yellow/30 bg-modena-yellow/10 dark:bg-modena-yellow/20">
            <ShieldAlert size={20} className="text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('no_permission')}</p>
          </div>
        )}
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-5">
            <p className="text-xs font-medium text-mid-gray dark:text-light-gray-surface uppercase tracking-wider">{t('option_total')}</p>
            <p className="text-2xl font-bold text-near-black dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              { key: 'name', label: t('option_group_name'), sortable: true },
              { key: 'categoryName', label: t('option_group_category'), sortable: true },
              { key: 'displayOrder', label: t('option_display_order'), align: 'center', render: (v: any) => v ?? '—' },
              ...(isAdmin ? [{
                key: 'actions' as keyof OptionGroup, label: t('actions'), align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('edit')}>
                      <Edit2 size={16} className="text-mid-gray" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row) }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors" title={t('delete')}>
                      <Trash2 size={16} className="text-brand-red" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={groups} loading={loading}
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
        title={editingGroup ? t('edit_option_group') : t('add_option_group')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingGroup ? t('update') : t('create')}</Button>
        </>}>
        <div className="space-y-4">
          <FormInput label={t('option_group_name')} placeholder={t('option_placeholder_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-near-black dark:text-light-gray-surface">
              {t('option_group_category')} <span className="text-brand-red">*</span>
            </label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white"
              required
            >
              <option value="" disabled>{t('option_group_category')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <FormInput label={t('option_display_order')} type="number" placeholder={t('option_placeholder_order')}
            value={formData.displayOrder || ''} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('option_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{tCommon('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 dark:bg-brand-red/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{t('option_confirm_delete_msg')}</p>
            {deletingGroup && <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingGroup.name}</p>}
          </div>
        </div>
      </Modal>
    </>
  )
}
