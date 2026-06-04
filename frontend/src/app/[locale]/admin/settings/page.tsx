'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, RotateCcw, Globe, Shield, HardDrive, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { useAdminPage } from '@/components/features/admin/admin-page-context'
import { Button } from '@/components/base/ui/button'
import { Input } from '@/components/base/ui/input'
import { Label } from '@/components/base/ui/label'
import { Badge } from '@/components/base/ui/badge'

export default function SettingsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const [saving, setSaving] = useState(false)

  useAdminPage({
    titleKey: 'settings_title',
    subtitleKey: 'settings_subtitle',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success(tCommon('update_success'))
    setSaving(false)
  }

  return (
    <div className="space-y-8 max-w-4xl font-porsche">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <Globe size={20} className="text-brand-red" />
            <h3 className="uppercase tracking-tighter text-xl font-black italic text-near-black dark:text-white">
              General Settings
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Site Name</Label>
              <Input
                placeholder="Porsche Admin"
                defaultValue="Porsche Admin"
                className="font-bold uppercase h-11"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Administrator Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="admin@porsche.com"
                  defaultValue="admin@porsche.com"
                  className="pl-10 h-11 italic text-xs"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Support Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="support@porsche.com"
                  defaultValue="support@porsche.com"
                  className="pl-10 h-11 italic text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-dark-surface border border-light-gray-surface dark:border-neutral-800 rounded-none p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <Shield size={20} className="text-brand-red" />
            <h3 className="uppercase tracking-tighter text-xl font-black italic text-near-black dark:text-white">
              System Settings
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Max Upload Size (MB)</Label>
              <div className="relative">
                <HardDrive size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  placeholder="50"
                  defaultValue="50"
                  className="pl-10 h-11 font-bold"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Timezone</Label>
              <Input
                placeholder="UTC+7"
                defaultValue="UTC+7"
                className="h-11 font-mono text-xs"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-eyebrow uppercase font-bold tracking-porsche-wide text-gray-400">Security Mode</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 border rounded-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Encrypted Transactions</span>
                <Badge variant="success" className="uppercase text-micro font-bold">Enabled</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          variant="brand" 
          onClick={handleSave} 
          loading={saving}
          className="uppercase tracking-porsche-wide text-xs font-black italic h-12 px-10 shadow-lg"
        >
          <Save size={18} className="mr-2" />
          {tCommon('save')}
        </Button>
        <Button 
          variant="outline" 
          className="uppercase tracking-porsche-wide text-xs font-bold h-12 px-10 border-2"
        >
          <RotateCcw size={18} className="mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
