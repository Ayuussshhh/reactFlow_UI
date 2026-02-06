/**
 * Create Table Dialog
 */

'use client';

import { useState } from 'react';
import { TableCellsIcon, PlusIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { Button, Input, Select, Badge } from '../ui/index';
import { useAppStore } from '../../store';
import { POSTGRES_TYPES, cn } from '../../lib/utils';

const defaultColumn = { name: '', type: 'varchar(255)', nullable: true, primaryKey: false };

export default function CreateTableDialog({ open, onClose }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ ...defaultColumn }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createTable, connection } = useAppStore();

  const handleAddColumn = () => {
    setColumns([...columns, { ...defaultColumn }]);
  };

  const handleRemoveColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableName.trim()) {
      setError('Table name is required');
      return;
    }

    if (!columns.every((c) => c.name.trim() && c.type)) {
      setError('All columns must have a name and type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formattedColumns = columns.map((col) => ({
        name: col.name.trim(),
        type: col.type,
        nullable: col.nullable,
        primary_key: col.primaryKey,
      }));

      const success = await createTable(tableName.trim(), formattedColumns);
      if (success) {
        setTableName('');
        setColumns([{ ...defaultColumn }]);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTableName('');
    setColumns([{ ...defaultColumn }]);
    setError('');
    onClose();
  };

  // Group types by category
  const typeOptions = POSTGRES_TYPES.map((t) => ({
    value: t.value,
    label: `${t.label} (${t.group})`,
  }));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Create Table"
      description={connection.database ? `In database: ${connection.database}` : 'Select a database first'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Table Name */}
        <div className="mb-6">
          <Input
            label="Table Name"
            placeholder="users"
            value={tableName}
            onChange={(e) => {
              setTableName(e.target.value);
              setError('');
            }}
            error={error && !tableName.trim() ? error : ''}
          />
        </div>

        {/* Columns */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-neutral-700">Columns</label>
            <Button type="button" variant="ghost" size="sm" onClick={handleAddColumn}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Column
            </Button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {columns.map((column, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200"
              >
                {/* Column Name */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="column_name"
                    value={column.name}
                    onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
                  />
                </div>

                {/* Column Type */}
                <div className="w-40">
                  <select
                    value={column.type}
                    onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleColumnChange(index, 'primaryKey', !column.primaryKey)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      column.primaryKey
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-neutral-100 text-neutral-400 hover:text-neutral-600'
                    )}
                    title="Primary Key"
                  >
                    <KeyIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleColumnChange(index, 'nullable', !column.nullable)}
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-lg transition-colors',
                      column.nullable
                        ? 'bg-neutral-100 text-neutral-500'
                        : 'bg-red-100 text-red-600'
                    )}
                    title="Nullable"
                  >
                    {column.nullable ? 'NULL' : 'NOT NULL'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={columns.length === 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && columns.some((c) => !c.name.trim()) && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!connection.isConnected}
          >
            Create Table
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
