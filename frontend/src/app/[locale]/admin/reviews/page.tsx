'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Star, User, Car, MessageSquare, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
import { Button } from '@/components/base/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/base/ui/dialog'
import { Input } from '@/components/base/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/base/ui/select'
import { Label } from '@/components/base/ui/label'
import { Textarea } from '@/components/base/ui/textarea'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

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

export default function ReviewsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [reviews, setReviews] = useState(mockReviews)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<(typeof mockReviews)[0] | null>(null)
  const [deletingReview, setDeletingReview] = useState<(typeof mockReviews)[0] | null>(null)

  const [formData, setFormData] = useState({
    customerName: '',
    vehicle: '',
    rating: '5',
    comment: '',
    status: 'pending',
  })

  const filteredReviews = reviews.filter(r => 
    r.customerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    r.vehicle.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchKeyword.toLowerCase())
  )

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
      toast.error(t('fill_required'))
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
      toast.success(tCommon('update_success'))
    } else {
      const newReview = {
        id: Math.max(0, ...reviews.map((r) => r.id)) + 1,
        customerName: formData.customerName,
        vehicle: formData.vehicle,
        rating: parseInt(formData.rating),
        comment: formData.comment,
        reviewDate: new Date().toISOString().split('T')[0],
        status: formData.status as any,
      }
      setReviews([newReview, ...reviews])
      toast.success(tCommon('create_success'))
    }

    setIsModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!deletingReview) return
    setReviews(reviews.filter((review) => review.id !== deletingReview.id))
    toast.success(tCommon('delete_success'))
    setIsDeleteModalOpen(false)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < rating ? 'fill-brand-red text-brand-red' : 'text-gray-200 dark:text-neutral-800'}
          />
        ))}
      </div>
    )
  }

  useAdminPage({
    titleKey: 'reviews_management',
    subtitleKey: 'reviews_subtitle',
  })

  const columns = [
    {
      key: 'customerName',
      label: t('customer'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{v}</span>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: t('vehicle'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
          <Car size={14} className="text-gray-400" />
          {v}
        </div>
      )
    },
    {
      key: 'rating',
      label: t('rating'),
      align: 'center' as const,
      render: (value: number) => renderStars(value),
    },
    {
      key: 'comment',
      label: t('comment'),
      render: (v: string) => (
        <div className="max-w-comment-preview truncate italic text-sm text-gray-500 group-hover:whitespace-normal group-hover:overflow-visible group-hover:transition-all">
          &quot;{v}&quot;
        </div>
      )
    },
    {
      key: 'status',
      label: t('status'),
      align: 'center' as const,
      render: (v: string) => (
        <Badge variant={v === 'published' ? 'success' : 'warning'} className="uppercase text-micro tracking-widest font-bold">
          {v}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
            onClick={() => handleOpenModal(row)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-brand-red"
            onClick={() => {
              setDeletingReview(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="review-search"
            placeholder={t('search_reviews')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
          <Plus size={16} className="mr-2" />
          Add Review
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredReviews}
          pagination={{
            pageSize: 10,
            currentPage,
            total: filteredReviews.length,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-modal">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tighter text-2xl font-black italic">
              {editingReview ? 'Edit Review' : 'Add New Review'}
            </DialogTitle>
            <DialogDescription className="italic text-gray-400">
              {editingReview ? 'Update review information' : 'Create a new customer review'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 font-porsche">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">Customer Name</Label>
                <Input
                  placeholder="e.g. John Smith"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="font-bold uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">Vehicle</Label>
                <Input
                  placeholder="e.g. Porsche 911"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  className="font-bold uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">Rating</Label>
                <Select value={formData.rating} onValueChange={(v) => setFormData({ ...formData, rating: v })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">★★★★★ (5 Stars)</SelectItem>
                    <SelectItem value="4">★★★★☆ (4 Stars)</SelectItem>
                    <SelectItem value="3">★★★☆☆ (3 Stars)</SelectItem>
                    <SelectItem value="2">★★☆☆☆ (2 Stars)</SelectItem>
                    <SelectItem value="1">★☆☆☆☆ (1 Star)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">Review Comment</Label>
              <Textarea
                placeholder="Message from customer..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="min-h-review-textarea italic h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="uppercase text-xs font-bold tracking-widest">
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave} className="uppercase text-xs font-bold tracking-widest">
              {editingReview ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('confirm_delete')}
        description={t('are_you_sure')}
        itemLabel={`${deletingReview?.customerName} - ${deletingReview?.vehicle}`}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
