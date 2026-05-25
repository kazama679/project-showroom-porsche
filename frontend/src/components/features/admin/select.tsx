import { ReactNode } from 'react'

interface SelectOption {
  label: string
  value: string | number
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  icon?: ReactNode
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  required,
  icon,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-porsche-label text-near-black dark:text-white">
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`w-full px-3 py-2 border rounded-sm text-sm outline-none transition-colors bg-white dark:bg-dark-surface border-light-gray-surface dark:border-neutral-700 text-near-black dark:text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${icon ? 'pl-9' : ''} ${error ? 'border-brand-red focus:ring-brand-red' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-mid-gray">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-brand-red font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-mid-gray dark:text-light-gray-surface">{hint}</p>
      )}
    </div>
  )
}
