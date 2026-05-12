'use client'

import { ReactNode, useState } from 'react'

interface Tab {
  label: string
  value: string
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultValue?: string
  onChange?: (value: string) => void
}

export function Tabs({ tabs, defaultValue, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onChange?.(value)
  }

  const activeContent = tabs.find((tab) => tab.value === activeTab)?.content

  return (
    <div>
      {/* Tab List */}
      <div className="flex gap-2 border-b border-[#D2D2D2] dark:border-[#303030] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.value
                ? 'border-[#DA291C] text-[#DA291C]'
                : 'border-transparent text-[#8F8F8F] dark:text-[#D2D2D2] hover:text-[#181818] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-6">{activeContent}</div>
    </div>
  )
}
