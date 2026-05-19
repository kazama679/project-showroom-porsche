'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, Search, AlertTriangle, ShieldAlert } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'
import { useLanguage } from '@/lib/language-context'
import { optionItemService, OptionItem, OptionItemFormData } from '@/lib/option-item'
import { optionGroupService, OptionGroup } from '@/lib/option-group'
import { authService, getErrorMessage } from '@/lib/auth'

export default function OptionItemsPage() {
  const { t } = useLanguage()

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

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  const [formData, setFormData] = useState<OptionItemFormData>({
    optionGroupId: 0,
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isDefault: false
  })

  const isAdmin = authService.isAdmin()
  const isAuthenticated = authService.isAuthenticated()

  const showAlertMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message); setAlertType(type); setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
  }

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await optionItemService.findAll(searchKeyword, currentPage - 1, pageSize)
      setItems(data.content)
      setTotalElements(data.totalElements)
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
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

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => { setCurrentPage(1) }, 400)
    setSearchTimeout(timeout)
  }

  const handleOpenModal = (item?: OptionItem) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (item) {
      setEditingItem(item)
      setFormData({ 
        optionGroupId: item.optionGroupId, 
        name: item.name, 
        description: item.description || '',
        price: item.price || 0,
        imageUrl: item.imageUrl || '',
        isDefault: item.isDefault || false
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        optionGroupId: groups.length > 0 ? groups[0].id : 0, 
        name: '', 
        description: '',
        price: 0,
        imageUrl: '',
        isDefault: false
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    if (!formData.name.trim() || !formData.optionGroupId) { showAlertMessage(t('admin.fill_required'), 'error'); return }

    setSaving(true)
    try {
      if (editingItem) {
        await optionItemService.update(editingItem.id, formData)
        showAlertMessage(t('admin.option_updated'), 'success')
      } else {
        await optionItemService.create(formData)
        showAlertMessage(t('admin.option_created'), 'success')
      }
      setIsModalOpen(false); fetchItems()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  const handleOpenDeleteModal = (item: OptionItem) => {
    if (!isAdmin) { showAlertMessage(t('admin.no_permission'), 'warning'); return }
    setDeletingItem(item); setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem || !isAdmin) return
    setSaving(true)
    try {
      await optionItemService.delete(deletingItem.id)
      showAlertMessage(t('admin.option_deleted'), 'success')
      setIsDeleteModalOpen(false); setDeletingItem(null); fetchItems()
    } catch (error) { showAlertMessage(getErrorMessage(error), 'error') }
    finally { setSaving(false) }
  }

  return (
    <PageLayout title={t('admin.option_items_management')} subtitle={t('admin.option_items_subtitle')}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
            <input type="text" placeholder={t('admin.search_options')} value={searchKeyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white placeholder-[#8F8F8F] outline-none focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] transition-colors w-64" />
          </div>
          {isAdmin && (
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => handleOpenModal()}>
              {t('admin.add_option_item')}
            </Button>
          )}
        </div>
      }>
      <div className="space-y-6">
        {isAuthenticated && !isAdmin && (
          <div className="flex items-center gap-3 p-4 rounded-[2px] border border-[#F6E500]/30 bg-[#F6E500]/10 dark:bg-[#F6E500]/20">
            <ShieldAlert size={20} className="text-[#B8A500] flex-shrink-0" />
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{t('admin.no_permission')}</p>
          </div>
        )}
        {showAlert && <Alert type={alertType} message={alertMessage} onClose={() => setShowAlert(false)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-5">
            <p className="text-xs font-medium text-[#8F8F8F] dark:text-[#D2D2D2] uppercase tracking-wider">{t('admin.option_total')}</p>
            <p className="text-2xl font-bold text-[#181818] dark:text-white mt-2">{totalElements}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', align: 'center', sortable: true },
              {
                key: 'imageUrl',
                label: t('admin.media_image_url'),
                align: 'center',
                render: (v: string | null) =>
                  v ? (
                    <Image
                      src={v}
                      alt=""
                      width={56}
                      height={40}
                      unoptimized
                      className="object-cover rounded"
                    />
                  ) : (
                    '—'
                  ),
              },
              { key: 'name', label: t('admin.option_item_name'), sortable: true },
              { key: 'optionGroupName', label: t('admin.option_item_group'), sortable: true },
              { key: 'price', label: t('admin.option_item_price'), render: (v: any) => v ? `$${v.toLocaleString()}` : '—' },
              { key: 'isDefault', label: 'Default', align: 'center', render: (v: any) => v ? t('admin.yes') : t('admin.no') },
              ...(isAdmin ? [{
                key: 'actions' as keyof OptionItem, label: t('admin.actions'), align: 'center' as const,
                render: (value: any, row: any) => (
                  <div className="flex gap-2 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.edit')}>
                      <Edit2 size={16} className="text-[#8F8F8F]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row) }}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors" title={t('admin.delete')}>
                      <Trash2 size={16} className="text-[#DA291C]" />
                    </button>
                  </div>
                ),
              }] : []),
            ]}
            data={items} loading={loading}
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
        title={editingItem ? t('admin.edit_option_item') : t('admin.add_option_item')}
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>{editingItem ? t('admin.update') : t('admin.create')}</Button>
        </>}>
        <div className="space-y-4">
          <FormInput label={t('admin.option_item_name')} value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#181818] dark:text-[#D2D2D2]">
              {t('admin.option_item_group')} <span className="text-[#DA291C]">*</span>
            </label>
            <select
              value={formData.optionGroupId || ''}
              onChange={(e) => setFormData({ ...formData, optionGroupId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-[#D2D2D2] dark:border-[#404040] rounded-[2px] bg-white dark:bg-[#303030] text-[#181818] dark:text-white"
              required
            >
              <option value="" disabled>{t('admin.option_item_group')}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <FormInput label={t('admin.option_item_price')} type="number"
            value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />

          <FormInput label="Image URL" value={formData.imageUrl || ''}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
          {formData.imageUrl?.trim() && (
            <div className="relative w-full h-32 rounded-[2px] overflow-hidden bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              <Image
                src={formData.imageUrl}
                alt="Option preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isDefault" checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-[#DA291C] rounded-[2px] border-[#D2D2D2] focus:ring-[#DA291C]" />
            <label htmlFor="isDefault" className="text-sm font-medium text-[#181818] dark:text-[#D2D2D2]">
              Set as Default Option
            </label>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('admin.option_confirm_delete')} size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={saving}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>{t('admin.delete')}</Button>
        </>}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-[#DA291C]/10 dark:bg-[#DA291C]/20 flex-shrink-0">
            <AlertTriangle size={24} className="text-[#DA291C]" />
          </div>
          <div>
            <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{t('admin.option_confirm_delete_msg')}</p>
            {deletingItem && <p className="text-sm font-semibold text-[#181818] dark:text-white mt-2">{deletingItem.name}</p>}
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
