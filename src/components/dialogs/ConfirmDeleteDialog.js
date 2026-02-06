/**
 * Confirm Delete Dialog
 */

'use client';

import { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button, Input } from '../ui/index';

export default function ConfirmDeleteDialog({ 
  open, 
  onClose, 
  title = 'Confirm Delete',
  itemName,
  itemType = 'item',
  onConfirm,
  requireConfirmation = true 
}) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isConfirmed = !requireConfirmation || confirmText === itemName;

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    
    setIsLoading(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-600 mb-4">
            Are you sure you want to delete the {itemType}{' '}
            <strong className="text-neutral-900">{itemName}</strong>?
            This action cannot be undone.
          </p>

          {requireConfirmation && (
            <div className="mb-4">
              <Input
                label={`Type "${itemName}" to confirm`}
                placeholder={itemName}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isLoading}
          disabled={!isConfirmed}
        >
          Delete {itemType}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
