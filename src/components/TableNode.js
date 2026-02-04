"use client";

import { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ColumnHandle from './ColumnHandle';

function TableNode({ data, id }) {
  const onNodesChange = data.onNodesChange;
  const [isEditing, setIsEditing] = useState(false);
  const [columns, setColumns] = useState(data.columns || []);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'VARCHAR(255)' });
  const [primaryKeys, setPrimaryKeys] = useState(data.primaryKeys || []);
  const [foreignKeys, setForeignKeys] = useState(data.foreignKeys || {});

  const columnTypes = [
    'SERIAL',
    'BIGSERIAL',
    'INT',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'NUMERIC',
    'FLOAT',
    'REAL',
    'VARCHAR(255)',
    'TEXT',
    'CHAR(50)',
    'BOOLEAN',
    'DATE',
    'TIME',
    'TIMESTAMP',
    'TIMESTAMPTZ',
    'UUID',
    'JSON',
    'JSONB',
    'BYTEA',
    'INTERVAL',
  ];

  const handleAddColumn = () => {
    if (!newColumn.name || !newColumn.type) {
      alert('Column name and type are required');
      return;
    }
    const updatedColumns = [...columns, { ...newColumn }];
    setColumns(updatedColumns);
    setNewColumn({ name: '', type: 'VARCHAR(255)' });
    updateNodeData(updatedColumns);
  };

  const handleDeleteColumn = (index) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
    updateNodeData(updatedColumns);
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, [field]: value } : col
    );
    setColumns(updatedColumns);
    updateNodeData(updatedColumns);
  };

  const handleSetPrimaryKey = (index) => {
    const colName = columns[index].name;
    setPrimaryKeys(
      primaryKeys.includes(colName)
        ? primaryKeys.filter((pk) => pk !== colName)
        : [...primaryKeys, colName]
    );
  };

  const updateNodeData = (updatedColumns) => {
    if (onNodesChange) {
      onNodesChange([
        {
          id,
          type: 'update',
          item: {
            ...data,
            columns: updatedColumns,
            primaryKeys,
            foreignKeys,
          },
        },
      ]);
    }
  };

  return (
    <div className="card w-96 max-w-sm bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in rounded-xl overflow-hidden">
      {/* Node Header - Premium Design */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold px-5 py-4 flex items-center justify-between group">
        <div>
          <span className="text-lg font-bold tracking-tight block">{data.label}</span>
          <span className="text-xs text-white/70">
            {columns.length} column{columns.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white/20 rounded-lg"
          title={isEditing ? 'Done editing' : 'Edit columns'}
        >
          {isEditing ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <PencilIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Column List */}
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {data.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner h-6 w-6 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : columns.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-neutral-500 italic">No columns defined</p>
          </div>
        ) : (
          <div className="space-y-2">
            {columns.map((column, index) => (
              <div key={index} className="relative">
                <ColumnHandle
                  column={column}
                  index={index}
                  isPrimaryKey={primaryKeys.includes(column.name)}
                  isForeignKey={foreignKeys[column.name] !== undefined}
                  onDelete={handleDeleteColumn}
                  onEdit={handleColumnChange}
                  isEditing={isEditing}
                  onConstraintChange={(idx, action) => {
                    if (action === 'edit') {
                      // Edit mode toggle handled by parent
                    }
                  }}
                />

                {/* Edit Mode - Additional Options */}
                {isEditing && (
                  <div className="mt-1.5 ml-8 space-y-1.5 p-2 bg-neutral-50 rounded-lg border border-neutral-200">
                    {/* Type Selector */}
                    <select
                      value={column.type}
                      onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {columnTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    {/* Primary Key Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={primaryKeys.includes(column.name)}
                        onChange={() => handleSetPrimaryKey(index)}
                        className="w-3.5 h-3.5 rounded border-neutral-300 accent-yellow-500"
                      />
                      <span className="text-xs font-medium text-neutral-700">
                        Primary Key
                      </span>
                    </label>

                    {/* Nullable Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={!column.nullable}
                        onChange={(e) =>
                          handleColumnChange(index, 'nullable', !e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded border-neutral-300 accent-blue-500"
                      />
                      <span className="text-xs font-medium text-neutral-700">
                        NOT NULL
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Column Form - When Editing */}
        {isEditing && (
          <div className="border-t border-neutral-200 pt-3 mt-3 space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase">Add New Column</p>
            <div className="space-y-2">
              <input
                type="text"
                value={newColumn.name}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                placeholder="Column name"
                className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {columnTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddColumn}
                className="w-full px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Column
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableNode;