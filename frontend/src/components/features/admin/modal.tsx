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
        className={`bg-white dark:bg-dark-surface rounded-sm shadow-lg ${sizeClasses[size]} w-full max-h-modal-screen overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-light-gray-surface dark:border-neutral-700 p-6 flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-porsche-subheading text-near-black dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-mid-gray dark:text-light-gray-surface mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
          >
            <X
              size={20}
              className="text-near-black dark:text-white cursor-pointer"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-light-gray-surface dark:border-neutral-700 p-6 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
