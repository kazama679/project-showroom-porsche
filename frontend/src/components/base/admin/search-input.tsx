'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/utils/cn'

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, ...props }, ref) {
    return (
      <div className={cn('relative', className)}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
        <input
          ref={ref}
          type="search"
          className="w-full pl-9 pr-4 py-2 text-sm border border-light-gray-surface dark:border-neutral-700 rounded-sm bg-white dark:bg-dark-surface text-near-black dark:text-white placeholder-mid-gray outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors"
          {...props}
        />
      </div>
    )
  },
)

export { SearchInput }
