interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    default:
      'bg-[#E5E5E5] text-[#181818] dark:bg-[#404040] dark:text-white',
    success:
      'bg-[#03904A]/10 text-[#03904A] dark:bg-[#03904A]/20 dark:text-[#4AFF7A]',
    warning:
      'bg-[#F6E500]/10 text-[#B8A500] dark:bg-[#F6E500]/20 dark:text-[#FFE500]',
    danger: 'bg-[#DA291C]/10 text-[#DA291C] dark:bg-[#DA291C]/20 dark:text-[#FF6B6B]',
    info: 'bg-[#4C98B9]/10 text-[#4C98B9] dark:bg-[#4C98B9]/20 dark:text-[#7ECEFF]',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs font-medium rounded',
    md: 'px-3 py-1.5 text-sm font-medium rounded-[2px]',
  }

  return (
    <span className={`${variantStyles[variant]} ${sizeStyles[size]} inline-block`}>
      {children}
    </span>
  )
}
