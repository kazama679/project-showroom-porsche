'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function ConfiguratorRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modelId = searchParams?.get('modelId')

  useEffect(() => {
    if (modelId) {
      router.replace(`/configurator/${modelId}`)
    } else {
      router.replace('/models')
    }
  }, [modelId, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-dark-gray" />
    </div>
  )
}

export default function ConfiguratorRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-dark-gray" />
        </div>
      }
    >
      <ConfiguratorRedirect />
    </Suspense>
  )
}
