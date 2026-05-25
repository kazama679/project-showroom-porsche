'use client'

import { useLanguage } from '@/lib/language-context'
import { ChevronRight } from 'lucide-react'

export function LanguageSettings() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light">Language Settings</h1>
            <p className="text-gray-600 text-sm mt-2">Chọn ngôn ngữ / Select your language</p>
          </div>
          <div className="text-2xl font-light text-gray-400">Cài đặt ngôn ngữ</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 md:px-16 py-12">
        <div className="space-y-4">
          {/* Vietnamese Option */}
          <button
            onClick={() => setLanguage('vi')}
            className={`w-full p-6 rounded-sm border-2 transition-all duration-300 ${
              language === 'vi'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-black hover:border-black'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xl font-light mb-2">Tiếng Việt</h3>
                <p className="text-sm opacity-75">Vietnamese - Ngôn ngữ mặc định</p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    language === 'vi'
                      ? 'border-white bg-white'
                      : 'border-gray-300'
                  }`}
                >
                  {language === 'vi' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                {language === 'vi' && <ChevronRight size={24} />}
              </div>
            </div>
          </button>

          {/* English Option */}
          <button
            onClick={() => setLanguage('en')}
            className={`w-full p-6 rounded-sm border-2 transition-all duration-300 ${
              language === 'en'
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-black hover:border-black'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xl font-light mb-2">English</h3>
                <p className="text-sm opacity-75">English - Default Language</p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    language === 'en'
                      ? 'border-white bg-white'
                      : 'border-gray-300'
                  }`}
                >
                  {language === 'en' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                {language === 'en' && <ChevronRight size={24} />}
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-8 bg-gray-50 rounded-sm space-y-4">
          <h3 className="text-lg font-light">
            {language === 'vi' ? 'Thông tin' : 'Information'}
          </h3>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            {language === 'vi'
              ? 'Khi bạn chọn một ngôn ngữ, toàn bộ trang web sẽ thay đổi thành ngôn ngữ đó. Tùy chọn ngôn ngữ của bạn sẽ được lưu lại và áp dụng cho lần truy cập tiếp theo.'
              : 'When you select a language, the entire website will change to that language. Your language preference will be saved and applied on your next visit.'}
          </p>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            {language === 'vi'
              ? 'Bạn có thể thay đổi ngôn ngữ bất kỳ lúc nào bằng cách quay lại trang này.'
              : 'You can change the language at any time by returning to this page.'}
          </p>
        </div>

        {/* Current Language Display */}
        <div className="mt-8 p-6 border border-gray-200 rounded-sm">
          <p className="text-sm text-gray-600 mb-2">
            {language === 'vi' ? 'Ngôn ngữ hiện tại' : 'Current Language'}:
          </p>
          <p className="text-2xl font-light">
            {language === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇬🇧'}
          </p>
        </div>
      </main>
    </div>
  )
}
