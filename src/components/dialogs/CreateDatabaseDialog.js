/**
 * Create Database Dialog
 */

'use client';

import { useState } from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button, Input } from '../ui/index';
import { useAppStore } from '../../store';

export default function CreateDatabaseDialog({ open, onClose }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createDatabase } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Database name is required');
      return;
    }

    // Validate name format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      setError('Name must start with a letter and contain only letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await createDatabase(name.trim());
      if (success) {
        setName('');
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create Database"
      description="Create a new PostgreSQL database"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <CircleStackIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <Input
              label="Database Name"
              placeholder="my_database"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              error={error}
              autoFocus
            />
            <p className="mt-2 text-xs text-neutral-500">
              Use lowercase letters, numbers, and underscores. Must start with a letter.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Database
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
