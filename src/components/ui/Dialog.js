/**
 * Modal/Dialog Component with Liquid Glass Design
 */

'use client';

import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

export function Dialog({ open, onClose, title, description, children, size = 'md' }) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full transform transition-all',
            'bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl',
            'border border-white/60',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200/50">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-neutral-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DialogFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-6 mt-6 border-t border-neutral-200/50',
        className
      )}
    >
      {children}
    </div>
  );
}
