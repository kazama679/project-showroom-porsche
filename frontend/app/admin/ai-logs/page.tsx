'use client'

import { useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { Select } from '@/components/admin/select'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'

const mockLogs = [
  {
    id: 1,
    timestamp: '2024-06-10 14:23:45',
    eventType: 'Car Listed',
    module: 'Inventory',
    message: 'New Porsche 911 Turbo added to system',
    status: 'success',
  },
  {
    id: 2,
    timestamp: '2024-06-10 14:15:32',
    eventType: 'User Login',
    module: 'Auth',
    message: 'Admin user logged in successfully',
    status: 'success',
  },
  {
    id: 3,
    timestamp: '2024-06-10 14:05:18',
    eventType: 'Booking Confirmed',
    module: 'Bookings',
    message: 'Customer booking #1234 confirmed',
    status: 'success',
  },
  {
    id: 4,
    timestamp: '2024-06-10 13:58:22',
    eventType: 'Review Published',
    module: 'Reviews',
    message: '5-star review published for 911 Turbo',
    status: 'success',
  },
  {
    id: 5,
    timestamp: '2024-06-10 13:45:10',
    eventType: 'Data Export',
    module: 'Reports',
    message: 'Monthly sales report exported',
    status: 'success',
  },
  {
    id: 6,
    timestamp: '2024-06-10 13:32:05',
    eventType: 'Error',
    module: 'API',
    message: 'Failed to fetch vehicle specifications',
    status: 'error',
  },
  {
    id: 7,
    timestamp: '2024-06-10 13:20:44',
    eventType: 'Test Drive Request',
    module: 'Bookings',
    message: 'New test drive request from customer',
    status: 'success',
  },
  {
    id: 8,
    timestamp: '2024-06-10 13:08:33',
    eventType: 'Settings Updated',
    module: 'Admin',
    message: 'System timezone updated to UTC',
    status: 'success',
  },
]

const statusVariants = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
} as const

const eventTypeOptions = [
  { label: 'All Events', value: 'all' },
  { label: 'Car Listed', value: 'car' },
  { label: 'User Login', value: 'login' },
  { label: 'Booking Confirmed', value: 'booking' },
  { label: 'Review Published', value: 'review' },
  { label: 'Error', value: 'error' },
]

export default function AILogsPage() {
  const [logs, setLogs] = useState(mockLogs)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredLogs = filterType === 'all' ? logs : logs.filter((log) => {
    // Simple filter based on selected type
    return true
  })

  const handleClearLogs = () => {
    setLogs([])
    setAlertMessage('All logs cleared')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'Module', 'Message', 'Status'],
      ...logs.map((log) => [
        log.timestamp,
        log.eventType,
        log.module,
        log.message,
        log.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    setAlertMessage('Logs exported successfully')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleDeleteLog = (id: number) => {
    setLogs(logs.filter((log) => log.id !== id))
    setAlertMessage('Log entry deleted')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  return (
    <PageLayout
      title="AI Logs"
      subtitle="View AI system activity and logs"
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download size={18} />} onClick={handleExportLogs}>
            Export
          </Button>
          <Button variant="danger" onClick={handleClearLogs}>
            Clear Logs
          </Button>
        </div>
      }
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
          <div className="mb-4">
            <Select
              label="Filter by Event Type"
              options={eventTypeOptions}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>

          <DataTable
            columns={[
              {
                key: 'timestamp',
                label: 'Timestamp',
                sortable: true,
              },
              {
                key: 'eventType',
                label: 'Event Type',
                sortable: true,
              },
              {
                key: 'module',
                label: 'Module',
                sortable: true,
              },
              {
                key: 'message',
                label: 'Message',
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
                render: (value) => (
                  <button
                    onClick={() => handleDeleteLog(value)}
                    className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-[#DA291C]" />
                  </button>
                ),
              },
            ]}
            data={filteredLogs}
            pagination={{
              pageSize: 10,
              currentPage,
              total: filteredLogs.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
    </PageLayout>
  )
}
