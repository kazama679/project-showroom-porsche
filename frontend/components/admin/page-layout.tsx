import { ReactNode } from 'react'

interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  title,
  subtitle,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-ferrari-heading text-[#181818] dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#8F8F8F] dark:text-[#D2D2D2] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  )
}
