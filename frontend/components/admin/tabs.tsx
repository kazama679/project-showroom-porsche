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
      <div className="flex gap-2 border-b border-light-gray-surface dark:border-dark-surface overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.value
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-mid-gray dark:text-light-gray-surface hover:text-near-black dark:hover:text-white'
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
