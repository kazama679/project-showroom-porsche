'use client'

import { useEffect, useState, useRef } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'
import { testDriveApi, TestDriveBookingResponse } from '@/lib/test-drive-api'
import { BookingStatus } from '@/constants/enums'

const statusVariants = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
} as const

export default function TestDrivesPage() {
  const [requests, setRequests] = useState<TestDriveBookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
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
      console.error('Failed to load test drive bookings', error)
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
      setAlertMessage('Test drive request approved')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 4000)
      await fetchBookings()
    } catch (error) {
      console.error('Failed to approve request', error)
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
      setAlertMessage('Test drive request rejected')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 4000)
      await fetchBookings()
    } catch (error) {
      console.error('Failed to reject request', error)
    } finally {
      setActionInProgress(null)
      isProcessingRef.current = false
    }
  }

  return (
    <PageLayout
      title="Test Drive Requests"
      subtitle="Review and manage customer test drive requests"
    >
      <div className="space-y-6">
        {showAlert && (
          <Alert
            type="success"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="relative bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          {actionInProgress && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-3 border border-light-gray-surface dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-4 shadow-xl rounded-md">
                <Loader2 size={18} className="animate-spin text-near-black dark:text-white" />
                <span className="text-sm font-medium text-near-black dark:text-white">
                  {actionInProgress.type === 'approve'
                    ? 'Đang duyệt và gửi email...'
                    : 'Đang từ chối yêu cầu...'}
                </span>
              </div>
            </div>
          )}
          <DataTable
            loading={loading}
            columns={[
              {
                key: 'fullName',
                label: 'Customer Name',
                sortable: true,
              },
              {
                key: 'email',
                label: 'Email',
                sortable: true,
              },
              {
                key: 'carName',
                label: 'Vehicle',
                sortable: true,
                render: (val, item: any) => `Porsche ${val}`
              },
              {
                key: 'preferredDate',
                label: 'Preferred Date',
                align: 'center',
                render: (val, item: any) => val ? `${val} / ${item.preferredTime || ''}` : '--'
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (value) => (
                  <Badge variant={statusVariants[value as keyof typeof statusVariants] || 'warning'}>
                    {value}
                  </Badge>
                ),
              },
              {
                key: 'id',
                label: 'Actions',
                align: 'center',
                render: (value) => {
                  const request = requests.find((r) => r.id === value)
                  const activeAction = actionInProgress
                  if (request?.status !== BookingStatus.PENDING) {
                    return <span className="text-xs text-mid-gray">No actions</span>
                  }
                  return (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(value)}
                        disabled={Boolean(activeAction)}
                        className="p-2 hover:bg-success-green/10 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Approve test drive"
                      >
                        {activeAction?.id === value && activeAction?.type === 'approve' ? (
                          <Loader2 size={16} className="animate-spin text-success-green" />
                        ) : (
                          <Check size={16} className="text-success-green" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(value)}
                        disabled={Boolean(activeAction)}
                        className="p-2 hover:bg-brand-red/10 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Reject test drive"
                      >
                        {activeAction?.id === value && activeAction?.type === 'reject' ? (
                          <Loader2 size={16} className="animate-spin text-brand-red" />
                        ) : (
                          <X size={16} className="text-brand-red" />
                        )}
                      </button>
                    </div>
                  )
                },
              },
            ]}
            data={requests}
            pagination={{
              pageSize: 10,
              currentPage,
              total: requests.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
    </PageLayout>
  )
}
