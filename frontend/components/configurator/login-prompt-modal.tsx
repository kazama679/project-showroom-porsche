'use client'

import { X, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LoginPromptModalProps {
  modelImage: string
  onClose: () => void
}

export function LoginPromptModal({ modelImage, onClose }: LoginPromptModalProps) {
  const pathname = usePathname()

  const benefits = [
    'Lưu trữ vĩnh viễn các bản dựng của bạn',
    'Truy cập từ mọi thiết bị',
    'Được tiếp cận với nhiều dịch vụ của Porsche',
    'Nội dung và ưu đãi độc quyền',
  ]

  // Add the returnUrl so that after login, they come back to the configurator
  const loginUrl = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl max-w-[500px] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Car image */}
        <div className="relative w-full h-48 md:h-56 bg-white rounded-t-2xl overflow-hidden mt-6">
          <Image
            src={modelImage}
            alt="Porsche"
            fill
            unoptimized
            className="object-contain p-4"
          />
        </div>

        {/* Text content */}
        <div className="px-8 pb-8 text-left">
          <h3 className="text-xl md:text-2xl font-light text-[#181818] mb-4">
            Để lưu cấu hình này, hãy đăng nhập bằng ID Porsche của bạn hoặc đăng ký.
          </h3>
          <p className="text-sm text-[#444] font-light mb-6">
            Để lưu cấu hình xe của bạn, hãy đăng nhập bằng ID Porsche của bạn. Nếu bạn chưa có ID Porsche, bạn có thể đăng ký dễ dàng và tận hưởng những lợi ích sau:
          </p>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#181818] mb-3">Ưu điểm của Porsche ID</h4>
            <ul className="space-y-2">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#444] font-light">
                  <Check size={16} strokeWidth={2} className="text-[#181818] mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={loginUrl}
            className="w-full py-4 bg-black text-white rounded-md text-sm font-medium hover:bg-[#222] transition-colors flex items-center justify-center gap-2"
          >
            Đăng nhập và lưu bản dựng
          </Link>
        </div>
      </div>
    </div>
  )
}
