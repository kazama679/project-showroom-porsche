'use client'

import { PageLayout } from '@/components/admin/page-layout'
import { Button } from '@/components/admin/button'
import { FormInput } from '@/components/admin/form-input'
import { Alert } from '@/components/admin/alert'
import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  return (
    <PageLayout
      title="System Settings"
      subtitle="Configure system-wide preferences"
    >
      <div className="space-y-6 max-w-2xl">
        {saved && (
          <Alert
            type="success"
            message="Settings saved successfully"
            onClose={() => setSaved(false)}
          />
        )}

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6 space-y-4">
          <h3 className="text-ferrari-subheading text-[#181818] dark:text-white">
            General Settings
          </h3>
          <FormInput
            label="Site Name"
            placeholder="Porsche Admin"
            defaultValue="Porsche Admin"
          />
          <FormInput
            label="Administrator Email"
            type="email"
            placeholder="admin@porsche.com"
            defaultValue="admin@porsche.com"
          />
          <FormInput
            label="Support Email"
            type="email"
            placeholder="support@porsche.com"
            defaultValue="support@porsche.com"
          />
        </div>

        <div className="bg-white dark:bg-[#303030] border border-[#D2D2D2] dark:border-[#303030] rounded-[2px] p-6 space-y-4">
          <h3 className="text-ferrari-subheading text-[#181818] dark:text-white">
            System Settings
          </h3>
          <FormInput
            label="Max Upload Size (MB)"
            type="number"
            placeholder="50"
            defaultValue="50"
          />
          <FormInput
            label="Timezone"
            placeholder="UTC"
            defaultValue="UTC"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="primary" onClick={() => setSaved(true)}>
            Save Settings
          </Button>
          <Button variant="secondary">
            Reset to Defaults
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
