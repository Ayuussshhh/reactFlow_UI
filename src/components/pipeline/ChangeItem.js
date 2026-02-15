/**
 * ChangeItem - Display a single schema change in a proposal
 */

'use client';

import {
  PlusCircleIcon,
  MinusCircleIcon,
  PencilSquareIcon,
  TableCellsIcon,
  KeyIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const CHANGE_TYPE_CONFIG = {
  // Table changes
  CreateTable: { icon: PlusCircleIcon, color: 'text-green-600', bg: 'bg-green-50', label: 'Create Table' },
  DropTable: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Table' },
  RenameTable: { icon: PencilSquareIcon, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Rename Table' },
  
  // Column changes
  AddColumn: { icon: PlusCircleIcon, color: 'text-green-600', bg: 'bg-green-50', label: 'Add Column' },
  DropColumn: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Column' },
  RenameColumn: { icon: PencilSquareIcon, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Rename Column' },
  AlterColumnType: { icon: ArrowsRightLeftIcon, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Change Type' },
  SetColumnDefault: { icon: DocumentDuplicateIcon, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Set Default' },
  DropColumnDefault: { icon: MinusCircleIcon, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Drop Default' },
  SetColumnNullable: { icon: PencilSquareIcon, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Set Nullable' },
  
  // Constraint changes
  AddPrimaryKey: { icon: KeyIcon, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Add Primary Key' },
  DropPrimaryKey: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Primary Key' },
  AddForeignKey: { icon: ArrowsRightLeftIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Add Foreign Key' },
  DropForeignKey: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Foreign Key' },
  AddUniqueConstraint: { icon: KeyIcon, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Add Unique' },
  DropUniqueConstraint: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Unique' },
  AddCheckConstraint: { icon: PlusCircleIcon, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Add Check' },
  DropCheckConstraint: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Check' },
  
  // Index changes
  CreateIndex: { icon: PlusCircleIcon, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Create Index' },
  DropIndex: { icon: MinusCircleIcon, color: 'text-red-600', bg: 'bg-red-50', label: 'Drop Index' },
  
  // Default
  Unknown: { icon: TableCellsIcon, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Change' },
};

function getChangeType(change) {
  // Handle both camelCase and snake_case
  const type = change.type || change.changeType || change.change_type;
  
  // If type is an object (Rust enum serialization), extract the variant name
  if (typeof type === 'object') {
    const keys = Object.keys(type);
    return keys[0] || 'Unknown';
  }
  
  return type || 'Unknown';
}

function getChangeDetails(change) {
  const type = getChangeType(change);
  const details = [];

  // Extract table name
  const tableName = change.tableName || change.table_name || change.table;
  if (tableName) {
    details.push({ label: 'Table', value: tableName });
  }

  // Extract column name
  const columnName = change.columnName || change.column_name || change.column;
  if (columnName) {
    details.push({ label: 'Column', value: columnName });
  }

  // Type-specific details
  if (type === 'AddColumn' || type === 'AlterColumnType') {
    const dataType = change.dataType || change.data_type || change.columnType;
    if (dataType) {
      details.push({ label: 'Type', value: dataType });
    }
  }

  if (type === 'RenameTable' || type === 'RenameColumn') {
    const newName = change.newName || change.new_name;
    if (newName) {
      details.push({ label: 'New Name', value: newName });
    }
  }

  if (type === 'AddForeignKey') {
    const refTable = change.referencedTable || change.referenced_table || change.refTable;
    if (refTable) {
      details.push({ label: 'References', value: refTable });
    }
  }

  if (type === 'SetColumnDefault') {
    const defaultValue = change.defaultValue || change.default_value;
    if (defaultValue) {
      details.push({ label: 'Default', value: String(defaultValue) });
    }
  }

  return details;
}

export default function ChangeItem({ change, index, onRemove }) {
  const type = getChangeType(change);
  const config = CHANGE_TYPE_CONFIG[type] || CHANGE_TYPE_CONFIG.Unknown;
  const Icon = config.icon;
  const details = getChangeDetails(change);

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border border-gray-100', config.bg)}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm', config.color)}>
        <Icon className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{config.label}</span>
          {change.breaking && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
              BREAKING
            </span>
          )}
        </div>
        
        {details.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {details.map((detail, idx) => (
              <span key={idx} className="text-xs text-gray-600">
                <span className="text-gray-400">{detail.label}:</span>{' '}
                <span className="font-mono">{detail.value}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Remove change"
        >
          <MinusCircleIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
