'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import { DataTable } from '@/components/features/admin/data-table'
import { Badge } from '@/components/features/admin/badge'
import { Button } from '@/components/features/admin/button'
import { Modal } from '@/components/features/admin/modal'
import { FormInput } from '@/components/features/admin/form-input'
import { Select } from '@/components/features/admin/select'

import { useAdminPage } from "@/components/features/admin/admin-page-context"
import { Alert } from "@/components/features/admin/alert"

const mockReviews = [
  {
    id: 1,
    customerName: 'John Smith',
    vehicle: 'Porsche 911 Turbo',
    rating: 5,
    comment: 'Exceptional performance and luxury',
    reviewDate: '2024-06-10',
    status: 'published',
  },
  {
    id: 2,
    customerName: 'Sarah Johnson',
    vehicle: 'Porsche Cayenne S',
    rating: 4,
    comment: 'Great handling and comfort',
    reviewDate: '2024-06-08',
    status: 'published',
  },
  {
    id: 3,
    customerName: 'Michael Chen',
    vehicle: 'Porsche Boxster',
    rating: 5,
    comment: 'Fantastic driving experience',
    reviewDate: '2024-06-05',
    status: 'published',
  },
  {
    id: 4,
    customerName: 'Emma Brown',
    vehicle: 'Porsche Macan',
    rating: 3,
    comment: 'Good value for money',
    reviewDate: '2024-06-02',
    status: 'pending',
  },
]

const statusOptions = [
  { label: 'Published', value: 'published' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
]

const ratingOptions = [
  { label: '★★★★★ (5 Stars)', value: '5' },
  { label: '★★★★ (4 Stars)', value: '4' },
  { label: '★★★ (3 Stars)', value: '3' },
  { label: '★★ (2 Stars)', value: '2' },
  { label: '★ (1 Star)', value: '1' },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<(typeof mockReviews)[0] | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    vehicle: '',
    rating: '5',
    comment: '',
    status: 'pending',
  })

  const handleOpenModal = (review?: (typeof mockReviews)[0]) => {
    if (review) {
      setEditingReview(review)
      setFormData({
        customerName: review.customerName,
        vehicle: review.vehicle,
        rating: review.rating.toString(),
        comment: review.comment,
        status: review.status,
      })
    } else {
      setEditingReview(null)
      setFormData({
        customerName: '',
        vehicle: '',
        rating: '5',
        comment: '',
        status: 'pending',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.customerName || !formData.vehicle || !formData.comment) {
      setAlertMessage('Please fill in all required fields')
      setShowAlert(true)
      return
    }

    if (editingReview) {
      setReviews(
        reviews.map((review) =>
          review.id === editingReview.id
            ? {
                ...review,
                customerName: formData.customerName,
                vehicle: formData.vehicle,
                rating: parseInt(formData.rating),
                comment: formData.comment,
                status: formData.status as any,
              }
            : review
        )
      )
      setAlertMessage('Review updated successfully')
    } else {
      const newReview = {
        id: Math.max(...reviews.map((r) => r.id)) + 1,
        customerName: formData.customerName,
        vehicle: formData.vehicle,
        rating: parseInt(formData.rating),
        comment: formData.comment,
        reviewDate: new Date().toISOString().split('T')[0],
        status: formData.status as any,
      }
      setReviews([newReview, ...reviews])
      setAlertMessage('Review created successfully')
    }

    setIsModalOpen(false)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((review) => review.id !== id))
    setAlertMessage('Review deleted successfully')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 4000)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-modena-yellow text-modena-yellow' : 'text-light-gray-surface'}
          />
        ))}
      </div>
    )
  }

  useAdminPage({
    titleKey: 'reviews_management',
    subtitleKey: 'reviews_subtitle',
    actions: (
      <Button
        variant="primary"
        icon={<Plus size={18} />}
        onClick={() => handleOpenModal()}
      >
        Add Review
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

        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6">
          <DataTable
            columns={[
              {
                key: 'customerName',
                label: 'Customer',
                sortable: true,
              },
              {
                key: 'vehicle',
                label: 'Vehicle',
                sortable: true,
              },
              {
                key: 'rating',
                label: 'Rating',
                align: 'center',
                render: (value) => renderStars(value),
              },
              {
                key: 'comment',
                label: 'Comment',
              },
              {
                key: 'status',
                label: 'Status',
                align: 'center',
                render: (value) => (
                  <Badge variant={value === 'published' ? 'success' : 'warning'}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                align: 'center',
                render: (value) => (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleOpenModal(reviews.find((r) => r.id === value))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-mid-gray" />
                    </button>
                    <button
                      onClick={() => handleDelete(value)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-brand-red" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={reviews}
            pagination={{
              pageSize: 10,
              currentPage,
              total: reviews.length,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReview ? 'Edit Review' : 'Add New Review'}
        subtitle={editingReview ? 'Update review information' : 'Create a new customer review'}
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
              {editingReview ? 'Update' : 'Create'} Review
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
            label="Vehicle"
            placeholder="e.g., Porsche 911 Turbo"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            required
          />
          <Select
            label="Rating"
            options={ratingOptions}
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          />
          <FormInput
            label="Review Comment"
            placeholder="What did they think of the vehicle?"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
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
    </>
  )
}
