'use client'

import { useState } from 'react'
import { Menu, X, User, ChevronDown, ChevronUp, Plus, Minus, Edit2, Lock } from 'lucide-react'

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState('personal')
  const [expandedSections, setExpandedSections] = useState({
    birthDate: true,
    email: false,
    phone: false,
    notifications: false,
    address: false,
    country: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button aria-label="Menu" className="md:hidden">
            <Menu size={24} />
          </button>
          <h1 className="text-base font-medium tracking-[0.15em]">PORSCHE</h1>
          <button aria-label="Account">
            <User size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Page Title */}
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-black">Cài đặt hộ số</h1>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-12 border-b border-gray-300">
          {[
            { id: 'personal', label: 'Thông tin cá nhân' },
            { id: 'users', label: 'Người dùng phụ' },
            { id: 'security', label: 'Đăng nhập & Bảo mật' },
            { id: 'payment', label: 'Phương thức thanh toán' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-light text-sm tracking-[0.08px] border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Completion Card */}
        <div className="bg-gray-100 rounded-[2px] p-12 mb-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-light text-gray-600 mb-2">Hoàn thành hộ số</h2>
              <h3 className="text-3xl font-light mb-4">Giành chiến thắng trong cuộc đua dữ liệu.</h3>
              <p className="text-gray-600 font-light text-sm">
                Bạn sắp hoàn tất rồi. Hãy điền đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn tốt nhất.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-32 h-1 bg-gray-300 rounded-full mb-2 overflow-hidden">
                <div className="w-[40%] h-full bg-black"></div>
              </div>
              <span className="text-3xl font-light">40%</span>
            </div>
          </div>

          {/* Checklist Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-light text-sm">Dữ liệu cá nhân</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-light text-sm">Tên</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">+</span>
                </div>
                <span className="font-light text-sm text-gray-600">Ngày sinh</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-light text-sm">Thông tin liên hệ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-light text-sm">E-mail</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">+</span>
                </div>
                <span className="font-light text-sm text-gray-600">Số điện thoại di động</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">+</span>
                </div>
                <span className="font-light text-sm text-gray-600">Địa chỉ</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">+</span>
                </div>
                <span className="font-light text-sm text-gray-600">Địa chỉ</span>
              </div>
            </div>
          </div>

          <button className="mt-12 px-6 py-3 bg-black text-white font-light text-sm tracking-[1.28px] rounded-[2px] hover:bg-opacity-90 transition-all">
            Hoàn tất hộ số của bạn
          </button>
        </div>

        {/* Account Info Sections */}
        <div className="space-y-0 border-t border-gray-300">
          {/* Birth Date Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('birthDate')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Hộ và ngày sinh</h3>
              {expandedSections.birthDate ? <Minus size={24} /> : <Plus size={24} />}
            </button>
            {expandedSections.birthDate && (
              <div className="pb-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-light mb-1">Tên</p>
                    <h4 className="text-lg font-light">Quang Nguyễn</h4>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mt-2 font-light">
                      <Edit2 size={16} />
                      Biên tập
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-500 text-sm font-light mb-2">Ngày sinh</p>
                  <p className="text-gray-600 font-light">Không có ngày sinh cụ thể.</p>
                  <button className="mt-4 px-4 py-2 border border-gray-400 text-sm font-light rounded-[2px] hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Plus size={16} />
                    Thêm ngày sinh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('email')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Địa chỉ email</h3>
              {expandedSections.email ? <Minus size={24} /> : <Plus size={24} />}
            </button>
            {expandedSections.email && (
              <div className="pb-6 space-y-4">
                <div className="space-y-3">
                  <p className="text-gray-500 text-sm font-light">Địa chỉ email ưa thích</p>
                  <div className="flex items-center gap-3">
                    <Lock size={18} className="text-gray-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-light">Porsche ID</p>
                      <p className="font-light">quantglienha123@gmail.com</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm font-light flex items-start gap-2 mt-2">
                    <span>→</span>
                    Bạn có thể thay đổi ID Porsche của mình trong mục Đăng nhập & Bảo mật.
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-400 text-sm font-light rounded-[2px] hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  Thêm địa chỉ email
                </button>
              </div>
            )}
          </div>

          {/* Phone Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('phone')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Số điện thoại</h3>
              {expandedSections.phone ? <Minus size={24} /> : <Plus size={24} />}
            </button>
            {expandedSections.phone && (
              <div className="pb-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-sm font-light mb-2">Số điện thoại ưu tiên</p>
                  <p className="text-gray-600 font-light">Bạn chưa lưu số điện thoại nào.</p>
                </div>
                <button className="px-4 py-2 border border-gray-400 text-sm font-light rounded-[2px] hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  Thêm số điện thoại
                </button>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('notifications')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Thông báo</h3>
              {expandedSections.notifications ? <Minus size={24} /> : <Plus size={24} />}
            </button>
          </div>

          {/* Address Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('address')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Địa chỉ</h3>
              {expandedSections.address ? <Minus size={24} /> : <Plus size={24} />}
            </button>
          </div>

          {/* Country Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => toggleSection('country')}
              className="w-full flex items-center justify-between py-6 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-light">Quốc gia</h3>
              {expandedSections.country ? <Minus size={24} /> : <Plus size={24} />}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white text-xs py-8 px-6 md:px-12 mt-16">
        <div className="max-w-6xl mx-auto text-center space-y-2 font-light">
          <p>© 2026 Porsche Sales & Marketplace, Inc. Thông báo pháp lý | Quyền con người và quyền kinh doanh | Thông báo về quyền riêng tư | Quyền riêng tư của California | Không bán hoặc chia sẻ thông tin cá nhân của tôi | Thông báo về phần mềm mã nguồn mở | Tuyên bố về khả năng tiếp cận.</p>
        </div>
      </footer>
    </div>
  )
}
