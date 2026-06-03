import * as React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { cn } from '@/utils/cn'

interface AdminStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  unit?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function AdminStatCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  className,
  ...props
}: AdminStatCardProps) {
  const variantStyles = {
    default: 'border-light-gray-surface dark:border-dark-surface',
    success: 'border-success-green bg-success-green/5 dark:bg-success-green/10',
    warning: 'border-modena-yellow bg-modena-yellow/5 dark:bg-modena-yellow/10',
    danger: 'border-brand-red bg-brand-red/5 dark:bg-brand-red/10',
  }
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div
      className={cn(
        'border rounded-sm p-5 bg-white dark:bg-dark-surface transition-all hover:shadow-sm',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-porsche-label text-dark-gray dark:text-light-gray-surface">
          {label}
        </span>
        {icon && <div className="text-brand-red">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-porsche-stat text-near-black dark:text-white">
          {value}
        </span>
        {unit && <span className="text-sm text-mid-gray dark:text-light-gray-surface">{unit}</span>}
      </div>

      {trend !== undefined && trendLabel && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trendPositive ? 'text-success-green' : trendNegative ? 'text-brand-red' : 'text-mid-gray',
          )}
        >
          {trendPositive && <ArrowUp size={14} />}
          {trendNegative && <ArrowDown size={14} />}
          <span>{Math.abs(trend)}% {trendLabel}</span>
        </div>
      )}
    </div>
  )
}

export { AdminStatCard }
