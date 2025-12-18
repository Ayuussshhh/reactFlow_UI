"use client";

import { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

function TableNode({ data, id }) {
  // Extract onNodesChange from data prop
  const onNodesChange = data.onNodesChange;
  const [isEditing, setIsEditing] = useState(false);
  const [columns, setColumns] = useState(data.columns || []);
  const [newColumn, setNewColumn] = useState({ name: '', type: '', constraints: '' });

  const handleAddColumn = () => {
    if (!newColumn.name || !newColumn.type) return;
    const updatedColumns = [...columns, { ...newColumn }];
    setColumns(updatedColumns);
    setNewColumn({ name: '', type: '', constraints: '' });
    if (onNodesChange) {
      onNodesChange([
        {
          id,
          type: 'update',
          item: { ...data, columns: updatedColumns },
        },
      ]);
    }
  };

  const handleDeleteColumn = (index) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
    if (onNodesChange) {
      onNodesChange([
        {
          id,
          type: 'update',
          item: { ...data, columns: updatedColumns },
        },
      ]);
    }
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, [field]: value } : col
    );
    setColumns(updatedColumns);
    if (onNodesChange) {
      onNodesChange([
        {
          id,
          type: 'update',
          item: { ...data, columns: updatedColumns },
        },
      ]);
    }
  };

  return (
    <div className="card w-80 max-w-sm bg-white/80 backdrop-blur-sm border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in">
      {/* Node Header - Premium Design */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm px-5 py-3.5 rounded-t-xl flex items-center justify-between group">
        <span className="text-base font-semibold tracking-tight">{data.label}</span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-white/20 rounded-md"
          title={isEditing ? 'Done editing' : 'Edit columns'}
        >
          {isEditing ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <PencilIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Column List - Premium Table Design */}
      <div className="p-5">
        {data.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner h-6 w-6 border-2 border-primary-300 border-t-primary-500"></div>
          </div>
        ) : columns.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-neutral-500 italic">No columns defined</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {columns.map((column, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50/50 rounded-lg border border-neutral-200/50 hover:bg-neutral-100/50 transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                        placeholder="Column name"
                        className="input-field w-full text-sm"
                      />
                      <div className="flex space-x-2">
                        <select
                          value={column.type}
                          onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                          className="input-field flex-1 text-xs"
                        >
                          <option value="">Type</option>
                          <option value="INT">INT</option>
                          <option value="VARCHAR">VARCHAR</option>
                          <option value="TEXT">TEXT</option>
                          <option value="DATE">DATE</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                          <option value="FLOAT">FLOAT</option>
                          <option value="DECIMAL">DECIMAL</option>
                        </select>
                        <input
                          type="text"
                          value={column.constraints || ''}
                          onChange={(e) => handleColumnChange(index, 'constraints', e.target.value)}
                          placeholder="Constraints"
                          className="input-field flex-1 text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-neutral-900">{column.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md font-mono font-medium">
                          {column.type}
                        </span>
                      </div>
                      {column.constraints && (
                        <p className="text-xs text-neutral-500">{column.constraints}</p>
                      )}
                    </>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteColumn(index)}
                    className="ml-2 p-1.5 text-danger-600 hover:bg-danger-100 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Delete column"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Column Form */}
        {isEditing && (
          <div className="mt-5 pt-5 border-t border-neutral-200/50 space-y-3">
            <input
              type="text"
              placeholder="Column name"
              value={newColumn.name}
              onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
              className="input-field w-full text-sm"
            />
            <div className="flex space-x-2">
              <select
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                className="input-field flex-1 text-sm"
              >
                <option value="">Data Type</option>
                <option value="INT">INT</option>
                <option value="VARCHAR">VARCHAR</option>
                <option value="TEXT">TEXT</option>
                <option value="DATE">DATE</option>
                <option value="BOOLEAN">BOOLEAN</option>
                <option value="FLOAT">FLOAT</option>
                <option value="DECIMAL">DECIMAL</option>
              </select>
              <input
                type="text"
                placeholder="Constraints"
                value={newColumn.constraints}
                onChange={(e) => setNewColumn({ ...newColumn, constraints: e.target.value })}
                className="input-field flex-1 text-sm"
              />
            </div>
            <button
              onClick={handleAddColumn}
              disabled={!newColumn.name || !newColumn.type}
              className="btn-primary w-full text-sm"
            >
              Add Column
            </button>
          </div>
        )}
      </div>

      {/* Handles for Connections - Premium Design */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary-500 rounded-full shadow-md hover:bg-primary-600 transition-colors duration-200"
        style={{ backgroundColor: '#0ea5e9', boxShadow: '0 0 8px rgba(14, 165, 233, 0.5)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary-500 rounded-full shadow-md hover:bg-primary-600 transition-colors duration-200"
        style={{ backgroundColor: '#0ea5e9', boxShadow: '0 0 8px rgba(14, 165, 233, 0.5)' }}
      />
    </div>
  );
}

export default TableNode;