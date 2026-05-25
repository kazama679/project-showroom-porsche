'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Globe, User, Bookmark } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { cn } from '@/lib/utils'
import { AccountModal } from './account-modal'

export type SiteHeaderProps = {
  /** Extra classes on the outer header element */
  className?: string
  /** Link target for the Porsche logo */
  logoHref?: string
  /** Show bookmark icon (configurator uses it in toolbar instead) */
  showBookmark?: boolean
  /** Called when menu button is clicked */
  onMenuClick?: () => void
  /** Sticky at top of viewport (default: scrolls with page) */
  sticky?: boolean
  /** Visual variant (transparent vs default solid) */
  variant?: 'default' | 'transparent'
}

/**
 * Global Porsche site header — reusable on configurator, models, showroom pages, etc.
 * By default scrolls away with the page; pair with a sticky sub-toolbar below.
 */
export function SiteHeader({
  className,
  logoHref = '/',
  showBookmark = false,
  onMenuClick,
  sticky = false,
  variant = 'default',
}: SiteHeaderProps) {
  const { t } = useLanguage()
  const [showAccountModal, setShowAccountModal] = useState(false)

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick()
    } else {
      // Default: open account modal
      setShowAccountModal(true)
    }
  }

  return (
    <>
      <header
        className={cn(
          'z-50',
          variant === 'transparent' ? 'bg-transparent absolute top-0 w-full' : 'bg-white border-b border-gray-200',
          sticky && 'sticky top-0',
          className
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleMenuClick}
            className={cn(
              "flex items-center gap-2.5 hover:opacity-70 transition-opacity min-w-[88px]",
              variant === 'transparent' ? 'text-white' : 'text-near-black'
            )}
            aria-label={t('nav.menu')}
          >
            <Menu size={20} strokeWidth={1.5} />
            <span className="text-sm font-light hidden sm:inline">{t('nav.menu')}</span>
          </button>

          <div className="flex-1 flex justify-center">
            <Link
              href={logoHref}
              className={cn(
                "text-lg md:text-xl font-medium tracking-[0.28em] hover:opacity-80 transition-opacity",
                variant === 'transparent' ? 'text-white' : 'text-near-black'
              )}
            >
              PORSCHE
            </Link>
          </div>

          <div className={cn(
            "flex items-center justify-end gap-4 md:gap-5 min-w-[88px]",
            variant === 'transparent' ? 'text-white' : 'text-near-black'
          )}>
            {showBookmark && (
              <button
                type="button"
                aria-label={t('nav.saved_vehicles')}
                className="hover:opacity-70 transition-opacity hidden md:block"
              >
                <Bookmark size={20} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              aria-label="Language"
              className="hover:opacity-70 transition-opacity hidden md:block"
            >
              <Globe size={20} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              aria-label="Account"
              className="hover:opacity-70 transition-opacity"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Account Modal */}
      <AccountModal
        open={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </>
  )
}
