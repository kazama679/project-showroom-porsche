'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { DynamicAdminWrapper } from '@/components/admin/dynamic-wrapper'
import { AdminPageProvider, AdminPageHeader } from '@/components/admin/admin-page-context'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DynamicAdminWrapper>
      <AdminPageProvider>
        <div className="flex h-screen bg-white dark:bg-black">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
            {/* Header toolbar */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-auto bg-white dark:bg-black p-6">
              <div className="space-y-6">
                {/* Page header — title/subtitle/actions from context */}
                <AdminPageHeader />

                {/* Page body */}
                <div>{children}</div>
              </div>
            </main>
          </div>
        </div>
      </AdminPageProvider>
    </DynamicAdminWrapper>
  )
}
