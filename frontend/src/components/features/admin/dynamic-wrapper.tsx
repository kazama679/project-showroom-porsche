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
      const me = await authService.getMe()
      if (!me) {
        router.push('/auth/login')
      } else {
        const isAdmin = me.roles && me.roles.includes('ROLE_ADMIN');
        if (isAdmin) {
          setIsAuthorized(true)
        } else {
          router.push('/')
        }
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
