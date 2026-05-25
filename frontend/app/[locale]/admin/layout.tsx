'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { DynamicAdminWrapper } from '@/components/admin/dynamic-wrapper'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DynamicAdminWrapper>
      <div className="flex h-screen bg-white dark:bg-black">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
          {/* Header */}
          <Header title="Porsche Admin Portal" />

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-white dark:bg-black p-6">
            {children}
          </main>
        </div>
      </div>
    </DynamicAdminWrapper>
  )
}
