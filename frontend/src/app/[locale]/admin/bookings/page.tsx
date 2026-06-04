'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, User, Mail, Car, DollarSign, Briefcase, Clock, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { DataTable } from '@/components/base/admin/data-table'
import { Button } from '@/components/base/ui/button'
import { Badge } from '@/components/base/ui/badge'
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
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

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

const carOptions = [
  { label: 'Porsche 911 Turbo', value: '911turbo' },
  { label: 'Porsche Cayenne S', value: 'cayennes' },
  { label: 'Porsche Boxster', value: 'boxster' },
  { label: 'Porsche Macan', value: 'macan' },
  { label: 'Porsche Panamera', value: 'panamera' },
]

export default function BookingsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  
  const [bookings, setBookings] = useState(mockBookings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<(typeof mockBookings)[0] | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    carModel: '911turbo',
    startDate: '',
    endDate: '',
    totalPrice: '',
    status: 'pending',
  })

  useAdminPage({
    titleKey: 'bookings_management',
    subtitleKey: 'bookings_subtitle',
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName || !formData.email || !formData.startDate || !formData.totalPrice) {
      toast.error(t('fill_required'))
      return
    }

    setSaving(true)
    // Simulate API call
    setTimeout(() => {
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
        toast.success(tCommon('saved'))
      } else {
        const newBooking = {
          id: Math.max(0, ...bookings.map((b) => b.id)) + 1,
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
        toast.success(tCommon('saved'))
      }
      setIsModalOpen(false)
      setSaving(false)
    }, 500)
  }

  const handleDelete = () => {
    if (deletingId) {
      setBookings(bookings.filter((booking) => booking.id !== deletingId))
      toast.success(tCommon('deleted'))
      setIsDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  const columns = useMemo(() => [
    {
      key: 'customerName',
      label: t('bookings_customer'),
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-none bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-near-black dark:text-white uppercase tracking-tight italic">{val}</span>
            <span className="text-eyebrow text-gray-500 lowercase flex items-center gap-1 font-bold">
              <Mail size={10} /> {row.email}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'carModel',
      label: t('bookings_vehicle'),
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <Car size={14} className="text-brand-red" />
          <span className="font-bold text-near-black dark:text-white text-xs uppercase tracking-tighter italic">{val}</span>
        </div>
      )
    },
    {
      key: 'dates',
      label: t('bookings_duration'),
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-eyebrow font-black uppercase tracking-widest text-near-black dark:text-white">
            <Calendar size={12} className="text-gray-400" />
            <span>{row.startDate}</span>
          </div>
          {row.endDate && (
            <div className="flex items-center gap-2 text-eyebrow font-bold uppercase tracking-widest text-gray-400">
              <Clock size={12} />
              <span>{row.endDate}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'totalPrice',
      label: t('bookings_total_price'),
      align: 'right' as const,
      render: (val: string) => (
        <div className="flex items-center justify-end gap-1 text-brand-red">
          <DollarSign size={14} />
          <span className="font-black italic text-sm">{val.replace('$', '')}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: t('bookings_status'),
      align: 'center' as const,
      render: (val: string) => {
        const variantMap: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
          pending: 'warning',
          confirmed: 'success',
          completed: 'success',
          cancelled: 'destructive',
        }
        return (
          <Badge variant={variantMap[val] || 'secondary'} className="rounded-none uppercase text-micro font-black tracking-porsche-wide px-3 py-1 border-none shadow-sm">
            {val}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      label: t('bookings_actions'),
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenModal(row)}
            className="h-8 w-8 text-gray-400 hover:text-near-black dark:hover:text-white"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setDeletingId(row.id)
              setIsDeleteDialogOpen(true)
            }}
            className="h-8 w-8 text-gray-400 hover:text-brand-red"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ], [t])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-eyebrow font-black uppercase tracking-spacious text-gray-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-red" />
            {t('bookings_overview')}
          </h2>
        </div>
        <Button
          variant="brand"
          onClick={() => handleOpenModal()}
          className="uppercase tracking-widest text-xs font-black h-11 px-6 italic"
        >
          <Plus size={16} className="mr-2" />
          {t('new_booking')}
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={bookings}
          pagination={{
            pageSize: 10,
            currentPage: 1,
            total: bookings.length,
            onPageChange: () => {},
          }}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl p-0 border-none rounded-none overflow-hidden font-porsche">
          <DialogHeader className="p-8 border-b bg-gray-50/50 dark:bg-neutral-900/50">
            <DialogTitle className="uppercase tracking-tighter text-3xl font-black italic">
              {editingBooking ? t('bookings_edit') : t('bookings_create')}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase font-bold tracking-porsche-wide text-gray-400">
              {editingBooking ? t('bookings_update_info') : t('bookings_create_info')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="customerName" className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('full_name')} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <Input
                    id="customerName"
                    placeholder={t('placeholder_fullname')}
                    className="pl-9 font-bold uppercase h-11"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('email_address')} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('placeholder_email')}
                    className="pl-9 font-bold h-11 lowercase"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('bookings_vehicle')} *</Label>
              <Select value={formData.carModel} onValueChange={(val) => setFormData({ ...formData, carModel: val })}>
                <SelectTrigger className="h-11 font-black uppercase text-eyebrow tracking-widest italic">
                  <div className="flex items-center">
                    <Car className="mr-3 text-brand-red" size={16} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {carOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="uppercase font-bold text-eyebrow tracking-widest">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <Input
                    type="date"
                    className="pl-9 font-mono h-11"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <Input
                    type="date"
                    className="pl-9 font-mono h-11"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('bookings_total_price')} (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" size={14} />
                  <Input
                    type="number"
                    placeholder="8500"
                    className="pl-9 font-black italic h-11 text-brand-red"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">{t('bookings_status')} *</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-11 font-black uppercase text-eyebrow tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="uppercase font-bold text-eyebrow">Pending</SelectItem>
                    <SelectItem value="confirmed" className="uppercase font-bold text-eyebrow">Confirmed</SelectItem>
                    <SelectItem value="completed" className="uppercase font-bold text-eyebrow">Completed</SelectItem>
                    <SelectItem value="cancelled" className="uppercase font-bold text-eyebrow">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving} className="uppercase text-xs font-bold tracking-widest h-12 flex-1">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={saving} className="uppercase text-xs font-bold tracking-porsche-wide h-12 px-10 italic font-black shadow-lg flex-1">
                {editingBooking ? tCommon('update') : tCommon('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={t('confirm_delete')}
        description={t('are_you_sure')}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setDeletingId(null)
        }}
      />
    </div>
  )
}
