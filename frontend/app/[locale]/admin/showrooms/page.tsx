'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/admin/badge'
import { Button } from '@/components/admin/button'
import { Modal } from '@/components/admin/modal'
import { FormInput } from '@/components/admin/form-input'
import { Select } from '@/components/admin/select'
import { useAdminPage } from "@/components/admin/admin-page-context"
import { Alert } from "@/components/admin/alert"

const mockShowrooms = [
  {
    id: 1,
    name: 'Downtown Porsche Center',
    city: 'New York',
    address: '123 Main Street, NY 10001',
    phone: '+1 (212) 555-0100',
    email: 'downtown@porsche.com',
    status: 'active',
  },
  {
    id: 2,
    name: 'Beverly Hills Showroom',
    city: 'Los Angeles',
    address: '456 Sunset Boulevard, LA 90210',
    phone: '+1 (310) 555-0200',
    email: 'beverly@porsche.com',
    status: 'active',
  },
  {
    id: 3,
    name: 'Miami Beach Location',
    city: 'Miami',
    address: '789 Ocean Drive, Miami 33139',
    phone: '+1 (305) 555-0300',
    email: 'miami@porsche.com',
    status: 'active',
  },
  {
    id: 4,
    name: 'Chicago Motor Experience',
    city: 'Chicago',
    address: '321 Michigan Avenue, Chicago 60611',
    phone: '+1 (312) 555-0400',
    email: 'chicago@porsche.com',
    status: 'coming_soon',
  },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Coming Soon', value: 'coming_soon' },
  { label: 'Closed', value: 'closed' },
]

export default function ShowroomsPage() {
  const [showrooms, setShowrooms] = useState(mockShowrooms)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShowroom, setEditingShowroom] = useState<(typeof mockShowrooms)[0] | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
  })

  const handleOpenModal = (showroom?: (typeof mockShowrooms)[0]) => {
    if (showroom) {
      setEditingShowroom(showroom)
      setFormData({
        name: showroom.name,
        city: showroom.city,
        address: showroom.address,
        phone: showroom.phone,
        email: showroom.email,
        status: showroom.status,
      })
    } else {
      setEditingShowroom(null)
      setFormData({
        name: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.city || !formData.address) {
      setAlertMessage('Please fill in all required fields')
      setShowAlert(true)
      return
    }

    if (editingShowroom) {
      setShowrooms(
        showrooms.map((s) =>
          s.id === editingShowroom.id
            ? {
                ...s,
                name: formData.name,
                city: formData.city,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                status: formData.status as any,
              }
            : s
        )
      )
      setAlertMessage('Showroom updated successfully')
    } else {
      const newShowroom = {
        id: Math.max(...showrooms.map((s) => s.id)) + 1,
        name: formData.name,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        status: formData.status as any,
      }
      setShowrooms([newShowroom, ...showrooms])
      setAlertMessage('Showroom created successfully')
    }

    setIsModalOpen(false)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleDelete = (id: number) => {
    setShowrooms(showrooms.filter((s) => s.id !== id))
    setAlertMessage('Showroom deleted successfully')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  useAdminPage({
    titleKey: 'showrooms_management',
    subtitleKey: 'showrooms_subtitle',
    actions: (
      <Button
        variant="primary"
        icon={<Plus size={18} />}
        onClick={() => handleOpenModal()}
      >
        Add Showroom
      </Button>
    ),
  })

  return (
    <>
      <div className="space-y-6">
        {showAlert && (
          <Alert
            type="success"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {showrooms.map((showroom) => (
            <div
              key={showroom.id}
              className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-porsche-subheading text-near-black dark:text-white">
                  {showroom.name}
                </h3>
                <Badge variant={showroom.status === 'active' ? 'success' : 'warning'}>
                  {showroom.status.replace('_', ' ').charAt(0).toUpperCase() + showroom.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex gap-3 text-sm">
                  <MapPin size={16} className="text-brand-red flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-near-black dark:text-white">{showroom.city}</p>
                    <p className="text-mid-gray dark:text-light-gray-surface">{showroom.address}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm items-center">
                  <Phone size={16} className="text-brand-red" />
                  <a href={`tel:${showroom.phone}`} className="text-info-blue hover:underline">
                    {showroom.phone}
                  </a>
                </div>
                <div className="flex gap-3 text-sm items-center">
                  <Mail size={16} className="text-brand-red" />
                  <a href={`mailto:${showroom.email}`} className="text-info-blue hover:underline">
                    {showroom.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-light-gray-surface dark:border-neutral-700">
                <button
                  onClick={() => handleOpenModal(showroom)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-red text-white rounded-sm hover:bg-dark-red font-medium text-sm"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(showroom.id)}
                  className="px-3 py-2 bg-light-gray-surface dark:bg-neutral-700 text-black dark:text-white rounded-sm hover:bg-neutral-300 dark:hover:bg-[#505050]"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}
        subtitle={editingShowroom ? 'Update showroom information' : 'Create a new showroom location'}
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
              {editingShowroom ? 'Update' : 'Create'} Showroom
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Showroom Name"
            placeholder="e.g., Downtown Porsche Center"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="City"
            placeholder="e.g., New York"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <FormInput
            label="Address"
            placeholder="e.g., 123 Main Street, NY 10001"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <FormInput
            label="Phone"
            placeholder="+1 (212) 555-0100"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="contact@porsche.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
        </div>
      </Modal>
    </>
  )
}
