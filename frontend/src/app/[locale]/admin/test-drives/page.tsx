'use client'

import { useEffect, useState, useRef } from 'react'
import { Check, X, Search, User, Mail, Calendar, Car } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
import { Button } from '@/components/base/ui/button'
import { Input } from '@/components/base/ui/input'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { testDriveApi, TestDriveBookingResponse } from '@/services/test-drive-api'
import { BookingStatus } from '@/constants/enums'

export default function TestDrivesPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [requests, setRequests] = useState<TestDriveBookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [actionInProgress, setActionInProgress] = useState<{
    id: number
    type: 'approve' | 'reject'
  } | null>(null)
  
  const isProcessingRef = useRef(false)

  const fetchBookings = async () => {
    try {
      const data = await testDriveApi.getAllBookingsForAdmin()
      setRequests(data)
    } catch (error) {
      toast.error('Failed to load test drive bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleApprove = async (id: number) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setActionInProgress({ id, type: 'approve' })
    try {
      await testDriveApi.approveBooking(id)
      toast.success(t('test_drive_approved'))
      await fetchBookings()
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setActionInProgress(null)
      isProcessingRef.current = false
    }
  }

  const handleReject = async (id: number) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setActionInProgress({ id, type: 'reject' })
    try {
      await testDriveApi.rejectBooking(id)
      toast.success(t('test_drive_rejected'))
      await fetchBookings()
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setActionInProgress(null)
      isProcessingRef.current = false
    }
  }

  useAdminPage({
    titleKey: 'test_drive_management',
    subtitleKey: 'test_drive_subtitle',
  })

  // Filter functionality
  const filteredRequests = requests.filter(r => 
    r.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    r.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    r.carName.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const columns = [
    {
      key: 'fullName',
      label: t('customer_name'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-medium text-near-black dark:text-white uppercase tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: t('email'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500 lowercase">{v}</span>
        </div>
      )
    },
    {
      key: 'carName',
      label: t('vehicle'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2 font-bold uppercase tracking-tighter text-near-black dark:text-white">
          <Car size={14} className="text-brand-red" />
          <span>Porsche {v}</span>
        </div>
      )
    },
    {
      key: 'preferredDate',
      label: t('date'),
      align: 'center' as const,
      render: (v: string, item: any) => (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
            <Calendar size={12} />
            {v}
          </div>
          <span className="text-eyebrow uppercase text-gray-400 tracking-widest">{item.preferredTime || '--'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: t('status'),
      align: 'center' as const,
      render: (v: string) => {
        let variant: 'warning' | 'success' | 'destructive' | 'outline' = 'warning'
        if (v === 'APPROVED') variant = 'success'
        if (v === 'REJECTED') variant = 'destructive'
        
        return (
          <Badge variant={variant}>
            {v}
          </Badge>
        )
      },
    },
    {
      key: 'actions',
      label: t('actions'),
      align: 'right' as const,
      render: (id: any, row: any) => {
        const request = row as TestDriveBookingResponse
        const isPending = request.status === BookingStatus.PENDING
        
        if (!isPending) {
          return <span className="text-eyebrow uppercase font-bold text-gray-400 tracking-widest">{t('no_actions')}</span>
        }

        const isApproving = actionInProgress?.id === id && actionInProgress?.type === 'approve'
        const isRejecting = actionInProgress?.id === id && actionInProgress?.type === 'reject'
        const anyBusy = !!actionInProgress

        return (
          <div className="flex gap-1 justify-end">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
              onClick={() => handleApprove(id)}
              loading={isApproving}
              disabled={anyBusy && !isApproving}
              title={tCommon('approve')}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={() => handleReject(id)}
              loading={isRejecting}
              disabled={anyBusy && !isRejecting}
              title={tCommon('reject')}
            >
              <X size={16} />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="test-drive-search"
            placeholder={t('search_bookings')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden">
        <DataTable
          loading={loading}
          columns={columns}
          data={filteredRequests}
          pagination={{
            pageSize: 10,
            currentPage,
            total: filteredRequests.length,
            onPageChange: setCurrentPage,
          }}
        />
      </div>
    </div>
  )
}
