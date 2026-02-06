'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, TableCellsIcon, PlusIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import '@glideapps/glide-data-grid/dist/index.css';
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';

export default function SidePanel({ object, onClose }) {
  const [activeTab, setActiveTab] = useState('fields');
  const [localData, setLocalData] = useState(object?.data || { tableName: 'New Table', fields: [] });

  // Update local data when object changes
  useEffect(() => {
    if (object?.data) {
        setLocalData(object.data);
    }
  }, [object]);

  // Handle Field Updates (Mock)
  const handleAddField = () => {
    setLocalData(prev => ({
        ...prev,
        fields: [...(prev.fields || []), { name: `new_field_${(prev.fields || []).length}`, type: 'varchar' }]
    }));
  };

  // --- Glide Data Grid Logic ---
  const columns = useMemo(() => localData.fields || [], [localData.fields]);
  const rows = 50; // Mock 50 rows

  const getCellContent = useCallback((cell) => {
    const [col, row] = cell;
    const field = columns[col];
    
    if (!field) return { kind: GridCellKind.Text, displayData: '', data: '' };

    return {
      kind: GridCellKind.Text,
      allowOverlay: true,
      displayData: `Row ${row} ${field.name}`,
      data: `Row ${row} ${field.name}`,
    };
  }, [columns]);

  const gridColumns = useMemo(() => columns.map(c => ({
    title: c.name,
    id: c.name,
    width: 150
  })), [columns]);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-12 bottom-6 w-[520px] bg-white border-l border-gray-200 shadow-xl z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <TableCellsIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{localData.tableName}</h2>
              <p className="text-[10px] text-gray-400">
                {columns.length} fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('fields')}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === 'fields' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Structure
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === 'data' 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Data
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        {activeTab === 'fields' ? (
          <div className="absolute inset-0 overflow-y-auto p-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {columns.map((field, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-gray-50 rounded text-gray-500">
                                {field.pk ? <KeyIcon className="w-3 h-3 text-amber-500" /> : <span className="text-[9px] font-mono leading-none w-3 h-3 flex items-center justify-center">Aa</span>}
                            </div>
                            <span className="text-sm text-gray-700">{field.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{field.type}</span>
                            <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                <button 
                    onClick={handleAddField}
                    className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                    Add Field
                </button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-white" id="portal-root">
             <DataEditor
                getCellContent={getCellContent}
                columns={gridColumns}
                rows={rows}
                rowMarkers="number"
                smoothScrollX
                smoothScrollY
                width="100%"
                height="100%"
             />
          </div>
        )}
      </div>
    </motion.div>
  );
}
