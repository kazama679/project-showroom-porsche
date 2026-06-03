'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, X, Eye, Clock, AlertCircle, Car, DollarSign, MapPin, Phone, Mail, Calendar, ShieldCheck, Tag, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

import { vehicleListingApi, VehicleListingResponse } from '@/services/vehicle-listing-api'
import { Button } from '@/components/base/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/base/ui/dialog'
import { Badge } from '@/components/base/ui/badge'
import { Textarea } from '@/components/base/ui/textarea'
import { DataTable } from '@/components/base/admin/data-table'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Label } from '@/components/base/ui/label'

export default function AdminVehicleListingsPage() {
  const t = useTranslations('adminUsedCars')
  const tAdmin = useTranslations('admin')
  const tCommon = useTranslations('common')
  
  const [listings, setListings] = useState<VehicleListingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  
  const [selectedListing, setSelectedListing] = useState<VehicleListingResponse | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)

  const fetchListings = async () => {
    try {
      setLoading(true)
      const data = await vehicleListingApi.getAllListings(statusFilter)
      setListings(data)
    } catch (error) {
      console.error(error)
      toast.error(t('approve_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [statusFilter])

  const handleApprove = async () => {
    if (!selectedListing) return
    
    try {
      setIsProcessing(true)
      await vehicleListingApi.updateListingStatus(selectedListing.id, 'APPROVED')
      toast.success(t('approve_success'))
      setIsApproveModalOpen(false)
      setSelectedListing(null)
      fetchListings()
    } catch (error) {
      toast.error(t('approve_failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedListing || !rejectReason.trim()) {
      toast.error(t('reject_reason_req'))
      return
    }

    try {
      setIsProcessing(true)
      await vehicleListingApi.updateListingStatus(selectedListing.id, 'REJECTED', rejectReason)
      toast.success(t('reject_success'))
      setIsRejectModalOpen(false)
      setSelectedListing(null)
      setRejectReason('')
      fetchListings()
    } catch (error) {
      toast.error(t('reject_failed'))
    } finally {
      setIsProcessing(false)
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'PENDING': return t('status_pending')
      case 'APPROVED': return t('status_approved')
      case 'REJECTED': return t('status_rejected')
      case 'SOLD': return t('status_sold')
      default: return status
    }
  }
  
  const renderBool = (val?: boolean) => {
    if (val === undefined || val === null) return '-'
    return val ? t('yes') : t('no')
  }

  const columns = [
    {
      key: 'id',
      label: t('table_id'),
      render: (val: number) => <span className="font-mono text-[10px] text-gray-400">#{val}</span>,
    },
    {
      key: 'vehicle',
      label: t('table_vehicle'),
      render: (_: any, row: VehicleListingResponse) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-tight text-near-black dark:text-white">
            {row.make} {row.model}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider transition-colors duration-300">
            {row.trimLevel} • {row.modelYear} • {row.mileage?.toLocaleString()} KM
          </span>
        </div>
      ),
    },
    {
      key: 'vin',
      label: t('table_vin'),
      render: (val: string) => <span className="font-mono text-[10px] uppercase text-gray-400">{val}</span>,
    },
    {
      key: 'askingPrice',
      label: t('table_price'),
      render: (val: number) => <span className="font-bold text-near-black dark:text-white">${val?.toLocaleString()}</span>,
    },
    {
      key: 'status',
      label: t('table_status'),
      align: 'center' as const,
      render: (val: string) => {
        const variantMap: Record<string, any> = {
          PENDING: 'warning',
          APPROVED: 'success',
          REJECTED: 'destructive',
          SOLD: 'secondary',
        }
        return (
          <Badge variant={variantMap[val] || 'default'} className="uppercase text-[9px] tracking-widest font-bold">
            {getStatusLabel(val)}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: t('table_actions'),
      align: 'right' as const,
      render: (_: any, row: VehicleListingResponse) => (
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 uppercase tracking-widest text-[10px] font-bold border-gray-200 dark:border-neutral-800"
          onClick={() => setSelectedListing(row)}
        >
          <Eye size={14} className="mr-2" /> {t('view_details')}
        </Button>
      ),
    },
  ]

  useAdminPage({
    titleKey: 'vehicle_listings_title',
    subtitleKey: 'vehicle_listings_subtitle',
  })

  return (
    <div className="space-y-6">
      {/* Filters Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="uppercase tracking-widest px-4 h-9 text-[10px] font-bold"
            >
              {status ? getStatusLabel(status) : t('filter_all')}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 h-9 border-l border-gray-100 dark:border-neutral-800 ml-auto bg-gray-50 dark:bg-neutral-900 rounded-sm">
          <Tag size={12} className="text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {t('total_listings')}: <span className="text-near-black dark:text-white ml-1">{listings.length}</span>
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable 
          columns={columns} 
          data={listings} 
          loading={loading}
          pagination={{
            currentPage: 1,
            pageSize: 20,
            total: listings.length,
            onPageChange: () => {},
          }}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedListing && !isRejectModalOpen && !isApproveModalOpen} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 rounded-none border-none">
          {selectedListing && (
            <div className="flex flex-col h-full font-porsche">
              <div className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Badge variant={selectedListing.status === 'APPROVED' ? 'success' : selectedListing.status === 'PENDING' ? 'warning' : 'destructive'} className="rounded-none uppercase tracking-[0.2em] text-[9px] font-bold py-1">
                      {selectedListing.status}
                    </Badge>
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">VIN: {selectedListing.vin}</span>
                  </div>
                  <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic text-near-black dark:text-white">
                    {selectedListing.make} {selectedListing.model} {selectedListing.trimLevel}
                  </DialogTitle>
                  <DialogDescription className="text-xs uppercase font-bold text-gray-500 tracking-widest">
                    #{selectedListing.id} • {selectedListing.modelYear} • {selectedListing.mileage?.toLocaleString()} KM
                  </DialogDescription>
                </div>
              </div>

              <div className="p-8 space-y-10">
                {selectedListing.status === 'PENDING' && (
                  <div className="bg-brand-red font-bold text-white px-6 py-4 flex items-center gap-4 uppercase tracking-[0.2em] text-xs skew-x-[-12deg] mx-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="skew-x-[12deg]">{t('action_required')}: {t('action_desc')}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* VEHICLE SPECS */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
                      <Car size={16} className="text-brand-red" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        {t('vehicle_details')}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: t('field_make'), value: selectedListing.make },
                        { label: t('field_model'), value: `${selectedListing.model} ${selectedListing.trimLevel}` },
                        { label: t('field_year'), value: selectedListing.modelYear },
                        { label: t('field_mileage'), value: `${selectedListing.mileage?.toLocaleString()} KM` },
                        { label: t('field_ext_color'), value: selectedListing.exteriorColor || '-' },
                        { label: t('field_int_color'), value: selectedListing.interiorColor || '-' },
                        { label: t('field_fuel'), value: selectedListing.fuelType || '-' },
                        { label: t('field_transmission'), value: selectedListing.transmission || '-' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center group">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.label}</span>
                          <span className="text-xs font-black uppercase text-near-black dark:text-white border-b-2 border-transparent group-hover:border-brand-red transition-all">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PRICING & SELLER */}
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
                        <DollarSign size={16} className="text-brand-red" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                          {t('pricing_transaction')}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-neutral-900 p-4 border-l-4 border-brand-red">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('field_price')}</span>
                          <span className="text-2xl font-black italic text-near-black dark:text-white">${selectedListing.askingPrice?.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('field_negotiable')}</span>
                            <span className="text-xs font-black uppercase">{renderBool(selectedListing.isNegotiable)}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{t('field_lien')}</span>
                            <span className="text-xs font-black uppercase">{renderBool(selectedListing.hasLien)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <MapPin size={14} className="text-brand-red" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{selectedListing.city}, {selectedListing.stateProvince}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
                        <ShieldCheck size={16} className="text-brand-red" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                          {t('seller_info')}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-100 dark:bg-neutral-800 rounded-none flex items-center justify-center font-black italic text-brand-red uppercase">
                            {selectedListing.sellerFullName?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase text-near-black dark:text-white">{selectedListing.sellerFullName}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Individual Member</span>
                          </div>
                        </div>
                        <div className="grid gap-2 pt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 italic">
                            <Mail size={12} className="text-brand-red" /> {selectedListing.sellerEmail}
                          </div>
                          {selectedListing.sellerPhone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Phone size={12} className="text-brand-red" /> {selectedListing.sellerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IMAGES */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
                      <Eye size={16} className="text-brand-red" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        {t('images_all')}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {(selectedListing.images || []).map((img, idx) => (
                        <div 
                          key={img.id} 
                          className="group relative aspect-[4/3] rounded-none overflow-hidden border border-gray-100 dark:border-neutral-800 cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-500"
                          onClick={() => setZoomedImage(img.imageUrl)}
                        >
                          <Image src={img.imageUrl} alt={img.imageType} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-brand-red/10 transition-colors flex items-center justify-center">
                            <Plus size={24} className="text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 duration-500 shadow-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedListing.status === 'PENDING' && (
                <div className="p-8 border-t bg-gray-50/30 flex gap-4">
                  <Button 
                    className="flex-1 h-14 uppercase tracking-[0.2em] text-xs font-black italic bg-green-600 hover:bg-green-700 text-white rounded-none shadow-lg" 
                    onClick={() => setIsApproveModalOpen(true)}
                    disabled={isProcessing}
                  >
                    <Check size={18} className="mr-3" /> {t('btn_approve')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 uppercase tracking-[0.2em] text-xs font-black italic border-2 border-brand-red text-brand-red hover:bg-brand-red/5 rounded-none" 
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isProcessing}
                  >
                    <X size={18} className="mr-3" /> {t('btn_reject')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[500px] font-porsche">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tighter text-2xl font-black italic">{t('reject_title')}</DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-widest text-gray-400">{t('reject_desc')}</DialogDescription>
          </DialogHeader>
          <div className="py-6">
             <Label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2 block">{t('reject_reason')}</Label>
             <Textarea
              className="min-h-[150px] font-porsche italic text-sm rounded-none border-gray-200"
              placeholder={t('reject_placeholder')}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={isProcessing} className="uppercase text-xs font-bold tracking-widest">
              {t('btn_cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
              loading={isProcessing}
              className="uppercase text-xs font-bold tracking-widest h-11 px-8"
            >
              {t('btn_confirm_reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Confirm */}
      <ConfirmDialog
        open={isApproveModalOpen}
        title={t('btn_approve')}
        description={t('approve_confirm')}
        confirmLabel={t('btn_approve')}
        cancelLabel={t('btn_cancel')}
        variant="brand"
        onConfirm={handleApprove}
        onCancel={() => setIsApproveModalOpen(false)}
        loading={isProcessing}
      />

      {/* Zoom Overlay */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 lg:p-12 animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative w-full h-full max-w-6xl">
            <Image src={zoomedImage} alt="Zoomed" fill className="object-contain" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-8 right-8 text-white hover:bg-white/10 h-12 w-12 rounded-none border border-white/20"
            onClick={(e) => {
              e.stopPropagation()
              setZoomedImage(null)
            }}
          >
            <X size={32} />
          </Button>
        </div>
      )}
    </div>
  )
}
