'use client'

import Link from 'next/link'
import { Menu, Globe, Heart, User } from 'lucide-react'

export function ConfiguratorHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            type="button"
            aria-label="Menu"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <Link href="/" className="hidden sm:block text-sm font-light tracking-wide hover:opacity-80">
            Porsche.com
          </Link>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Porsche home">
          <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
            <circle cx="16" cy="16" r="15" fill="none" stroke="white" strokeWidth="1" />
            <text
              x="16"
              y="20"
              textAnchor="middle"
              fill="white"
              fontSize="9"
              fontFamily="serif"
              fontWeight="600"
            >
              P
            </text>
          </svg>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/saved-vehicles"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="My saved vehicles"
          >
            <Heart size={18} strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            aria-label="Change country or region"
            className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
          >
            <Globe size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="My Porsche menu"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <User size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
}
