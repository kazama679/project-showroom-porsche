interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    default:
      'bg-gray-200 text-near-black dark:bg-neutral-700 dark:text-white',
    success:
      'bg-success-green/10 text-success-green dark:bg-success-green/20 dark:text-green-400',
    warning:
      'bg-modena-yellow/10 text-yellow-600 dark:bg-modena-yellow/20 dark:text-yellow-400',
    danger: 'bg-brand-red/10 text-brand-red dark:bg-brand-red/20 dark:text-red-400',
    info: 'bg-info-blue/10 text-info-blue dark:bg-info-blue/20 dark:text-blue-300',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs font-medium rounded',
    md: 'px-3 py-1.5 text-sm font-medium rounded-sm',
  }

  return (
    <span className={`${variantStyles[variant]} ${sizeStyles[size]} inline-block`}>
      {children}
    </span>
  )
}
