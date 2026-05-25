import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconPosition = "left",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-brand-red text-white hover:bg-dark-red active:bg-deep-red disabled:opacity-50 cursor-pointer",
    secondary:
      "cursor-pointer bg-white text-near-black border border-light-gray-surface hover:bg-gray-100 active:bg-gray-200 dark:bg-dark-surface dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-700 disabled:opacity-50",
    danger:
      "cursor-pointer bg-brand-red text-white hover:bg-dark-red active:bg-deep-red disabled:opacity-50",
    ghost:
      "cursor-pointer bg-transparent text-near-black hover:bg-gray-100 active:bg-gray-200 dark:text-white dark:hover:bg-neutral-700 disabled:opacity-50",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs font-medium rounded-sm",
    md: "px-3 py-2 text-sm font-medium rounded-sm",
    lg: "px-4 py-2.5 text-base font-medium rounded-sm",
  };

  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && icon && iconPosition === "left" && icon}
      {children}
      {!loading && icon && iconPosition === "right" && icon}
    </button>
  );
}
