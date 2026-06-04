'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/base/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/base/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  itemLabel?: string
  confirmLabel: string
  cancelLabel: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  variant?: 'destructive' | 'brand'
}

function ConfirmDialog({
  open,
  title,
  description,
  itemLabel,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
  variant = 'destructive',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand-red/10 flex-shrink-0">
              <AlertTriangle size={20} className="text-brand-red" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          {itemLabel && (
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">
              {itemLabel}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'brand'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog }
