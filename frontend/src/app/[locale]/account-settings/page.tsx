'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Minus, Edit2, Lock, Check, Eye, EyeOff, X, ChevronRight, Loader2 } from 'lucide-react'
import { profileService, type UserProfile } from '@/services/profile'
import { authService, getErrorMessage } from '@/services/auth'

// ─── Toast Component ─────────────────────────────────────────────────────────
interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 shadow-2xl rounded-sm text-sm font-light tracking-wide transition-all duration-300 ${
        type === 'success'
          ? 'bg-black text-white border-l-4 border-green-400'
          : 'bg-black text-white border-l-4 border-red-400'
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Inline Edit Field ────────────────────────────────────────────────────────
interface InlineFieldProps {
  label: string
  value: string
  onSave: (val: string) => Promise<void>
  inputType?: string
  placeholder?: string
}

function InlineField({ label, value, onSave, inputType = 'text', placeholder }: InlineFieldProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(value)
  }, [value, editing])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = !value

  return (
    <div className="flex items-start justify-between py-1">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-light mb-1 tracking-wide uppercase">{label}</p>
        {editing ? (
          <div className="flex items-center gap-3 mt-1">
            <input
              type={inputType}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={placeholder}
              className="border-b border-gray-400 focus:border-black outline-none bg-transparent text-sm font-light py-1 w-56 transition-colors"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-light tracking-[0.1em] text-black underline hover:no-underline disabled:opacity-50"
            >
              {saving ? '...' : 'Lưu'}
            </button>
            <button
              onClick={() => { setDraft(value); setEditing(false) }}
              className="text-xs font-light tracking-[0.1em] text-gray-500 hover:text-black"
            >
              Hủy
            </button>
          </div>
        ) : (
          <p className="font-light text-sm mt-0.5">{value || <span className="text-gray-400 italic">{placeholder}</span>}</p>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs font-light text-gray-500 hover:text-black transition-colors mt-1"
        >
          {isEmpty ? <Plus size={13} /> : <Edit2 size={13} />}
          <span className="tracking-[0.08em]">{isEmpty ? `Thêm ${label.toLowerCase()}` : 'Chỉnh sửa'}</span>
        </button>
      )}
    </div>
  )
}

// ─── Address Autocomplete Field ────────────────────────────────────────────────
interface AddressAutocompleteFieldProps {
  label: string
  value: string
  placeholder: string
  onSave: (address: string, city: string, country: string) => Promise<void>
}

function AddressAutocompleteField({ label, value, placeholder, onSave }: AddressAutocompleteFieldProps) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState(value)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editing) {
      setQuery(value)
      setSuggestions([])
    }
  }, [value, editing])

  useEffect(() => {
    if (!editing || !query.trim() || query === value) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=vi&addressdetails=1`)
        if (res.ok) {
           const data = await res.json()
           setSuggestions(data)
        }
      } catch (e) {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query, editing, value])

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = async (item: any) => {
    setSaving(true)
    try {
      const addr = item.display_name
      const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state || ''
      const country = item.address?.country || 'Việt Nam'
      await onSave(addr, city, country)
      setQuery(addr)
      setSuggestions([])
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const isEmpty = !value

  return (
    <div className="flex items-start justify-between py-1 w-full" ref={containerRef}>
      <div className="flex-1 w-full relative">
        <p className="text-gray-500 text-xs font-light mb-1 tracking-wide uppercase">{label}</p>
        
        {editing ? (
          <div className="mt-1 w-full max-w-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="border-b border-gray-400 focus:border-black outline-none bg-transparent text-sm font-light py-1 w-full transition-colors pr-6"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="w-3 h-3 animate-spin absolute right-1 top-2 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => { setQuery(value); setEditing(false); setSuggestions([]) }}
                className="text-xs font-light tracking-[0.1em] text-gray-500 hover:text-black shrink-0"
              >
                Hủy
              </button>
            </div>
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full max-w-sm mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={saving}
                    className="w-full text-left px-4 py-3 text-sm font-light hover:bg-gray-50 border-b border-gray-100 last:border-0 truncate transition-colors"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
            {query && !loading && suggestions.length === 0 && query !== value && (
               <div className="absolute z-10 w-full max-w-sm mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-4 text-xs font-light text-gray-500">
                  Không tìm thấy địa chỉ phù hợp
               </div>
            )}
          </div>
        ) : (
          <p className="font-light text-sm mt-0.5 max-w-lg leading-relaxed">
            {value || <span className="text-gray-400 italic">{placeholder}</span>}
          </p>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs font-light text-gray-500 hover:text-black transition-colors mt-1 shrink-0"
        >
          {isEmpty ? <Plus size={13} /> : <Edit2 size={13} />}
          <span className="tracking-[0.08em]">{isEmpty ? 'Thêm địa chỉ' : 'Chỉnh sửa'}</span>
        </button>
      )}
    </div>
  )
}

// ─── Accordion Section ────────────────────────────────────────────────────────
interface AccordionProps {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Accordion({ title, open, onToggle, children }: AccordionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 hover:bg-gray-50/50 transition-colors text-left group"
        aria-expanded={open}
      >
        <h3 className="text-base font-light tracking-[0.04em] group-hover:text-gray-700 transition-colors">{title}</h3>
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {open ? <Minus size={20} /> : <Plus size={20} />}
        </span>
      </button>
      {open && (
        <div className="pb-8 space-y-5 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AccountSettings() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'payment' | 'users'>('personal')

  const [expandedSections, setExpandedSections] = useState({
    name: true,
    email: false,
    phone: false,
    address: false,
  })

  // Password change form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile()
        setProfile(data)
      } catch {
        const cached = authService.getUser()
        if (cached) {
          setProfile({
            id: cached.id,
            fullName: cached.fullName,
            username: cached.username,
            email: cached.email,
            status: cached.status,
            enabled: cached.enabled,
          })
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Update profile field helpers
  const updateField = async (field: keyof UserProfile, value: string) => {
    if (!profile) return
    const updated = { ...profile, [field]: value } as UserProfile
    const payload = {
      fullName: updated.fullName || '',
      phone: updated.phone,
      birthDate: updated.birthDate,
      address: updated.address,
      city: updated.city,
      country: updated.country,
    }
    try {
      const saved = await profileService.updateProfile(payload)
      setProfile(saved)
      if (field === 'fullName') {
        const cached = authService.getUser()
        if (cached) {
          sessionStorage.setItem('user', JSON.stringify({ ...cached, fullName: saved.fullName }))
        }
      }
      showToast('Lưu hồ sơ thành công', 'success')
    } catch (e) {
      showToast(getErrorMessage(e) || 'Lưu thất bại. Vui lòng thử lại.', 'error')
      throw e
    }
  }
  
  const updateAddressFields = async (address: string, city: string, country: string) => {
    if (!profile) return
    const payload = {
      fullName: profile.fullName || '',
      phone: profile.phone,
      birthDate: profile.birthDate,
      address,
      city,
      country,
    }
    try {
      const saved = await profileService.updateProfile(payload)
      setProfile(saved)
      showToast('Lưu hồ sơ thành công', 'success')
    } catch (e) {
      showToast(getErrorMessage(e) || 'Lưu thất bại. Vui lòng thử lại.', 'error')
      throw e
    }
  }

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Completion percent calculation
  const getCompletionPercent = () => {
    if (!profile) return 0
    const fields = [profile.fullName, profile.email, profile.phone, profile.birthDate, profile.address]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const completionPercent = getCompletionPercent()

  // Checklist items
  const checklist = [
    { key: 'Tên', done: !!profile?.fullName },
    { key: 'Ngày sinh', done: !!profile?.birthDate },
    { key: 'E-mail', done: !!profile?.email },
    { key: 'Số điện thoại', done: !!profile?.phone },
    { key: 'Địa chỉ', done: !!profile?.address },
  ]

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('Mật khẩu mới không khớp', 'error')
      return
    }
    setPwSaving(true)
    try {
      await profileService.changePassword(pwForm)
      showToast('Đổi mật khẩu thành công', 'success')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (e) {
      showToast(getErrorMessage(e) || 'Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.', 'error')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-light text-sm tracking-widest">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-extralight mb-3 text-black tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-gray-400 font-light text-sm mb-10">{profile?.email}</p>

        {/* Tab Navigation */}
        <div className="flex gap-0 mb-12 border-b border-gray-200 overflow-x-auto select-none">
          {[
            { id: 'personal', label: 'Thông tin cá nhân' },
            { id: 'security', label: 'Đăng nhập & Bảo mật' },
            { id: 'payment', label: 'Phương thức thanh toán' },
            { id: 'users', label: 'Người dùng phụ' },
          ].map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-4 px-1 mr-8 font-light text-sm tracking-[0.06em] border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PERSONAL TAB ─────────────────────────────────────────────── */}
        {activeTab === 'personal' && (
          <div className="space-y-10">
            {/* Completion Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-sm p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-light tracking-[0.12em] uppercase mb-2">Hoàn thiện hồ sơ Porsche của bạn</p>
                  <h2 className="text-2xl md:text-3xl font-extralight mb-3 leading-snug">Giành chiến thắng trong cuộc đua dữ liệu.</h2>
                  <p className="text-gray-500 font-light text-sm leading-relaxed max-w-md">Bạn sắp hoàn tất rồi. Hãy điền đầy đủ để chúng tôi phục vụ bạn tốt hơn.</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all duration-700"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <span className="text-3xl font-extralight">{completionPercent}%</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                {checklist.map(item => (
                  <div key={item.key} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.done ? 'bg-black' : 'bg-gray-200'
                    }`}>
                      {item.done
                        ? <Check size={11} className="text-white" strokeWidth={2.5} />
                        : <Plus size={10} className="text-gray-400" strokeWidth={2} />
                      }
                    </div>
                    <span className={`text-xs font-light tracking-[0.04em] ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                      {item.key}
                    </span>
                  </div>
                ))}
              </div>

              {completionPercent < 100 && (
                <button
                  onClick={() => toggleSection('name')}
                  className="mt-8 px-6 py-3 bg-black text-white text-xs font-light tracking-[1.5px] uppercase hover:bg-gray-900 transition-colors rounded-sm"
                >
                  Hoàn tất hồ sơ của bạn
                </button>
              )}
            </div>

            {/* Accordion Sections */}
            <div className="border-t border-gray-200">
              {/* Name & Birth */}
              <Accordion title="Họ tên & Ngày sinh" open={expandedSections.name} onToggle={() => toggleSection('name')}>
                <div className="space-y-5">
                  <InlineField
                    label="Họ tên"
                    value={profile?.fullName || ''}
                    onSave={val => updateField('fullName', val)}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                  <div className="border-t border-gray-100 pt-5">
                    <InlineField
                      label="Ngày sinh"
                      value={profile?.birthDate || ''}
                      onSave={val => updateField('birthDate', val)}
                      inputType="date"
                      placeholder="Không có ngày sinh."
                    />
                  </div>
                </div>
              </Accordion>

              {/* Email */}
              <Accordion title="Địa chỉ email" open={expandedSections.email} onToggle={() => toggleSection('email')}>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 font-light tracking-[0.12em] uppercase mb-3">Địa chỉ email ưa thích</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Lock size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-light">Porsche ID</p>
                        <p className="font-light text-sm">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-4 p-3 bg-gray-50 rounded-sm">
                      <ChevronRight size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-500 font-light leading-relaxed">Bạn có thể thay đổi Porsche ID trong mục Đăng nhập & Bảo mật.</p>
                    </div>
                  </div>
                </div>
              </Accordion>

              {/* Phone */}
              <Accordion title="Số điện thoại" open={expandedSections.phone} onToggle={() => toggleSection('phone')}>
                <InlineField
                  label="Điện thoại"
                  value={profile?.phone || ''}
                  onSave={val => updateField('phone', val)}
                  inputType="tel"
                  placeholder="+84 xxx xxx xxx"
                />
              </Accordion>

              {/* Address */}
              <Accordion title="Thông tin địa chỉ" open={expandedSections.address} onToggle={() => toggleSection('address')}>
                <div className="space-y-5">
                  <AddressAutocompleteField
                    label="Địa chỉ & Quốc gia"
                    value={profile?.address || ''}
                    placeholder="Nhập và chọn địa chỉ của bạn"
                    onSave={updateAddressFields}
                  />
                  
                  {/* Readonly contextual fields if they exist */}
                  {(profile?.city || profile?.country) && (
                    <div className="pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                      <div>
                         <p className="text-gray-500 text-xs font-light tracking-wide uppercase mb-1">Thành phố</p>
                         <p className="font-light text-sm">{profile.city || '--'}</p>
                      </div>
                      <div>
                         <p className="text-gray-500 text-xs font-light tracking-wide uppercase mb-1">Quốc gia</p>
                         <p className="font-light text-sm">{profile.country || '--'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Accordion>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ──────────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-10">
            {/* Email Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-base font-light tracking-[0.04em] mb-5">Porsche ID (Email)</h3>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-sm">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <Lock size={14} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-light">Porsche ID</p>
                  <p className="font-light text-sm">{profile?.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-light mt-3 leading-relaxed">
                Porsche ID là địa chỉ email bạn sử dụng để đăng nhập. Liên hệ bộ phận hỗ trợ để thay đổi.
              </p>
            </div>

            {/* Change Password */}
            <div>
              <h3 className="text-base font-light tracking-[0.04em] mb-6">Đổi mật khẩu</h3>
              <form onSubmit={handleChangePassword} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs text-gray-400 font-light tracking-[0.12em] uppercase mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      id="current-password"
                      type={showCurrentPw ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      className="w-full border-b border-gray-300 focus:border-black outline-none py-2 pr-10 font-light text-sm bg-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-0 top-2 text-gray-400 hover:text-gray-700"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs text-gray-400 font-light tracking-[0.12em] uppercase mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPw ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                      minLength={8}
                      className="w-full border-b border-gray-300 focus:border-black outline-none py-2 pr-10 font-light text-sm bg-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-0 top-2 text-gray-400 hover:text-gray-700"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.newPassword && pwForm.newPassword.length < 8 && (
                    <p className="text-xs text-red-500 font-light mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs text-gray-400 font-light tracking-[0.12em] uppercase mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPw ? 'text' : 'password'}
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      className="w-full border-b border-gray-300 focus:border-black outline-none py-2 pr-10 font-light text-sm bg-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-0 top-2 text-gray-400 hover:text-gray-700"
                    >
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                    <p className="text-xs text-red-500 font-light mt-1">Mật khẩu không khớp</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    id="btn-change-password"
                    type="submit"
                    disabled={pwSaving || pwForm.newPassword !== pwForm.confirmPassword}
                    className="px-8 py-3 bg-black text-white text-xs font-light tracking-[1.5px] uppercase hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-sm"
                  >
                    {pwSaving ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── PAYMENT TAB ────────────────────────────────────────────────── */}
        {activeTab === 'payment' && (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-light text-sm">Chức năng thanh toán đang được phát triển.</p>
          </div>
        )}

        {/* ── USERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-light text-sm">Chức năng người dùng phụ đang được phát triển.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-300 font-light text-center leading-relaxed">
            © 2026 Porsche Sales & Marketplace, Inc. — Thông báo pháp lý | Quyền riêng tư
          </p>
        </div>
      </footer>
    </div>
  )
}
