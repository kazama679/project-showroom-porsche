'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'

interface TestDriveRequest {
  id: number
  userName: string
  email: string
  carModel: string
  preferredDate: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
}

const mockRequests: TestDriveRequest[] = [
  {
    id: 1,
    userName: 'John Smith',
    email: 'john@example.com',
    carModel: 'Porsche 911 Turbo',
    preferredDate: '2024-06-20',
    status: 'pending',
  },
  {
    id: 2,
    userName: 'Sarah Johnson',
    email: 'sarah@example.com',
    carModel: 'Porsche Cayenne S',
    preferredDate: '2024-06-18',
    status: 'approved',
  },
  {
    id: 3,
    userName: 'Michael Chen',
    email: 'michael@example.com',
    carModel: 'Porsche Boxster',
    preferredDate: '2024-06-19',
    status: 'completed',
  },
  {
    id: 4,
    userName: 'Emma Brown',
    email: 'emma@example.com',
    carModel: 'Porsche Macan',
    preferredDate: '2024-06-21',
    status: 'pending',
  },
  {
    id: 5,
    userName: 'David Wilson',
    email: 'david@example.com',
    carModel: 'Porsche Panamera',
    preferredDate: '2024-06-15',
    status: 'rejected',
  },
]

const statusVariants = {
  pending: 'warning',
  approved: 'success',
  completed: 'success',
  rejected: 'danger',
} as const

export default function TestDrivesPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const handleApprove = (id: number) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'approved' as const } : req
      )
    )
    setAlertMessage('Test drive request approved')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleReject = (id: number) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'rejected' as const } : req
      )
    )
    setAlertMessage('Test drive request rejected')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
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

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6">
          <DataTable
            columns={[
              {
                key: 'userName',
                label: 'Customer Name',
                sortable: true,
              },
              {
                key: 'email',
                label: 'Email',
                sortable: true,
              },
              {
                key: 'carModel',
                label: 'Vehicle',
                sortable: true,
              },
              {
                key: 'preferredDate',
                label: 'Preferred Date',
                align: 'center',
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (value) => (
                  <Badge variant={statusVariants[value as keyof typeof statusVariants]}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Badge>
                ),
              },
              {
                key: 'id',
                label: 'Actions',
                align: 'center',
                render: (value) => {
                  const request = requests.find((r) => r.id === value)
                  if (request?.status !== 'pending') {
                    return <span className="text-xs text-[#8F8F8F]">No actions</span>
                  }
                  return (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(value)}
                        className="p-2 hover:bg-[#03904A]/10 rounded transition-colors"
                      >
                        <Check size={16} className="text-[#03904A]" />
                      </button>
                      <button
                        onClick={() => handleReject(value)}
                        className="p-2 hover:bg-[#DA291C]/10 rounded transition-colors"
                      >
                        <X size={16} className="text-[#DA291C]" />
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
