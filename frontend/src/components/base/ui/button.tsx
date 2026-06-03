import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/cn'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-red disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 transition-colors",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        brand: 'bg-brand-red text-white hover:bg-red-700 active:bg-red-800',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-gray-200 bg-white shadow-xs hover:bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
        ghost:
          'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-neutral-800 dark:text-gray-400 dark:hover:text-white',
        link: 'text-brand-red underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'default',
    },
  },
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, icon, iconPosition = 'left', children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
