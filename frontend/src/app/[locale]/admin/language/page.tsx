'use client'

import dynamic from 'next/dynamic'

const LanguageSettings = dynamic(
  () => import('@/components/features/layout/language-settings').then(mod => ({ default: mod.LanguageSettings })),
  {
    ssr: false,
  }
)

export default function LanguageSettingsPage() {
  return <LanguageSettings />
}
