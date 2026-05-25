'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { ChevronRight } from 'lucide-react'
import { useAdminPage } from '@/components/admin/admin-page-context'

export function LanguageSettings() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const setLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  useAdminPage({
    titleKey: 'language',
    subtitleKey: 'settings_subtitle',
  })

  return (
    <div className="min-h-screen bg-white dark:bg-dark-surface">

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 md:px-16 py-12">
        <div className="space-y-4">
          {/* Vietnamese Option */}
          <button
            onClick={() => setLanguage('vi')}
            className={`w-full p-6 rounded-sm border-2 transition-all duration-300 ${
              locale === 'vi'
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
                    locale === 'vi'
                      ? 'border-white bg-white'
                      : 'border-gray-300'
                  }`}
                >
                  {locale === 'vi' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                {locale === 'vi' && <ChevronRight size={24} />}
              </div>
            </div>
          </button>

          {/* English Option */}
          <button
            onClick={() => setLanguage('en')}
            className={`w-full p-6 rounded-sm border-2 transition-all duration-300 ${
              locale === 'en'
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
                    locale === 'en'
                      ? 'border-white bg-white'
                      : 'border-gray-300'
                  }`}
                >
                  {locale === 'en' && (
                    <div className="w-3 h-3 rounded-full bg-black" />
                  )}
                </div>
                {locale === 'en' && <ChevronRight size={24} />}
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-8 bg-gray-50 rounded-sm space-y-4">
          <h3 className="text-lg font-light">
            {locale === 'vi' ? 'Thông tin' : 'Information'}
          </h3>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            {locale === 'vi'
              ? 'Khi bạn chọn một ngôn ngữ, toàn bộ trang web sẽ thay đổi thành ngôn ngữ đó. Tùy chọn ngôn ngữ của bạn sẽ được lưu lại và áp dụng cho lần truy cập tiếp theo.'
              : 'When you select a language, the entire website will change to that language. Your language preference will be saved and applied on your next visit.'}
          </p>
          <p className="text-sm text-gray-600 font-light leading-relaxed">
            {locale === 'vi'
              ? 'Bạn có thể thay đổi ngôn ngữ bất kỳ lúc nào bằng cách quay lại trang này.'
              : 'You can change the language at any time by returning to this page.'}
          </p>
        </div>

        {/* Current Language Display */}
        <div className="mt-8 p-6 border border-gray-200 rounded-sm">
          <p className="text-sm text-gray-600 mb-2">
            {locale === 'vi' ? 'Ngôn ngữ hiện tại' : 'Current Language'}:
          </p>
          <p className="text-2xl font-light">
            {locale === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇬🇧'}
          </p>
        </div>
      </main>
    </div>
  )
}
