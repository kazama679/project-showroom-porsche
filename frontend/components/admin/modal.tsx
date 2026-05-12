"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-[#303030] rounded-[2px] shadow-lg ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#D2D2D2] dark:border-[#404040] p-6 flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-ferrari-subheading text-[#181818] dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[#8F8F8F] dark:text-[#D2D2D2] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#404040] rounded transition-colors"
          >
            <X
              size={20}
              className="text-[#181818] dark:text-white cursor-pointer"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[#D2D2D2] dark:border-[#404040] p-6 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
