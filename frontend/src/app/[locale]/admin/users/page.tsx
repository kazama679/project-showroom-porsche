'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Edit2, Trash2, User as UserIcon, Mail, Phone, Calendar, ShieldCheck, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Button } from '@/components/base/ui/button'
import { Input } from '@/components/base/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/base/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/base/ui/dialog'
import { Label } from '@/components/base/ui/label'
import { DataTable } from '@/components/base/admin/data-table'
import { Badge } from '@/components/base/ui/badge'
import { ConfirmDialog } from '@/components/base/admin/confirm-dialog'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: string
  joinDate: string
  status: 'active' | 'inactive'
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'customer',
    joinDate: '2024-03-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    role: 'admin',
    joinDate: '2024-01-10',
    status: 'active',
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael@example.com',
    phone: '+1 (555) 456-7890',
    role: 'customer',
    joinDate: '2024-05-02',
    status: 'active',
  },
  {
    id: 4,
    name: 'Emma Brown',
    email: 'emma@example.com',
    phone: '+1 (555) 321-0987',
    role: 'staff',
    joinDate: '2024-02-28',
    status: 'active',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david@example.com',
    phone: '+1 (555) 654-3210',
    role: 'customer',
    joinDate: '2024-04-20',
    status: 'inactive',
  },
]

export default function UsersPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active' as 'active' | 'inactive',
  })

  const filteredUsers = useMemo(() => 
    users.filter(u => 
      u.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.phone.includes(searchKeyword)
    ),
    [users, searchKeyword]
  )

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        status: 'active',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      toast.error(t('fill_required'))
      return
    }
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))

    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                status: formData.status,
              }
            : user
        )
      )
      toast.success(tCommon('update_success'))
    } else {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id), 0) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        joinDate: new Date().toISOString().split('T')[0],
        status: formData.status,
      }
      setUsers([newUser, ...users])
      toast.success(tCommon('create_success'))
    }

    setLoading(false)
    setIsModalOpen(false)
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setUsers(users.filter((user) => user.id !== deletingUser.id))
    toast.success(tCommon('delete_success'))
    setIsDeleteModalOpen(false)
    setDeletingUser(null)
    setLoading(false)
  }

  const columns = [
    {
      key: 'name',
      label: t('full_name'),
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <UserIcon size={14} className="text-gray-400" />
          <span className="font-bold uppercase tracking-tight text-near-black dark:text-white">{val}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: t('email_address'),
      sortable: true,
      render: (val: string) => (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={12} className="text-gray-400" />
          {val}
        </div>
      )
    },
    {
      key: 'role',
      label: t('role'),
      render: (val: string) => (
        <Badge variant="outline" className="uppercase text-[9px] tracking-widest font-bold border-gray-200 dark:border-neutral-800">
          {val}
        </Badge>
      )
    },
    {
      key: 'joinDate',
      label: t('join_date'),
      sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400">
          <Calendar size={12} />
          {v}
        </div>
      )
    },
    {
      key: 'status',
      label: t('status'),
      align: 'center' as const,
      render: (val: string) => (
        <Badge variant={val === 'active' ? 'success' : 'destructive'} className="uppercase text-[9px] tracking-widest font-bold">
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      align: 'right' as const,
      render: (_: any, row: User) => (
        <div className="flex items-center justify-end gap-1">
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
              setDeletingUser(row)
              setIsDeleteModalOpen(true)
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ]

  useAdminPage({
    titleKey: 'manage_users',
    subtitleKey: 'users_subtitle',
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('search_users')}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          variant="brand"
          onClick={() => handleOpenModal()}
          className="uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-10 px-6"
        >
          <Plus size={16} className="mr-2" />
          {t('add_user')}
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-dark-surface rounded-sm overflow-hidden shadow-sm">
        <DataTable 
          columns={columns} 
          data={filteredUsers} 
          pagination={{
              currentPage: 1,
              pageSize: 10,
              total: filteredUsers.length,
              onPageChange: () => {},
          }}
        />
      </div>

      {/* User Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="uppercase tracking-tighter text-2xl font-black italic">
              {editingUser ? t('edit_user') : t('add_new_user')}
            </DialogTitle>
            <DialogDescription className="italic text-gray-400">
              {editingUser ? 'Update user account information' : 'Create a new administrative or customer account'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-6 py-6 font-porsche">
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('full_name')} *</Label>
              <Input
                placeholder={t('placeholder_fullname')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="font-bold uppercase h-11"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('email_address')} *</Label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder={t('placeholder_email')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-11 italic text-xs"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('phone_number')}</Label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder={t('placeholder_phone')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-11 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('role')}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer" className="uppercase text-[10px] font-bold">{t('customer')}</SelectItem>
                    <SelectItem value="staff" className="uppercase text-[10px] font-bold">{t('staff')}</SelectItem>
                    <SelectItem value="admin" className="uppercase text-[10px] font-bold">{t('admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">{t('status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="h-11 font-bold uppercase text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="uppercase text-[10px] font-bold text-green-600">{t('active')}</SelectItem>
                    <SelectItem value="inactive" className="uppercase text-[10px] font-bold text-red-600">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="border-t pt-6 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="uppercase text-xs font-bold tracking-widest">
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="brand" loading={loading} className="uppercase text-xs font-bold tracking-widest h-11 px-8">
                {tCommon('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteModalOpen}
        title={t('confirm_delete')}
        description={t('are_you_sure')}
        itemLabel={deletingUser?.name}
        confirmLabel={t('delete')}
        cancelLabel={tCommon('cancel')}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setDeletingUser(null)
        }}
        loading={loading}
      />
    </div>
  )
}
