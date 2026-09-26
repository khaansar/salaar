'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isLoading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} width="sm" title={
      <span className="flex items-center gap-2">
        <AlertTriangle size={18} className={tone === 'danger' ? 'text-rose-500' : 'text-amber-500'} />
        {title}
      </span>
    }>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          isLoading={isLoading}
          variant={tone === 'danger' ? 'danger' : 'primary'}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
