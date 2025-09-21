"use client";

import { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function TableNode({ data, id, onNodesChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [columns, setColumns] = useState(data.columns || []);
  const [newColumn, setNewColumn] = useState({ name: '', type: '', constraints: '' });

  const handleAddColumn = () => {
    if (!newColumn.name || !newColumn.type) return;
    const updatedColumns = [...columns, { ...newColumn }];
    setColumns(updatedColumns);
    setNewColumn({ name: '', type: '', constraints: '' });
    onNodesChange([
      {
        id,
        type: 'update',
        item: { ...data, columns: updatedColumns },
      },
    ]);
  };

  const handleDeleteColumn = (index) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
    onNodesChange([
      {
        id,
        type: 'update',
        item: { ...data, columns: updatedColumns },
      },
    ]);
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = columns.map((col, i) =>
      i === index ? { ...col, [field]: value } : col
    );
    setColumns(updatedColumns);
    onNodesChange([
      {
        id,
        type: 'update',
        item: { ...data, columns: updatedColumns },
      },
    ]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md w-72 max-w-xs transition-all duration-200 hover:shadow-lg">
      {/* Node Header */}
      <div className="bg-indigo-50 text-indigo-800 font-semibold text-sm px-4 py-2 rounded-t-lg flex items-center justify-between">
        <span>{data.label}</span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Column List */}
      <div className="p-4">
        {data.loading ? (
          <div className="text-gray-500 text-sm">Loading columns...</div>
        ) : columns.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No columns defined</div>
        ) : (
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Constraints</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {columns.map((column, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span>{column.name}</span>
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <select
                        value={column.type}
                        onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Type</option>
                        <option value="INT">INT</option>
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="TEXT">TEXT</option>
                        <option value="DATE">DATE</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>
                    ) : (
                      <span>{column.type}</span>
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={column.constraints || ''}
                        onChange={(e) => handleColumnChange(index, 'constraints', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <span>{column.constraints || '-'}</span>
                    )}
                  </td>
                  <td className="py-2">
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteColumn(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Add Column Form */}
        {isEditing && (
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Column name"
              value={newColumn.name}
              onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newColumn.type}
              onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Type</option>
              <option value="INT">INT</option>
              <option value="VARCHAR">VARCHAR</option>
              <option value="TEXT">TEXT</option>
              <option value="DATE">DATE</option>
              <option value="BOOLEAN">BOOLEAN</option>
            </select>
            <input
              type="text"
              placeholder="Constraints"
              value={newColumn.constraints}
              onChange={(e) => setNewColumn({ ...newColumn, constraints: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddColumn}
              className="px-3 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-all duration-200"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Handles for Connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-indigo-500 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-indigo-500 rounded-full"
      />
    </div>
  );
}

export default TableNode;