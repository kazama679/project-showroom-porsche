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
        <label className="text-ferrari-label text-[#181818] dark:text-white">
          {label}
          {required && <span className="text-[#DA291C] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 border rounded-[2px] text-sm outline-none transition-colors bg-white dark:bg-[#303030] border-[#D2D2D2] dark:border-[#404040] text-[#181818] dark:text-white placeholder-[#8F8F8F] dark:placeholder-[#D2D2D2] focus:border-[#DA291C] focus:ring-1 focus:ring-[#DA291C] disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-9' : ''} ${error ? 'border-[#DA291C] focus:ring-[#DA291C]' : ''} ${className}`}
          {...props}
        />
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
