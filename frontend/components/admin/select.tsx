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
        <label className="text-ferrari-label text-[#181818] dark:text-white">
          {label}
          {required && <span className="text-[#DA291C] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F] pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={`w-full px-3 py-2 border rounded-[2px] text-sm outline-none transition-colors bg-white dark:bg-[#303030] border-[#D2D2D2] dark:border-[#404040] text-[#181818] dark:text-white focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${icon ? 'pl-9' : ''} ${error ? 'border-[#DA291C] focus:ring-[#DA291C]' : ''} ${className}`}
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
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F8F8F]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-[#DA291C] font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[#8F8F8F] dark:text-[#D2D2D2]">{hint}</p>
      )}
    </div>
  )
}
