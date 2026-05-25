'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HelpCircle, Loader2, CheckCircle } from 'lucide-react'
import { authService, getErrorMessage } from '@/lib/auth'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (searchParams) {
      const emailParam = searchParams.get('email')
      if (emailParam) setEmail(emailParam)
    }
  }, [searchParams])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length > 0) {
      const newCode = [...code]
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)
      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6 || !email) return

    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authService.verifyOtp({ email, otp: fullCode })
      setSuccess('Account verified successfully! Redirecting to login...')
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to resend OTP.')
      return
    }
    setResending(true)
    setError('')
    try {
      await authService.resendOtp(email)
      setSuccess('OTP has been resent to your email.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  const isComplete = code.every((digit) => digit !== '')

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://assets.identity.porsche.com/acul-screens/assets/images/bg.webp')` }} />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="text-lg font-light tracking-widest">PORSCHE</div>
          <button className="text-gray-400 hover:text-gray-600"><HelpCircle size={24} /></button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 overflow-y-auto">
          <div className="max-w-md">
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">Verify your email address</h1>
            <p className="text-gray-600 text-base mb-4 leading-relaxed">
              Please check your email inbox. We&apos;ve sent the verification code to:
            </p>
            <p className="text-gray-900 font-medium mb-8">{email || 'your email'}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm text-sm mb-6">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-sm text-sm flex items-center gap-2 mb-6">
                <CheckCircle size={16} />{success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">Enter code <span className="text-green-600">*</span></label>
                <div className="flex gap-3 justify-between">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={loading}
                      className="w-12 h-14 md:w-14 md:h-16 rounded-lg border-2 border-gray-300 text-center text-2xl font-semibold text-gray-900 focus:border-green-500 focus:outline-none focus:bg-green-50 transition-colors disabled:opacity-50"
                      placeholder="-"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-6">
                Didn&apos;t receive a code?{' '}
                <button type="button" onClick={handleResend} disabled={resending}
                  className="text-gray-900 underline font-semibold hover:text-gray-700 disabled:opacity-50">
                  {resending ? 'Sending...' : 'Resend'}
                </button>
              </p>

              <button type="submit" disabled={!isComplete || loading}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white py-3 rounded-full font-medium mt-8 transition-colors flex items-center justify-center gap-2">
                {loading ? (<><Loader2 size={18} className="animate-spin" />Verifying...</>) : 'Continue'}
              </button>
            </form>

            <div className="mt-8">
              <Link href="/auth/register" className="text-sm text-gray-900 underline font-semibold hover:text-gray-700">Back</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-md mx-auto text-center text-xs text-gray-500 space-y-2">
            <p>&copy; 2026 Porsche Sales &amp; Marketplace, Inc.</p>
            <div className="flex flex-wrap justify-center gap-3 text-gray-600">
              <Link href="#" className="underline hover:text-gray-900">Legal Notice</Link>
              <Link href="#" className="underline hover:text-gray-900">Privacy Notice</Link>
              <Link href="#" className="underline hover:text-gray-900">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>}>
      <VerifyForm />
    </Suspense>
  )
}
