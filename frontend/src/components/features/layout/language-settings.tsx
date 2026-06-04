'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { ChevronRight, Globe, CheckCircle2, Info } from 'lucide-react'
import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Card, CardContent } from '@/components/base/ui/card'
import { Badge } from '@/components/base/ui/badge'

export function LanguageSettings() {
  const t = useTranslations('navigation')
  const tAdmin = useTranslations('admin')
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

  const languages = [
    {
      code: 'vi',
      label: 'Tiếng Việt',
      description: 'Vietnamese - Ngôn ngữ mặc định',
      flag: '🇻🇳'
    },
    {
      code: 'en',
      label: 'English',
      description: 'English - Default Language',
      flag: '🇬🇧'
    }
  ]

  return (
    <div className="max-w-4xl space-y-12 pb-20 font-porsche">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="brand" className="h-6 w-6 rounded-none p-0 flex items-center justify-center">
            <Globe size={12} />
          </Badge>
          <h2 className="uppercase tracking-porsche-wide text-xs font-bold text-gray-400">
            {tAdmin('select_language') || 'Select Regional Language Settings'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map((lang) => {
            const isSelected = locale === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`group relative text-left p-8 border transition-all duration-500 overflow-hidden ${
                  isSelected
                    ? 'border-brand-red bg-white dark:bg-neutral-900 shadow-xl'
                    : 'border-light-gray-surface dark:border-neutral-800 bg-white/50 dark:bg-dark-surface/50 hover:border-near-black dark:hover:border-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 p-4">
                    <CheckCircle2 size={24} className="text-brand-red" />
                  </div>
                )}
                
                <div className="space-y-4">
                  <span className="text-4xl block group-hover:scale-110 transition-transform duration-500">{lang.flag}</span>
                  <div>
                    <h3 className={`text-2xl font-black uppercase italic tracking-tighter transition-colors ${
                      isSelected ? 'text-near-black dark:text-white' : 'text-gray-400 group-hover:text-near-black dark:group-hover:text-white'
                    }`}>
                      {lang.label}
                    </h3>
                    <p className="text-eyebrow uppercase font-bold tracking-form-label text-gray-400 mt-1">
                      {lang.description}
                    </p>
                  </div>
                </div>

                <div className={`mt-8 flex items-center gap-2 text-eyebrow uppercase font-bold tracking-porsche-wide transition-all duration-500 ${
                  isSelected ? 'text-brand-red' : 'text-transparent group-hover:text-near-black dark:group-hover:text-white -translate-x-2.5 group-hover:translate-x-0'
                }`}>
                  {isSelected ? tAdmin('currently_selected') || 'Currently Selected' : tAdmin('switch_to') || 'Switch to Language'}
                  <ChevronRight size={14} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-none border-none bg-gray-50 dark:bg-neutral-900/50">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-2 text-brand-red">
              <Info size={16} />
              <h3 className="uppercase tracking-widest text-eyebrow font-bold">
                {locale === 'vi' ? 'Thông tin' : 'Information'}
              </h3>
            </div>
            <div className="space-y-4 text-xs font-bold uppercase tracking-widest leading-relaxed text-gray-500">
              <p>
                {locale === 'vi'
                  ? 'Khi bạn chọn một ngôn ngữ, toàn bộ trang web sẽ thay đổi thành ngôn ngữ đó. Tùy chọn ngôn ngữ của bạn sẽ được lưu lại và áp dụng cho lần truy cập tiếp theo.'
                  : 'When you select a language, the entire website will change to that language. Your language preference will be saved and applied on your next visit.'}
              </p>
              <p>
                {locale === 'vi'
                  ? 'Bạn có thể thay đổi ngôn ngữ bất kỳ lúc nào bằng cách quay lại trang này.'
                  : 'You can change the language at any time by returning to this page.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="p-8 border border-light-gray-surface dark:border-neutral-800 flex flex-col justify-center gap-6">
          <div className="space-y-1">
            <p className="text-eyebrow uppercase font-bold tracking-widest text-gray-400">
              {locale === 'vi' ? 'Ngôn ngữ hiện tại' : 'Current Language'}
            </p>
            <p className="text-4xl font-black italic uppercase tracking-tighter text-near-black dark:text-white">
              {locale === 'vi' ? 'Tiếng Việt' : 'English'}
            </p>
          </div>
          <div className="h-px w-12 bg-brand-red" />
          <p className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400 leading-loose">
            {locale === 'vi' 
              ? 'Trải nghiệm cá nhân hóa theo vùng lãnh thổ của bạn.' 
              : 'Personalized experience based on your regional settings.'}
          </p>
        </div>
      </div>
    </div>
  )
}
