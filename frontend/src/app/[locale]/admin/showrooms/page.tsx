'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Search, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

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
import { Badge } from '@/components/base/ui/badge'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'
import { useAdminPage } from '@/components/features/admin/admin-page-context'

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

export default function ShowroomsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  
  const [showrooms, setShowrooms] = useState(mockShowrooms)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingShowroom, setEditingShowroom] = useState<(typeof mockShowrooms)[0] | null>(null)
  const [deletingShowroom, setDeletingShowroom] = useState<(typeof mockShowrooms)[0] | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
  })

  // Filter showrooms based on search
  const filteredShowrooms = showrooms.filter(s => 
    s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    s.city.toLowerCase().includes(searchKeyword.toLowerCase())
  )

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
      toast.error(t('fill_required'))
      return
    }

    if (editingShowroom) {
      setShowrooms(
        showrooms.map((s) =>
          s.id === editingShowroom.id
            ? { ...s, ...formData, status: formData.status as any }
            : s
        )
      )
      toast.success(tCommon('update_success'))
    } else {
      const newShowroom = {
        id: Math.max(0, ...showrooms.map((s) => s.id)) + 1,
        ...formData,
        status: formData.status as any,
      }
      setShowrooms([newShowroom, ...showrooms])
      toast.success(tCommon('create_success'))
    }
    setIsModalOpen(false)
  }

  const handleOpenDeleteModal = (showroom: typeof mockShowrooms[0]) => {
    setDeletingShowroom(showroom)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingShowroom) return
    setShowrooms(showrooms.filter((s) => s.id !== deletingShowroom.id))
    toast.success(tCommon('delete_success'))
    setIsDeleteModalOpen(false)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'coming_soon': return 'Coming Soon'
      case 'closed': return 'Closed'
      default: return status
    }
  }

  useAdminPage({
    titleKey: 'showrooms_management',
    subtitleKey: 'showrooms_subtitle',
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="showroom-search"
            placeholder={t('search_showrooms')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Button variant="brand" size="sm" onClick={() => handleOpenModal()}>
          <Plus size={16} className="mr-2" />
          Add Showroom
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredShowrooms.map((showroom) => (
          <div
            key={showroom.id}
            className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm p-6 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-near-black dark:text-white uppercase tracking-tight">
                  {showroom.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <Globe size={12} className="text-brand-red" />
                  {showroom.city}
                </div>
              </div>
              <Badge variant={showroom.status === 'active' ? 'success' : 'outline'}>
                {getStatusLabel(showroom.status)}
              </Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex gap-4">
                <MapPin size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-500 leading-relaxed italic">{showroom.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={18} className="text-gray-300 flex-shrink-0" />
                <a href={`tel:${showroom.phone}`} className="text-sm font-medium text-info-blue hover:underline">
                  {showroom.phone}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={18} className="text-gray-300 flex-shrink-0" />
                <a href={`mailto:${showroom.email}`} className="text-sm font-medium text-near-black dark:text-white hover:text-brand-red transition-colors">
                  {showroom.email}
                </a>
              </div>
            </div>

            <div className="flex gap-2 pt-5 border-t border-light-gray-surface dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 uppercase text-xs font-bold tracking-widest h-10"
                onClick={() => handleOpenModal(showroom)}
              >
                <Edit2 size={14} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-brand-red h-10 w-10 p-0"
                onClick={() => handleOpenDeleteModal(showroom)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}
        {filteredShowrooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 italic bg-gray-50 dark:bg-neutral-900 rounded-sm border border-dashed border-gray-200 dark:border-neutral-800">
            No showrooms found matching your search.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}</DialogTitle>
            <DialogDescription>
              {editingShowroom ? 'Update showroom information' : 'Create a new showroom location'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Showroom Name</Label>
              <Input
                placeholder="e.g., Downtown Porsche Center"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">City</Label>
                <Input
                  placeholder="e.g., New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold tracking-wider">Address</Label>
              <Input
                placeholder="Full street address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Phone</Label>
                <Input
                  placeholder="+1 (xxx) xxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs uppercase font-bold tracking-wider">Email</Label>
                <Input
                  type="email"
                  placeholder="contact@porsche-showroom.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button variant="brand" onClick={handleSave}>
              {editingShowroom ? tCommon('update') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('confirm_delete')}
        description={t('are_you_sure')}
        itemLabel={deletingShowroom?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  )
}
