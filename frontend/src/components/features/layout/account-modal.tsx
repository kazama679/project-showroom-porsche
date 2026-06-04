'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronRight, User } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      setUser(authService.getUser())
    }
  }, [open])

  useEffect(() => {
    if (!open || !mounted) return

    const clearSelection = () => window.getSelection()?.removeAllRanges()
    const previousBodyUserSelect = document.body.style.userSelect
    const previousHtmlUserSelect = document.documentElement.style.userSelect

    clearSelection()
    requestAnimationFrame(clearSelection)
    const timeoutId = window.setTimeout(clearSelection, 50)
    document.body.style.userSelect = 'none'
    document.documentElement.style.userSelect = 'none'
    document.addEventListener('selectionchange', clearSelection)

    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('selectionchange', clearSelection)
      document.body.style.userSelect = previousBodyUserSelect
      document.documentElement.style.userSelect = previousHtmlUserSelect
    }
  }, [open, mounted])

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

  if (!open || !mounted) return null

  const isLoggedIn = !!user

  const menuItems = [
    { label: tNav('models'), href: '/models', hasArrow: true },
    { label: tAccount('ai_chat'), href: '/advisory', hasArrow: true },
    { label: tNav('saved_vehicles'), href: '/saved-vehicles', hasArrow: false },
    { label: tAccount('sell_car'), href: '/sell-your-car', hasArrow: true },
    { label: tAccount('buy_used_car'), href: '/inventory', hasArrow: true },
    { label: tAccount('services'), href: '#', hasArrow: true },
    { label: tAccount('experience'), href: '#', hasArrow: true },
    { label: tAccount('find_dealer'), href: '#', hasArrow: true },
  ]

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

  const settingsItems = [
    { label: tAccount('profile'), href: '/account-settings' },
    { label: tAccount('privacy'), href: '#' },
  ]

  return createPortal(
    <div className="site-modal-layer inset-0 flex isolate">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="site-modal-panel flex w-full max-w-account-modal h-full animate-in slide-in-from-left duration-300">
        <div className="site-modal-panel w-advisory-sidebar bg-white h-full overflow-y-auto border-r border-gray-200 flex flex-col">
          <div className="flex-1 py-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between px-8 py-4 text-body-sm font-light text-near-black hover:bg-gray-100 transition-colors"
              >
                <span>{item.label}</span>
                {item.hasArrow && (
                  <ChevronRight size={18} strokeWidth={1.5} className="text-neutral-400" />
                )}
              </Link>
            ))}
          </div>

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

        <div className="flex-1 bg-white h-full overflow-y-auto relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-base"
            aria-label={tCommon('close')}
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="px-8 py-8 pt-16">
            {isLoggedIn ? (
              <>
                <h2 className="text-2xl font-light text-near-black mb-8">
                  {tAccount('welcome')}, {user.fullName}
                </h2>

                <div className="mb-8">
                  <p className="text-xs text-neutral-400 font-light uppercase tracking-wider mb-4">
                    {tAccount('services')}
                  </p>
                  <div className="space-y-0">
                    {serviceItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onClose}
                        className="block py-2.5 text-body-sm font-light text-near-black hover:text-dark-gray transition-colors"
                      >
                        {item.label}
                        {item.badge !== null && item.badge !== undefined && (
                          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-eyebrow text-near-black">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-xs text-neutral-400 font-light uppercase tracking-wider mb-4">
                    {tAccount('settings')}
                  </p>
                  <div className="space-y-0">
                    {settingsItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onClose}
                        className="block py-2.5 text-body-sm font-light text-near-black hover:text-dark-gray transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full max-w-compact-action py-3.5 border border-light-gray-surface rounded-lg text-sm font-normal text-near-black hover:border-near-black hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? tAccount('logging_out') : tAccount('logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-account-state">
                <User size={40} strokeWidth={1} className="text-neutral-300 mb-4" />
                <h2 className="text-xl font-light text-near-black mb-2">
                  {tAuth('login_prompt')}
                </h2>
                <p className="text-sm text-dark-gray font-light mb-6 text-center max-w-comment-preview">
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
    </div>,
    document.body,
  )
}
