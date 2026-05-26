'use client'

import { useEffect, useState } from 'react'
import { X, ChevronRight, User } from 'lucide-react'
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { authService, AuthUser } from '@/services/auth'

interface AccountModalProps {
  open: boolean
  onClose: () => void
}

export function AccountModal({ open, onClose }: AccountModalProps) {
  const router = useRouter()
  const tNav = useTranslations('navigation')
  const tAccount = useTranslations('account')
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (open) {
      setUser(authService.getUser())
    }
  }, [open])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      setUser(null)
      onClose()
      router.push('/')
      router.refresh()
    } catch {
      // ignore
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!open) return null

  const isLoggedIn = !!user

  // Menu items for left panel
  const menuItems = [
    { label: tNav('models'), href: '/models', hasArrow: true },
    { label: tAccount('ai_chat'), href: '/advisory', hasArrow: true },
    { label: tAccount('Xe Đã Lưu'), href: '/saved-vehicles', hasArrow: false },
    { label: tAccount('services'), href: '#', hasArrow: true },
    { label: tAccount('experience'), href: '#', hasArrow: true },
    { label: tAccount('find_dealer'), href: '#', hasArrow: true },
  ]

  // Service items for right panel
  const serviceItems: { label: string; href: string; badge?: number | null }[] = [
    { label: tAccount('make_payment'), href: '#' },
    { label: tAccount('my_porsche_app'), href: '#' },
    { label: tAccount('messages'), href: '#' },
    { label: tAccount('saved_searches'), href: '#' },
    { label: tNav('saved_vehicles'), href: '/saved-vehicles' },
    { label: tAccount('connect_services'), href: '#' },
    { label: tAccount('bookings_orders'), href: '#' },
    { label: tAccount('contact_support'), href: '#' },
  ]

  // Settings items
  const settingsItems = [
    { label: tAccount('profile'), href: '/account-settings' },
    { label: tAccount('privacy'), href: '#' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel container - slides from left */}
      <div className="relative flex w-full max-w-[900px] h-full animate-in slide-in-from-left duration-300">
        {/* Left panel: navigation */}
        <div className="w-[320px] bg-white h-full overflow-y-auto border-r border-gray-200 flex flex-col">
          <div className="flex-1 py-6">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between px-8 py-4 text-[15px] font-light text-near-black hover:bg-gray-100 transition-colors"
              >
                <span>{item.label}</span>
                {item.hasArrow && (
                  <ChevronRight size={18} strokeWidth={1.5} className="text-neutral-400" />
                )}
              </Link>
            ))}
          </div>

          {/* Account button at bottom of left panel */}
          {isLoggedIn && (
            <div className="border-t border-gray-200 px-8 py-4">
              <div className="flex items-center gap-3">
                <User size={22} strokeWidth={1.5} className="text-near-black" />
                <div>
                  <p className="text-sm font-normal text-near-black">{tNav('account')}</p>
                  <p className="text-xs text-dark-gray font-light">{user.fullName}</p>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="text-neutral-400 ml-auto" />
              </div>
            </div>
          )}
        </div>

        {/* Right panel: account content */}
        <div className="flex-1 bg-white h-full overflow-y-auto relative">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
            aria-label={tCommon('close')}
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="px-8 py-8 pt-16">
            {isLoggedIn ? (
              <>
                {/* Greeting */}
                <h2 className="text-2xl font-light text-near-black mb-8">
                  {tAccount('welcome')}, {user.fullName}
                </h2>

                {/* Services */}
                <div className="mb-8">
                  <p className="text-xs text-neutral-400 font-light uppercase tracking-wider mb-4">
                    {tAccount('services')}
                  </p>
                  <div className="space-y-0">
                    {serviceItems.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onClose}
                        className="block py-2.5 text-[15px] font-light text-near-black hover:text-dark-gray transition-colors"
                      >
                        {item.label}
                        {item.badge !== null && item.badge !== undefined && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-[10px] text-near-black">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div className="mb-8">
                  <p className="text-xs text-neutral-400 font-light uppercase tracking-wider mb-4">
                    {tAccount('settings')}
                  </p>
                  <div className="space-y-0">
                    {settingsItems.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onClose}
                        className="block py-2.5 text-[15px] font-light text-near-black hover:text-dark-gray transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Logout button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full max-w-[280px] py-3.5 border border-light-gray-surface rounded-lg text-sm font-normal text-near-black hover:border-near-black hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? tAccount('logging_out') : tAccount('logout')}
                </button>
              </>
            ) : (
              /* Not logged in */
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <User size={40} strokeWidth={1} className="text-neutral-300 mb-4" />
                <h2 className="text-xl font-light text-near-black mb-2">
                  {tAuth('login_prompt')}
                </h2>
                <p className="text-sm text-dark-gray font-light mb-6 text-center max-w-[300px]">
                  {tAuth('login_desc')}
                </p>
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="px-8 py-3 bg-near-black text-white rounded-lg text-sm font-medium hover:bg-dark-surface transition-colors"
                >
                  {tNav('login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
