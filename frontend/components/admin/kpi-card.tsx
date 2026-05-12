import { ArrowUp, ArrowDown } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  unit?: string
  trend?: number
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function KPICard({
  label,
  value,
  unit,
  trend,
  icon,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'border-[#D2D2D2] dark:border-[#303030]',
    success: 'border-[#03904A] bg-[#03904A]/5 dark:bg-[#03904A]/10',
    warning: 'border-[#F6E500] bg-[#F6E500]/5 dark:bg-[#F6E500]/10',
    danger: 'border-[#DA291C] bg-[#DA291C]/5 dark:bg-[#DA291C]/10',
  }

  const trendPositive = trend && trend > 0
  const trendNegative = trend && trend < 0

  return (
    <div
      className={`border rounded-[2px] p-5 bg-white dark:bg-[#303030] ${variantStyles[variant]} transition-all hover:shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-ferrari-label text-[#666666] dark:text-[#D2D2D2]">
          {label}
        </span>
        {icon && <div className="text-[#DA291C]">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-ferrari-stat text-[#181818] dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[#8F8F8F] dark:text-[#D2D2D2]">
            {unit}
          </span>
        )}
      </div>

      {trend !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trendPositive
              ? 'text-[#03904A]'
              : trendNegative
                ? 'text-[#DA291C]'
                : 'text-[#8F8F8F]'
          }`}
        >
          {trendPositive && <ArrowUp size={14} />}
          {trendNegative && <ArrowDown size={14} />}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  )
}
