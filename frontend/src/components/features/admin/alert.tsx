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
      bg: 'bg-info-blue/10 dark:bg-info-blue/20',
      border: 'border-info-blue/30',
      icon: 'text-info-blue',
      text: 'text-info-blue dark:text-blue-300',
      Icon: Info,
    },
    success: {
      bg: 'bg-success-green/10 dark:bg-success-green/20',
      border: 'border-success-green/30',
      icon: 'text-success-green',
      text: 'text-success-green dark:text-green-400',
      Icon: CheckCircle,
    },
    warning: {
      bg: 'bg-modena-yellow/10 dark:bg-modena-yellow/20',
      border: 'border-modena-yellow/30',
      icon: 'text-yellow-600',
      text: 'text-yellow-600 dark:text-yellow-400',
      Icon: AlertTriangle,
    },
    error: {
      bg: 'bg-brand-red/10 dark:bg-brand-red/20',
      border: 'border-brand-red/30',
      icon: 'text-brand-red',
      text: 'text-brand-red dark:text-red-400',
      Icon: AlertCircle,
    },
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div
      className={`rounded-sm border ${style.bg} ${style.border} p-4 flex items-start gap-3`}
    >
      <Icon size={20} className={style.icon} />
      <div className="flex-1 min-w-0">
        {title && <p className={`font-medium ${style.text}`}>{title}</p>}
        <p className="text-sm text-near-black dark:text-light-gray-surface">{message}</p>
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
