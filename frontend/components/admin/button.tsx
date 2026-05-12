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
      "bg-[#DA291C] text-white hover:bg-[#B01E0A] active:bg-[#9D2211] disabled:opacity-50 cursor-pointer",
    secondary:
      "cursor-pointer bg-white text-[#181818] border border-[#D2D2D2] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] dark:bg-[#303030] dark:text-white dark:border-[#404040] dark:hover:bg-[#404040] disabled:opacity-50",
    danger:
      "cursor-pointer bg-[#DA291C] text-white hover:bg-[#B01E0A] active:bg-[#9D2211] disabled:opacity-50",
    ghost:
      "cursor-pointer bg-transparent text-[#181818] hover:bg-[#F5F5F5] active:bg-[#E5E5E5] dark:text-white dark:hover:bg-[#404040] disabled:opacity-50",
  };

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs font-medium rounded-[2px]",
    md: "px-3 py-2 text-sm font-medium rounded-[2px]",
    lg: "px-4 py-2.5 text-base font-medium rounded-[2px]",
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
