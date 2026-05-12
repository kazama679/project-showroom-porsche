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
    <div className="rounded-[2px] border border-[#D2D2D2] dark:border-[#303030] p-8 md:p-12 text-center flex flex-col items-center gap-4">
      <div className="text-[#D2D2D2] dark:text-[#404040]">
        {icon || <FileText size={48} />}
      </div>
      <div>
        <h3 className="text-ferrari-subheading text-[#181818] dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[#8F8F8F] dark:text-[#D2D2D2]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
