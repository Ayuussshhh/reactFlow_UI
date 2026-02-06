/**
 * Foreign Key Dialog
 * Modal for configuring foreign key constraints
 */

'use client';

import { useState, useEffect } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button, Select, Badge } from '../ui/index';

const REFERENTIAL_ACTIONS = [
  { value: 'RESTRICT', label: 'RESTRICT', description: 'Prevent deletion if referenced' },
  { value: 'CASCADE', label: 'CASCADE', description: 'Delete/update referencing rows' },
  { value: 'SET NULL', label: 'SET NULL', description: 'Set foreign key to NULL' },
  { value: 'NO ACTION', label: 'NO ACTION', description: 'Deferred check' },
  { value: 'SET DEFAULT', label: 'SET DEFAULT', description: 'Set to default value' },
];

export default function ForeignKeyDialog({ open, onClose, pendingConnection, nodes, onSubmit }) {
  const [referencedTable, setReferencedTable] = useState('');
  const [referencedColumn, setReferencedColumn] = useState('');
  const [onDelete, setOnDelete] = useState('RESTRICT');
  const [onUpdate, setOnUpdate] = useState('RESTRICT');
  const [isLoading, setIsLoading] = useState(false);

  // Get available tables and columns
  const tables = nodes?.map((n) => n.data.label).filter(Boolean) || [];
  const targetNode = nodes?.find((n) => n.data.label === referencedTable);
  const columns = targetNode?.data.columns?.map((c) => c.name) || [];

  // Reset form when connection changes
  useEffect(() => {
    if (pendingConnection) {
      setReferencedTable(pendingConnection.targetTable || '');
      setReferencedColumn(pendingConnection.targetColumn || '');
    }
  }, [pendingConnection]);

  const handleSubmit = async () => {
    if (!referencedTable || !referencedColumn) return;
    
    setIsLoading(true);
    try {
      await onSubmit({
        referencedTable,
        referencedColumn,
        onDelete,
        onUpdate,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!pendingConnection) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create Foreign Key"
      description="Define the relationship between tables"
      size="md"
    >
      {/* Connection Preview */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <Badge variant="primary" className="mb-2">Source</Badge>
            <p className="text-sm font-semibold text-neutral-900">{pendingConnection.sourceTable}</p>
            <p className="text-xs text-neutral-500">{pendingConnection.sourceColumn}</p>
          </div>
          
          <div className="flex-1 flex items-center px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-primary-200 to-purple-200" />
            <div className="mx-3 w-10 h-10 rounded-xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-primary-200" />
          </div>
          
          <div className="text-center">
            <Badge variant="info" className="mb-2">Reference</Badge>
            <p className="text-sm font-semibold text-neutral-900">{referencedTable || '—'}</p>
            <p className="text-xs text-neutral-500">{referencedColumn || '—'}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Referenced Table */}
        <Select
          label="Referenced Table"
          value={referencedTable}
          onChange={(e) => {
            setReferencedTable(e.target.value);
            setReferencedColumn('');
          }}
          options={[
            { value: '', label: 'Select a table...' },
            ...tables.map((t) => ({ value: t, label: t })),
          ]}
        />

        {/* Referenced Column */}
        <Select
          label="Referenced Column"
          value={referencedColumn}
          onChange={(e) => setReferencedColumn(e.target.value)}
          options={[
            { value: '', label: 'Select a column...' },
            ...columns.map((c) => ({ value: c, label: c })),
          ]}
          disabled={!referencedTable}
        />

        {/* Referential Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="ON DELETE"
            value={onDelete}
            onChange={(e) => setOnDelete(e.target.value)}
            options={REFERENTIAL_ACTIONS}
          />
          <Select
            label="ON UPDATE"
            value={onUpdate}
            onChange={(e) => setOnUpdate(e.target.value)}
            options={REFERENTIAL_ACTIONS}
          />
        </div>

        {/* Help Text */}
        <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
          <p className="font-medium text-neutral-700 mb-1">Referential Actions:</p>
          <ul className="space-y-1">
            <li><strong>RESTRICT:</strong> Prevents deletion/update if referenced</li>
            <li><strong>CASCADE:</strong> Automatically delete/update related rows</li>
            <li><strong>SET NULL:</strong> Set foreign key column to NULL</li>
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!referencedTable || !referencedColumn}
        >
          Create Foreign Key
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
