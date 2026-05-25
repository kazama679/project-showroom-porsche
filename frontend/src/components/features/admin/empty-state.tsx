import { ReactNode } from 'react'
import { FileText } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-sm border border-light-gray-surface dark:border-dark-surface p-8 md:p-12 text-center flex flex-col items-center gap-4">
      <div className="text-light-gray-surface dark:text-neutral-700">
        {icon || <FileText size={48} />}
      </div>
      <div>
        <h3 className="text-porsche-subheading text-near-black dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-mid-gray dark:text-light-gray-surface">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
