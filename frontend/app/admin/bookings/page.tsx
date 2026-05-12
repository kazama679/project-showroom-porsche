'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { PageLayout } from '@/components/admin/page-layout'
import { Alert } from '@/components/admin/alert'

const mockBookings = [
  {
    id: 1,
    customerName: 'John Smith',
    email: 'john@example.com',
    carModel: 'Porsche 911 Turbo',
    bookingDate: '2024-06-15',
    startDate: '2024-06-20',
    endDate: '2024-06-27',
    totalPrice: '$8,500',
    status: 'confirmed',
  },
  {
    id: 2,
    customerName: 'Sarah Johnson',
    email: 'sarah@example.com',
    carModel: 'Porsche Cayenne S',
    bookingDate: '2024-06-14',
    startDate: '2024-06-18',
    endDate: '2024-06-25',
    totalPrice: '$5,200',
    status: 'confirmed',
  },
  {
    id: 3,
    customerName: 'Michael Chen',
    email: 'michael@example.com',
    carModel: 'Porsche Boxster',
    bookingDate: '2024-06-10',
    startDate: '2024-06-16',
    endDate: '2024-06-19',
    totalPrice: '$3,600',
    status: 'completed',
  },
  {
    id: 4,
    customerName: 'Emma Brown',
    email: 'emma@example.com',
    carModel: 'Porsche Macan',
    bookingDate: '2024-06-12',
    startDate: '2024-06-22',
    endDate: '2024-06-29',
    totalPrice: '$4,200',
    status: 'pending',
  },
]

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const carOptions = [
  { label: 'Porsche 911 Turbo', value: '911turbo' },
  { label: 'Porsche Cayenne S', value: 'cayennes' },
  { label: 'Porsche Boxster', value: 'boxster' },
  { label: 'Porsche Macan', value: 'macan' },
  { label: 'Porsche Panamera', value: 'panamera' },
]

const statusVariants = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'success',
  cancelled: 'danger',
} as const

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<(typeof mockBookings)[0] | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    carModel: '911turbo',
    startDate: '',
    endDate: '',
    totalPrice: '',
    status: 'pending',
  })

  const handleOpenModal = (booking?: (typeof mockBookings)[0]) => {
    if (booking) {
      setEditingBooking(booking)
      setFormData({
        customerName: booking.customerName,
        email: booking.email,
        carModel: booking.carModel.toLowerCase().replace(/ /g, ''),
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice.replace(/[$,]/g, ''),
        status: booking.status,
      })
    } else {
      setEditingBooking(null)
      setFormData({
        customerName: '',
        email: '',
        carModel: '911turbo',
        startDate: '',
        endDate: '',
        totalPrice: '',
        status: 'pending',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.customerName || !formData.email || !formData.startDate || !formData.totalPrice) {
      setAlertMessage('Please fill in all required fields')
      setShowAlert(true)
      return
    }

    if (editingBooking) {
      setBookings(
        bookings.map((booking) =>
          booking.id === editingBooking.id
            ? {
                ...booking,
                customerName: formData.customerName,
                email: formData.email,
                carModel: carOptions.find((c) => c.value === formData.carModel)?.label || '',
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalPrice: `$${parseInt(formData.totalPrice).toLocaleString()}`,
                status: formData.status as any,
              }
            : booking
        )
      )
      setAlertMessage('Booking updated successfully')
    } else {
      const newBooking = {
        id: Math.max(...bookings.map((b) => b.id)) + 1,
        customerName: formData.customerName,
        email: formData.email,
        carModel: carOptions.find((c) => c.value === formData.carModel)?.label || '',
        bookingDate: new Date().toISOString().split('T')[0],
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice: `$${parseInt(formData.totalPrice).toLocaleString()}`,
        status: formData.status as any,
      }
      setBookings([newBooking, ...bookings])
      setAlertMessage('Booking created successfully')
    }

    setIsModalOpen(false)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleDelete = (id: number) => {
    setBookings(bookings.filter((booking) => booking.id !== id))
    setAlertMessage('Booking deleted successfully')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  return (
    <PageLayout
      title="Booking Management"
      subtitle="Manage customer bookings and reservations"
      actions={
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
        >
          New Booking
        </Button>
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
          <DataTable
            columns={[
              {
                key: 'customerName',
                label: 'Customer',
                sortable: true,
              },
              {
                key: 'carModel',
                label: 'Vehicle',
                sortable: true,
              },
              {
                key: 'startDate',
                label: 'Start Date',
                align: 'center',
              },
              {
                key: 'endDate',
                label: 'End Date',
                align: 'center',
              },
              {
                key: 'totalPrice',
                label: 'Total Price',
                align: 'right',
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
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleOpenModal(bookings.find((b) => b.id === value))}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-[#8F8F8F]" />
                    </button>
                    <button
                      onClick={() => handleDelete(value)}
                      className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-[#DA291C]" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={bookings}
            pagination={{
              pageSize: 10,
              currentPage,
              total: bookings.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? 'Edit Booking' : 'Create New Booking'}
        subtitle={editingBooking ? 'Update booking information' : 'Create a new customer booking'}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editingBooking ? 'Update' : 'Create'} Booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Customer Name"
            placeholder="e.g., John Smith"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
          <FormInput
            label="Email Address"
            type="email"
            placeholder="customer@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Select
            label="Vehicle"
            options={carOptions}
            value={formData.carModel}
            onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          <FormInput
            label="Total Price"
            type="number"
            placeholder="e.g., 5200"
            value={formData.totalPrice}
            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
            required
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
        </div>
      </Modal>
    </PageLayout>
  )
}
