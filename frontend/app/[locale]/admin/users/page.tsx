'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl';
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/admin/button'
import { useAdminPage } from '@/components/admin/admin-page-context'

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
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    status: 'active' as 'active' | 'inactive',
  })

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      setAlertMessage(tCommon('submit'))
      setShowAlert(true)
      return
    }

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
    }

    setIsModalOpen(false)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDelete = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
    setDeleteConfirmId(null)
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      customer: t('customer'),
      staff: t('staff'),
      admin: t('admin'),
    }
    return roleMap[role] || role
  }

  const getStatusLabel = (status: string) => {
    return status === 'active' ? t('active') : t('inactive')
  }

  useAdminPage({
    titleKey: 'manage_users',
    subtitleKey: 'users_subtitle',
    actions: (
      <Button
        variant="primary"
        icon={<Plus size={18} />}
        onClick={() => handleOpenModal()}
      >
        {t('add_user')}
      </Button>
    ),
  })

  return (
    <div className="space-y-6">

      {/* Success Alert */}
      {showAlert && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-sm border border-green-200 dark:border-green-900/50">
          {alertMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-sm border border-gray-200 dark:border-dark-surface">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-dark-surface">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('phone_number')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('join_date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-surface">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{getRoleLabel(user.role)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.joinDate}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title={t('edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(user.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-sm w-full max-w-md shadow-lg max-h-96 overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-surface">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? t('edit_user') : t('add_new_user')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {editingUser ? '' : t('create_new_user')}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('full_name')} *
                </label>
                <input
                  type="text"
                  placeholder={t('placeholder_fullname')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-surface rounded-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('email_address')} *
                </label>
                <input
                  type="email"
                  placeholder={t('placeholder_email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-surface rounded-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('phone_number')}
                </label>
                <input
                  type="tel"
                  placeholder={t('placeholder_phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-surface rounded-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('role')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  aria-label={t('role')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-surface rounded-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="customer">{t('customer')}</option>
                  <option value="staff">{t('staff')}</option>
                  <option value="admin">{t('admin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  aria-label={t('status')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-surface rounded-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-surface">
                <button
                  type="submit"
                  className="flex-1 bg-brand-red hover:bg-red-700 text-white font-medium py-2 rounded-sm transition-colors"
                >
                  {tCommon('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-medium py-2 rounded-sm transition-colors"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-sm w-full max-w-sm shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('confirm_delete')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('are_you_sure')}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-sm transition-colors"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-200 dark:bg-dark-surface hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white font-medium py-2 rounded-sm transition-colors"
              >
                {tCommon('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
