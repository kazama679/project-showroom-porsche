'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { authService } from '@/services/auth'

export function DynamicAdminWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const checkAuth = async () => {
      // In a real scenario, this could also verify the session with the backend via getMe()
      // For now, if there's no auth info at all, or not admin, redirect.
      // We will allow users with role staff or admin to view the admin UI, but
      // the prompt says "bất kì source nào là /admin/ đều bị đẩy nếu chưa đăng nhập"
      const authenticated = authService.isAuthenticated()
      if (!authenticated) {
        router.push('/auth/login')
      } else {
        setIsAuthorized(true)
      }
    }
    checkAuth()
  }, [router])

  const t = useTranslations('common')
  if (!mounted || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
