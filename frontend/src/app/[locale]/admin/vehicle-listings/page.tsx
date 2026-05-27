'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, X, Loader2, Eye, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { vehicleListingApi, VehicleListingResponse } from '@/services/vehicle-listing-api'
import { Button } from '@/components/features/admin/button'
import { Modal } from '@/components/features/admin/modal'
import { useTranslations } from 'next-intl'

export default function AdminVehicleListingsPage() {
  const t = useTranslations('adminUsedCars')
  const [listings, setListings] = useState<VehicleListingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  
  // Modal state
  const [selectedListing, setSelectedListing] = useState<VehicleListingResponse | null>(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Image zoom state
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

  if (loading && listings.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'SOLD'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                statusFilter === status 
                  ? 'bg-near-black text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status ? getStatusLabel(status) : t('filter_all')}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {t('total_listings')} {listings.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('table_id')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('table_vehicle')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('table_vin')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('table_price')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{t('table_status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">{t('table_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{l.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-near-black">{l.make} {l.model} {l.trimLevel}</div>
                    <div className="text-xs text-gray-500">{l.modelYear} • {l.mileage?.toLocaleString()} km</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 uppercase">{l.vin}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-700">${l.askingPrice?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      l.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      l.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      l.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {l.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                      {l.status === 'APPROVED' && <Check className="w-3 h-3 mr-1" />}
                      {l.status === 'REJECTED' && <X className="w-3 h-3 mr-1" />}
                      {getStatusLabel(l.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedListing(l)}
                    >
                      <Eye className="w-4 h-4 mr-2" /> {t('view_details')}
                    </Button>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('no_listings')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedListing && !isRejectModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedListing(null)}
          title={`Listing #${selectedListing.id} - ${selectedListing.make} ${selectedListing.model}`}
          size="xl"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
            
            {selectedListing.status === 'PENDING' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">{t('action_required')}</h4>
                  <p className="text-sm text-amber-700 mt-1">{t('action_desc')}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Details */}
              <div className="space-y-8">
                
                {/* Vehicle Details */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('vehicle_details')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_vin')}</div> <div className="font-medium uppercase text-right text-near-black break-all">{selectedListing.vin}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_make')}</div> <div className="font-medium text-right text-near-black">{selectedListing.make}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_model')}</div> <div className="font-medium text-right text-near-black">{selectedListing.model} {selectedListing.trimLevel}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_year')}</div> <div className="font-medium text-right text-near-black">{selectedListing.modelYear}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_mileage')}</div> <div className="font-medium text-right text-near-black">{selectedListing.mileage?.toLocaleString()} km</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_ext_color')}</div> <div className="font-medium text-right text-near-black">{selectedListing.exteriorColor || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_int_color')}</div> <div className="font-medium text-right text-near-black">{selectedListing.interiorColor || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_fuel')}</div> <div className="font-medium text-right text-near-black">{selectedListing.fuelType || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_transmission')}</div> <div className="font-medium text-right text-near-black">{selectedListing.transmission || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_drivetrain')}</div> <div className="font-medium text-right text-near-black">{selectedListing.drivetrain || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_seats')}</div> <div className="font-medium text-right text-near-black">{selectedListing.seats || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Transaction */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('pricing_transaction')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_price')}</div> <div className="font-medium text-green-700 text-right">${selectedListing.askingPrice?.toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_negotiable')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.isNegotiable)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_payment')}</div> <div className="font-medium text-right text-near-black break-words">{selectedListing.paymentMethods || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_lien')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasLien)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_location')}</div> <div className="font-medium text-right text-near-black break-words">{selectedListing.city}, {selectedListing.stateProvince} {selectedListing.zipCode}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_shipping')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.supportsShipping)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_tradein')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.acceptsTradeIn)}</div>
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('vehicle_condition')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_accident')}</div> <div className="font-medium text-right text-near-black break-words">{renderBool(selectedListing.hasAccident)} {selectedListing.accidentDescription ? `(${selectedListing.accidentDescription})` : ''}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_flood')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasFloodDamage)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_repaint')}</div> <div className="font-medium text-right text-near-black break-words">{renderBool(selectedListing.hasRepaint)} {selectedListing.repaintDescription ? `(${selectedListing.repaintDescription})` : ''}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_engine_cond')}</div> <div className="font-medium text-right text-near-black">{selectedListing.engineCondition || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_trans_cond')}</div> <div className="font-medium text-right text-near-black">{selectedListing.transmissionCondition || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_tire_cond')}</div> <div className="font-medium text-right text-near-black">{selectedListing.tireCondition || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_brake_cond')}</div> <div className="font-medium text-right text-near-black">{selectedListing.brakeCondition || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_warning_lights')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasWarningLights)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_electrical')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasElectricalIssues)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_mods')}</div> <div className="font-medium text-right text-near-black break-words">{renderBool(selectedListing.hasModifications)} {selectedListing.modificationsDescription ? `(${selectedListing.modificationsDescription})` : ''}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_smoking')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasSmokingPetExposure)}</div>
                    </div>
                  </div>
                  {selectedListing.conditionDescription && (
                    <div className="mt-4 text-sm text-gray-700 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                      <strong className="block mb-1 text-near-black">{t('field_cond_desc')}:</strong> {selectedListing.conditionDescription}
                    </div>
                  )}
                </div>

              </div>
              
              {/* Right Column: Docs, Seller, Images */}
              <div className="space-y-8">
                 {/* Documents */}
                 <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('history_docs')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_title_status')}</div> <div className="font-medium text-right text-near-black">{selectedListing.titleStatus || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_service_rec')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasServiceRecords)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_dealer_serviced')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.dealerServiced)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_last_service')}</div> <div className="font-medium text-right text-near-black">{selectedListing.lastServiceMileage?.toLocaleString() || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_repair_inv')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasRepairInvoices)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_recalls')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasOpenRecalls)}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_reg_valid')}</div> <div className="font-medium text-right text-near-black">{selectedListing.registrationValidUntil || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_owner_num')}</div> <div className="font-medium text-right text-near-black">{selectedListing.ownerNumber || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_carfax')}</div> <div className="font-medium text-right text-near-black">{renderBool(selectedListing.hasCarfaxReport)}</div>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('seller_info')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_seller_name')}</div> <div className="font-medium text-right text-near-black break-words">{selectedListing.sellerFullName}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_seller_phone')}</div> <div className="font-medium text-right text-near-black break-words">{selectedListing.sellerPhone || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_seller_email')}</div> <div className="font-medium break-all text-right text-near-black">{selectedListing.sellerEmail}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_seller_type')}</div> <div className="font-medium text-right text-near-black">{selectedListing.sellerType || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_contact_time')}</div> <div className="font-medium text-right text-near-black">{selectedListing.preferredContactTime || '-'}</div>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-gray-500 shrink-0">{t('field_contact_method')}</div> <div className="font-medium text-right text-near-black">{selectedListing.preferredContactMethod || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div>
                  <h3 className="font-semibold text-lg border-b pb-2 mb-3 text-near-black">{t('images_all')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedListing.images || []).map((img) => (
                      <div 
                        key={img.id} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group cursor-pointer hover:border-brand-red transition-all shadow-sm hover:shadow-md"
                        onClick={() => setZoomedImage(img.imageUrl)}
                      >
                        <Image src={img.imageUrl} alt={img.imageType} fill className="object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1.5 text-[10px] text-white text-center truncate font-medium">
                          {img.imageType}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!selectedListing.images || selectedListing.images.length === 0) && (
                    <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      No images available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedListing.status === 'PENDING' && (
              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-8">
                <Button 
                  variant="primary" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white border-transparent py-2.5 text-base"
                  onClick={() => setIsApproveModalOpen(true)}
                  disabled={isProcessing}
                >
                  <Check className="w-5 h-5 mr-2" /> {t('btn_approve')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 py-2.5 text-base"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5 mr-2" /> {t('btn_reject')}
                </Button>
              </div>
            )}
            
          </div>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsRejectModalOpen(false)}
          title={t('reject_title')}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t('reject_desc')}
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              rows={4}
              placeholder={t('reject_placeholder')}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="w-full" onClick={() => setIsRejectModalOpen(false)}>{t('btn_cancel')}</Button>
              <Button 
                variant="primary" 
                className="w-full bg-brand-red text-white border-transparent"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                {t('btn_confirm_reject')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve Confirmation Modal */}
      {isApproveModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsApproveModalOpen(false)}
          title={t('btn_approve')}
        >
          <div className="space-y-4 text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{t('btn_approve')}?</h3>
            <p className="text-sm text-gray-600 px-4">
              {t('approve_confirm')}
            </p>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="w-full" onClick={() => setIsApproveModalOpen(false)}>{t('btn_cancel')}</Button>
              <Button 
                variant="primary" 
                className="w-full bg-green-600 hover:bg-green-700 text-white border-transparent"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {t('btn_approve')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Zoomed Image Fullscreen Overlay */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setZoomedImage(null)
            }}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image 
              src={zoomedImage} 
              alt="Zoomed image" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
      
    </div>
  )
}
