"use client";

import { useState } from 'react';
import { ExclamationTriangleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

function ForeignKeyDialog({
  open,
  onClose,
  onConfirm,
  sourceTable,
  sourceColumn,
  availableTables,
  availableColumns,
  selectedReferencedTable,
  onTableSelect,
}) {
  const [cascadeDelete, setCascadeDelete] = useState('RESTRICT');
  const [cascadeUpdate, setCascadeUpdate] = useState('RESTRICT');
  const [selectedRefColumn, setSelectedRefColumn] = useState('');

  const cascadeOptions = ['RESTRICT', 'CASCADE', 'SET NULL', 'NO ACTION', 'SET DEFAULT'];

  const isValid = selectedRefColumn && selectedReferencedTable;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      referencedTable: selectedReferencedTable,
      referencedColumn: selectedRefColumn,
      onDelete: cascadeDelete,
      onUpdate: cascadeUpdate,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCascadeDelete('RESTRICT');
    setCascadeUpdate('RESTRICT');
    setSelectedRefColumn('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-5 animate-scale-in">
        {/* Header */}
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900">Create Foreign Key Relationship</h2>
          <p className="text-sm text-neutral-600 mt-1">Connect columns across tables</p>
        </div>

        {/* Source Column Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">Source:</span>{' '}
            <span className="font-mono text-blue-700">{sourceTable}</span>
            <span className="mx-2">→</span>
            <span className="font-mono text-blue-700">{sourceColumn}</span>
          </p>
        </div>

        {/* Referenced Table Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-900">
            Reference Table
          </label>
          <select
            value={selectedReferencedTable}
            onChange={(e) => {
              onTableSelect(e.target.value);
              setSelectedRefColumn('');
            }}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">-- Select a table --</option>
            {availableTables
              .filter((table) => table !== sourceTable)
              .map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
          </select>
        </div>

        {/* Referenced Column Selection */}
        {selectedReferencedTable && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-900">
              Reference Column
            </label>
            <select
              value={selectedRefColumn}
              onChange={(e) => setSelectedRefColumn(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">-- Select a column --</option>
              {availableColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            {availableColumns.length === 0 && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                No valid columns to reference in selected table
              </p>
            )}
          </div>
        )}

        {/* Cascade Options */}
        {selectedReferencedTable && selectedRefColumn && (
          <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <p className="text-xs font-semibold text-neutral-600 uppercase">Cascade Rules</p>

            {/* ON DELETE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">ON DELETE</label>
              <select
                value={cascadeDelete}
                onChange={(e) => setCascadeDelete(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {cascadeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                {cascadeDelete === 'CASCADE' &&
                  'Delete this row if referenced row is deleted'}
                {cascadeDelete === 'SET NULL' &&
                  'Set this column to NULL if referenced row is deleted'}
                {cascadeDelete === 'RESTRICT' &&
                  'Prevent deletion if referenced row exists'}
                {cascadeDelete === 'NO ACTION' &&
                  'Same as RESTRICT (checked at transaction end)'}
                {cascadeDelete === 'SET DEFAULT' &&
                  'Set to default value if referenced row is deleted'}
              </p>
            </div>

            {/* ON UPDATE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">ON UPDATE</label>
              <select
                value={cascadeUpdate}
                onChange={(e) => setCascadeUpdate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {cascadeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500">
                {cascadeUpdate === 'CASCADE' &&
                  'Update this value if referenced value changes'}
                {cascadeUpdate === 'SET NULL' &&
                  'Set this column to NULL if referenced value changes'}
                {cascadeUpdate === 'RESTRICT' &&
                  'Prevent updates if this column is referenced'}
                {cascadeUpdate === 'NO ACTION' &&
                  'Same as RESTRICT (checked at transaction end)'}
                {cascadeUpdate === 'SET DEFAULT' &&
                  'Set to default value if referenced value changes'}
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
          <p>
            💡 <strong>Tip:</strong> The referenced column must be a Primary Key or have a
            Unique constraint.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t border-neutral-200 pt-4">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
              isValid
                ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <CheckIcon className="w-4 h-4" />
            Create Relationship
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForeignKeyDialog;
