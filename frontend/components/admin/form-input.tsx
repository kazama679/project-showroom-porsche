import { ReactNode } from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  required?: boolean
}

export function FormInput({
  label,
  error,
  hint,
  icon,
  required,
  className,
  ...props
}: FormInputProps) {
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
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 border rounded-sm text-sm outline-none transition-colors bg-white dark:bg-dark-surface border-light-gray-surface dark:border-neutral-700 text-near-black dark:text-white placeholder-mid-gray dark:placeholder-light-gray-surface focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-9' : ''} ${error ? 'border-brand-red focus:ring-brand-red' : ''} ${className}`}
          {...props}
        />
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
