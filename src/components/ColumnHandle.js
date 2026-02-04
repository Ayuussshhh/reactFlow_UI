"use client";

import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  KeyIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function ColumnHandle({
  column,
  index,
  isPrimaryKey,
  isForeignKey,
  onDelete,
  onEdit,
  isEditing,
  onConstraintChange,
}) {
  const [showOptions, setShowOptions] = useState(false);

  const getColumnTypeColor = (type) => {
    const typeMap = {
      'integer': 'bg-blue-100 text-blue-700 border-blue-300',
      'varchar': 'bg-green-100 text-green-700 border-green-300',
      'text': 'bg-green-100 text-green-700 border-green-300',
      'timestamp': 'bg-purple-100 text-purple-700 border-purple-300',
      'boolean': 'bg-orange-100 text-orange-700 border-orange-300',
      'json': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'uuid': 'bg-pink-100 text-pink-700 border-pink-300',
      'numeric': 'bg-blue-100 text-blue-700 border-blue-300',
      'date': 'bg-purple-100 text-purple-700 border-purple-300',
    };

    const baseType = type.split('(')[0].toLowerCase();
    return typeMap[baseType] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const handleTypeChange = (newType) => {
    onEdit(index, 'type', newType);
  };

  return (
    <div
      key={index}
      className="flex items-center justify-between p-2.5 bg-white/60 hover:bg-white/80 rounded-lg border border-neutral-200/50 hover:border-neutral-300/70 transition-all duration-200 group gap-2"
    >
      {/* Left Handle - For Foreign Key References */}
      <Handle
        type="target"
        position={Position.Left}
        id={`col-${index}-left`}
        className={`!w-2.5 !h-2.5 !border-0 transition-all ${
          isForeignKey
            ? '!bg-blue-500 group-hover:!bg-blue-600 group-hover:!w-3 group-hover:!h-3'
            : '!bg-neutral-400 group-hover:!bg-neutral-500'
        }`}
        title={isForeignKey ? 'Foreign Key' : 'Can receive references'}
        style={{ left: -10 }}
      />

      {/* Column Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Primary Key Indicator */}
        {isPrimaryKey && (
          <div
            className="flex-shrink-0 p-1 bg-yellow-100 rounded-full"
            title="Primary Key"
          >
            <KeyIcon className="w-3.5 h-3.5 text-yellow-600" />
          </div>
        )}

        {/* Foreign Key Indicator */}
        {isForeignKey && (
          <div
            className="flex-shrink-0 p-1 bg-blue-100 rounded-full"
            title="Foreign Key"
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
          </div>
        )}

        {/* Column Name and Type */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              type="text"
              value={column.name}
              onChange={(e) => onEdit(index, 'name', e.target.value)}
              className="w-full px-2 py-1 text-xs font-semibold border border-neutral-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Column name"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800 truncate">
                {column.name}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0 border ${getColumnTypeColor(
                  column.type
                )}`}
              >
                {column.type}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Handle - For Referencing Other Tables */}
      <Handle
        type="source"
        position={Position.Right}
        id={`col-${index}-right`}
        className="!w-2.5 !h-2.5 !border-0 !bg-green-500 group-hover:!bg-green-600 group-hover:!w-3 group-hover:!h-3 transition-all"
        title="Drag to create foreign key"
        style={{ right: -10 }}
      />

      {/* Actions */}
      {isEditing && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onConstraintChange(index, 'edit')}
            className="p-1 hover:bg-neutral-200 rounded transition-colors"
            title="Done editing"
          >
            <CheckIcon className="w-3.5 h-3.5 text-green-600" />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Delete column"
          >
            <XMarkIcon className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ColumnHandle;
