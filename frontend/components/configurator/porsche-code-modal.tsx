'use client'

import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import Image from 'next/image'

interface PorscheCodeModalProps {
  open: boolean
  onClose: () => void
  porscheCode: string
  modelImage: string
}

export function PorscheCodeModal({
  open,
  onClose,
  porscheCode,
  modelImage,
}: PorscheCodeModalProps) {
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  if (!open) return null

  const codeChars = porscheCode.split('')
  const porscheLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/configurator/${porscheCode}`

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(porscheCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(porscheLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      //fallback
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl max-w-[520px] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Car image */}
        <div className="relative w-full h-48 md:h-56 bg-gray-50 rounded-t-2xl overflow-hidden">
          <Image
            src={modelImage}
            alt="Porsche"
            fill
            unoptimized
            className="object-contain p-4"
          />
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-6">
          <h3 className="text-xl md:text-2xl font-light text-near-black mb-3">
            Mã Porsche dành cho cấu hình xe của bạn
          </h3>
          <p className="text-sm text-dark-gray font-light mb-6 leading-relaxed">
            Với Mã Porsche, bạn có thể truy cập lại cấu hình xe của mình bất cứ lúc nào và chia sẻ nó với
            đại lý Porsche hoặc những người khác. Chỉ cần nhập mã hiển thị trên trang chọn mẫu xe, ví
            dụ, hoặc đơn giản là sao chép liên kết được tạo đến cấu hình xe của bạn.
          </p>

          {/* Code display */}
          <div className="bg-gray-100 rounded p-3 mb-2 flex items-center justify-between">
            <div className="flex items-center">
              {codeChars.map((char, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-center text-sm text-near-black px-3 ${
                    idx < codeChars.length - 1 ? 'border-r border-light-gray-surface' : ''
                  }`}
                >
                  {char}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs text-dark-gray hover:text-near-black transition-colors pr-2"
            >
              {codeCopied ? (
                <>
                  <Check size={14} strokeWidth={1.5} className="text-green-600" />
                  <span className="text-green-600">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={1.5} />
                  <span>Sao chép mã</span>
                </>
              )}
            </button>
          </div>

          {/* Link display */}
          <div className="bg-gray-100 rounded p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0 pl-3">
              <span className="text-sm text-dark-gray font-light truncate">
                https://porsche-code.com/
              </span>
              <span className="text-sm font-medium text-near-black">{porscheCode}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-dark-gray hover:text-near-black transition-colors pr-2 flex-shrink-0"
            >
              {linkCopied ? (
                <>
                  <Check size={14} strokeWidth={1.5} className="text-green-600" />
                  <span className="text-green-600">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={1.5} />
                  <span>Sao chép liên kết</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            Để lưu cấu hình xe của bạn vĩnh viễn vào hồ sơ Porsche ID và có thể truy cập từ bất cứ đâu,
            hãy sử dụng nút &ldquo;Lưu&rdquo; trong trình cấu hình.
          </p>
        </div>
      </div>
    </div>
  )
}
