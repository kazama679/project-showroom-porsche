import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { ReactNode } from 'react'

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  onClose?: () => void
  action?: ReactNode
}

export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  action,
}: AlertProps) {
  const styles = {
    info: {
      bg: 'bg-[#4C98B9]/10 dark:bg-[#4C98B9]/20',
      border: 'border-[#4C98B9]/30',
      icon: 'text-[#4C98B9]',
      text: 'text-[#4C98B9] dark:text-[#7ECEFF]',
      Icon: Info,
    },
    success: {
      bg: 'bg-[#03904A]/10 dark:bg-[#03904A]/20',
      border: 'border-[#03904A]/30',
      icon: 'text-[#03904A]',
      text: 'text-[#03904A] dark:text-[#4AFF7A]',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-[#F6E500]/10 dark:bg-[#F6E500]/20',
      border: 'border-[#F6E500]/30',
      icon: 'text-[#B8A500]',
      text: 'text-[#B8A500] dark:text-[#FFE500]',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-[#DA291C]/10 dark:bg-[#DA291C]/20',
      border: 'border-[#DA291C]/30',
      icon: 'text-[#DA291C]',
      text: 'text-[#DA291C] dark:text-[#FF6B6B]',
      Icon: AlertCircle,
    },
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div
      className={`rounded-[2px] border ${style.bg} ${style.border} p-4 flex items-start gap-3`}
    >
      <Icon size={20} className={style.icon} />
      <div className="flex-1 min-w-0">
        {title && <p className={`font-medium ${style.text}`}>{title}</p>}
        <p className="text-sm text-[#181818] dark:text-[#D2D2D2]">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
        >
          <X size={16} className={style.icon} />
        </button>
      )}
    </div>
  )
}
