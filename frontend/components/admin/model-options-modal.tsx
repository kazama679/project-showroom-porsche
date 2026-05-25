'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/admin/modal'
import { Button } from '@/components/admin/button'
import { CarModelItem } from '@/lib/car-model'
import { carModelOptionService, CarModelOption } from '@/lib/car-model-option'
import { optionItemService, OptionItem } from '@/lib/option-item'
import { getErrorMessage } from '@/lib/auth'

interface ModelOptionsModalProps {
  isOpen: boolean
  model: CarModelItem | null
  onClose: () => void
  onNotify: (message: string, type: 'success' | 'error' | 'warning') => void
  labels: {
    title: string
    assignedTitle: string
    addTitle: string
    searchAssigned: string
    searchOptions: string
    searchHint: string
    noAssigned: string
    noResults: string
    add: string
    addAsDefault: string
    delete: string
    cancel: string
    confirmDelete: string
    confirmDeleteMsg: string
    optionAdded: string
    optionDeleted: string
    alreadyAssigned: string
    total: string
    setDefault: string
    defaultLabel: string
    defaultUpdated: string
  }
}

export function ModelOptionsModal({ isOpen, model, onClose, onNotify, labels }: ModelOptionsModalProps) {
  const [assigned, setAssigned] = useState<CarModelOption[]>([])
  const [assignedTotal, setAssignedTotal] = useState(0)
  const [assignedPage, setAssignedPage] = useState(1)
  const [assignedSearch, setAssignedSearch] = useState('')
  const [assignedLoading, setAssignedLoading] = useState(false)

  const [addSearch, setAddSearch] = useState('')
  const [addResults, setAddResults] = useState<OptionItem[]>([])
  const [addTotal, setAddTotal] = useState(0)
  const [addPage, setAddPage] = useState(1)
  const [addLoading, setAddLoading] = useState(false)

  const [saving, setSaving] = useState(false)
  const [deletingOption, setDeletingOption] = useState<CarModelOption | null>(null)
  const [assignedOptionIds, setAssignedOptionIds] = useState<Set<number>>(new Set())

  const [assignedPageSize, setAssignedPageSize] = useState(10)
  const [pageInput, setPageInput] = useState('1')
  const addPageSize = 15

  useEffect(() => {
    setPageInput(assignedPage.toString())
  }, [assignedPage])

  const refreshAssignedIds = useCallback(async () => {
    if (!model) return
    try {
      const ids = new Set<number>()
      let page = 0
      const size = 200
      while (true) {
        const data = await carModelOptionService.findByCarModelId(model.id, '', page, size)
        data.content.forEach((a) => ids.add(a.optionItemId))
        if (data.content.length < size || ids.size >= data.totalElements) break
        page += 1
      }
      setAssignedOptionIds(ids)
    } catch {
      /* ignore */
    }
  }, [model])

  const fetchAssigned = useCallback(async () => {
    if (!model) return
    setAssignedLoading(true)
    try {
      const data = await carModelOptionService.findByCarModelId(
        model.id,
        assignedSearch,
        assignedPage - 1,
        assignedPageSize
      )
      setAssigned(data.content)
      setAssignedTotal(data.totalElements)
    } catch (error) {
      onNotify(getErrorMessage(error), 'error')
    } finally {
      setAssignedLoading(false)
    }
  }, [model, assignedSearch, assignedPage, assignedPageSize, onNotify])

  const fetchAddResults = useCallback(async () => {
    if (!model) return
    const q = addSearch.trim()
    if (q.length < 2) {
      setAddResults([])
      setAddTotal(0)
      return
    }
    setAddLoading(true)
    try {
      const data = await optionItemService.findAll(q, addPage - 1, addPageSize)
      setAddResults(data.content)
      setAddTotal(data.totalElements)
    } catch (error) {
      onNotify(getErrorMessage(error), 'error')
    } finally {
      setAddLoading(false)
    }
  }, [model, addSearch, addPage, onNotify])

  useEffect(() => {
    if (!isOpen || !model) return
    setAssignedPage(1)
    setAssignedSearch('')
    setAddSearch('')
    setAddPage(1)
    setAddResults([])
    setDeletingOption(null)
    refreshAssignedIds()
  }, [isOpen, model, refreshAssignedIds])

  useEffect(() => {
    if (!isOpen || !model) return
    const t = setTimeout(() => fetchAssigned(), 300)
    return () => clearTimeout(t)
  }, [isOpen, model, fetchAssigned])

  useEffect(() => {
    if (!isOpen || !model) return
    const t = setTimeout(() => fetchAddResults(), 400)
    return () => clearTimeout(t)
  }, [isOpen, model, fetchAddResults])

  const handleAddOption = async (optionItem: OptionItem, isDefault: boolean = false) => {
    if (!model) return
    if (assignedOptionIds.has(optionItem.id)) {
      onNotify(labels.alreadyAssigned, 'warning')
      return
    }
    setSaving(true)
    try {
      await carModelOptionService.create({ 
        carModelId: model.id, 
        optionItemId: optionItem.id, 
        isDefault 
      })
      onNotify(labels.optionAdded, 'success')
      await fetchAssigned()
      await refreshAssignedIds()
    } catch (error) {
      onNotify(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingOption) return
    setSaving(true)
    try {
      await carModelOptionService.delete(deletingOption.id)
      onNotify(labels.optionDeleted, 'success')
      setDeletingOption(null)
      await fetchAssigned()
      await refreshAssignedIds()
    } catch (error) {
      onNotify(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDefault = async (row: CarModelOption) => {
    if (!model) return
    setSaving(true)
    try {
      await carModelOptionService.update(row.id, {
        carModelId: model.id,
        optionItemId: row.optionItemId,
        isDefault: !row.isDefault,
      })
      onNotify(labels.defaultUpdated, 'success')
      await fetchAssigned()
    } catch (error) {
      onNotify(getErrorMessage(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  if (!model) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${labels.title} — ${model.name}`}
        size="xl"
        footer={
          <Button variant="secondary" onClick={onClose}>
            {labels.cancel}
          </Button>
        }
      >
        <div className="space-y-8">
          {/* Assigned options */}
          <section>
            <h4 className="text-sm font-semibold text-near-black dark:text-white mb-3">{labels.assignedTitle}</h4>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
              <input
                type="text"
                value={assignedSearch}
                onChange={(e) => {
                  setAssignedSearch(e.target.value)
                  setAssignedPage(1)
                }}
                placeholder={labels.searchAssigned}
                className="w-full pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              />
            </div>

            <div className="border border-light-gray-surface dark:border-neutral-700 rounded-sm overflow-hidden">
              {assignedLoading ? (
                <p className="p-4 text-sm text-mid-gray text-center">...</p>
              ) : assigned.length === 0 ? (
                <p className="p-4 text-sm text-mid-gray text-center">{labels.noAssigned}</p>
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-[240px] overflow-y-auto">
                  {assigned.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-700/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-near-black dark:text-white truncate">{row.optionItemName}</p>
                        <p className="text-xs text-mid-gray">ID: {row.optionItemId}</p>
                      </div>
                      {/* isDefault toggle */}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleDefault(row)}
                        title={labels.setDefault}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors border shrink-0 ${
                          row.isDefault
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-white dark:bg-dark-surface border-light-gray-surface dark:border-neutral-700 text-mid-gray hover:border-brand-red hover:text-brand-red'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className={`w-2 h-2 rounded-full ${row.isDefault ? 'bg-white' : 'bg-light-gray-surface'}`} />
                        {row.isDefault ? labels.defaultLabel : labels.setDefault}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingOption(row)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded shrink-0"
                        title={labels.delete}
                      >
                        <Trash2 size={16} className="text-brand-red" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {assignedTotal > 0 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-sm text-mid-gray dark:text-neutral-400 select-none">
                {/* Left Side: Total and page size selector */}
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {labels.total}: {assignedTotal}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Show:</span>
                    <select
                      value={assignedPageSize}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value)
                        setAssignedPageSize(newSize)
                        setAssignedPage(1)
                      }}
                      className="h-8 px-2 py-1 bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-700 rounded text-xs text-near-black dark:text-white outline-none cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                    >
                      <option value="10" className="bg-white dark:bg-dark-surface">10</option>
                      <option value="20" className="bg-white dark:bg-dark-surface">20</option>
                      <option value="100" className="bg-white dark:bg-dark-surface">100</option>
                    </select>
                  </div>
                </div>
                
                {/* Right Side: Page navigation controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={assignedPage <= 1}
                    onClick={() => setAssignedPage((p) => p - 1)}
                    className="w-8 h-8 flex items-center justify-center border border-light-gray-surface dark:border-neutral-700 rounded bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-neutral-700 text-near-black dark:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <div className="flex items-center gap-1.5 h-8">
                    <span>Page</span>
                    <input
                      type="number"
                      min="1"
                      max={Math.ceil(assignedTotal / assignedPageSize)}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      onBlur={() => {
                        let p = parseInt(pageInput)
                        const maxPage = Math.ceil(assignedTotal / assignedPageSize) || 1
                        if (isNaN(p) || p < 1) p = 1
                        if (p > maxPage) p = maxPage
                        setAssignedPage(p)
                        setPageInput(p.toString())
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          let p = parseInt(pageInput)
                          const maxPage = Math.ceil(assignedTotal / assignedPageSize) || 1
                          if (isNaN(p) || p < 1) p = 1
                          if (p > maxPage) p = maxPage
                          setAssignedPage(p)
                          setPageInput(p.toString())
                          e.currentTarget.blur()
                        }
                      }}
                      className="w-12 h-8 text-center bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-700 rounded py-1 text-xs text-near-black dark:text-white focus:border-black dark:focus:border-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                    />
                    <span>/ {Math.ceil(assignedTotal / assignedPageSize)}</span>
                  </div>
                  <button
                    type="button"
                    disabled={assignedPage >= Math.ceil(assignedTotal / assignedPageSize)}
                    onClick={() => setAssignedPage((p) => p + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-light-gray-surface dark:border-neutral-700 rounded bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-neutral-700 text-near-black dark:text-white transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Add option via search */}
          <section>
            <h4 className="text-sm font-semibold text-near-black dark:text-white mb-3">{labels.addTitle}</h4>
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
              <input
                type="text"
                value={addSearch}
                onChange={(e) => {
                  setAddSearch(e.target.value)
                  setAddPage(1)
                }}
                placeholder={labels.searchOptions}
                className="w-full pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <p className="text-xs text-mid-gray mb-3">{labels.searchHint}</p>

            <div className="border border-light-gray-surface dark:border-neutral-700 rounded-sm overflow-hidden">
              {addSearch.trim().length < 2 ? (
                <p className="p-4 text-sm text-mid-gray text-center">{labels.searchHint}</p>
              ) : addLoading ? (
                <p className="p-4 text-sm text-mid-gray text-center">...</p>
              ) : addResults.length === 0 ? (
                <p className="p-4 text-sm text-mid-gray text-center">{labels.noResults}</p>
              ) : (
                <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 max-h-[280px] overflow-y-auto">
                  {addResults.map((opt) => {
                    const isAssigned = assignedOptionIds.has(opt.id)
                    return (
                      <li
                        key={opt.id}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-700/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-near-black dark:text-white truncate">{opt.name}</p>
                          <p className="text-xs text-mid-gray truncate">
                            {opt.optionGroupName} · {formatPrice(opt.price)} · ID: {opt.id}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus size={14} />}
                            onClick={() => handleAddOption(opt, false)}
                            disabled={saving || isAssigned}
                          >
                            {isAssigned ? '✓' : labels.add}
                          </Button>
                          {!isAssigned && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAddOption(opt, true)}
                              disabled={saving}
                              className="!bg-brand-red/5 !text-brand-red !border-brand-red/20 hover:!bg-brand-red hover:!text-white"
                            >
                              {labels.addAsDefault}
                            </Button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {addSearch.trim().length >= 2 && addTotal > addPageSize && (
              <div className="flex items-center justify-between mt-2 text-xs text-mid-gray">
                <span>
                  {labels.total}: {addTotal}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={addPage <= 1}
                    onClick={() => setAddPage((p) => p - 1)}
                    className="px-2 py-1 border rounded disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span>
                    {addPage} / {Math.ceil(addTotal / addPageSize)}
                  </span>
                  <button
                    type="button"
                    disabled={addPage >= Math.ceil(addTotal / addPageSize)}
                    onClick={() => setAddPage((p) => p + 1)}
                    className="px-2 py-1 border rounded disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </Modal>

      <Modal
        isOpen={!!deletingOption}
        onClose={() => setDeletingOption(null)}
        title={labels.confirmDelete}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingOption(null)} disabled={saving}>
              {labels.cancel}
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={saving}>
              {labels.delete}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-brand-red/10 flex-shrink-0">
            <AlertTriangle size={24} className="text-brand-red" />
          </div>
          <div>
            <p className="text-sm text-near-black dark:text-light-gray-surface">{labels.confirmDeleteMsg}</p>
            {deletingOption && (
              <p className="text-sm font-semibold text-near-black dark:text-white mt-2">{deletingOption.optionItemName}</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
