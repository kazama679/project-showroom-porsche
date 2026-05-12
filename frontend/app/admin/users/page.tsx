'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

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
  const { t } = useLanguage()
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
    status: 'active' as const,
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
      setAlertMessage(t('common.submit'))
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
      customer: t('admin.customer'),
      staff: t('admin.staff'),
      admin: t('admin.admin'),
    }
    return roleMap[role] || role
  }

  const getStatusLabel = (status: string) => {
    return status === 'active' ? t('admin.active') : t('admin.inactive')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.manage_users')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('admin.total_users')}: {users.length}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#DA291C] hover:bg-[#C02015] text-white px-4 py-2 rounded-[2px] font-medium transition-colors"
        >
          <Plus size={20} />
          {t('admin.add_user')}
        </button>
      </div>

      {/* Success Alert */}
      {showAlert && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-[2px] border border-green-200 dark:border-green-900/50">
          {alertMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-[#1A1A1A] rounded-[2px] border border-gray-200 dark:border-[#303030]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#303030]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.phone_number')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.join_date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#303030]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
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
                    title={t('admin.edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(user.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title={t('admin.delete')}
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
          <div className="bg-white dark:bg-[#1A1A1A] rounded-[2px] w-full max-w-md shadow-lg max-h-96 overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#303030]">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? t('admin.edit_user') : t('admin.add_new_user')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {editingUser ? '' : t('admin.create_new_user')}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.full_name')} *
                </label>
                <input
                  type="text"
                  placeholder={t('admin.placeholder_fullname')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DA291C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.email_address')} *
                </label>
                <input
                  type="email"
                  placeholder={t('admin.placeholder_email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DA291C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.phone_number')}
                </label>
                <input
                  type="tel"
                  placeholder={t('admin.placeholder_phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DA291C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.role')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DA291C]"
                >
                  <option value="customer">{t('admin.customer')}</option>
                  <option value="staff">{t('admin.staff')}</option>
                  <option value="admin">{t('admin.admin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#303030] rounded-[2px] bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DA291C]"
                >
                  <option value="active">{t('admin.active')}</option>
                  <option value="inactive">{t('admin.inactive')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[#303030]">
                <button
                  type="submit"
                  className="flex-1 bg-[#DA291C] hover:bg-[#C02015] text-white font-medium py-2 rounded-[2px] transition-colors"
                >
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-[#303030] hover:bg-gray-300 dark:hover:bg-[#404040] text-gray-900 dark:text-white font-medium py-2 rounded-[2px] transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-[2px] w-full max-w-sm shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.confirm_delete')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('admin.are_you_sure')}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-[2px] transition-colors"
              >
                {t('admin.delete')}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-gray-200 dark:bg-[#303030] hover:bg-gray-300 dark:hover:bg-[#404040] text-gray-900 dark:text-white font-medium py-2 rounded-[2px] transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
