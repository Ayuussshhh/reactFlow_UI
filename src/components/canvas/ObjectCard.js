/**
 * ObjectCard - "Bento Box" style node for object visualization
 * Replaces traditional ER table nodes with a modern, friendly design
 * 
 * Features:
 * - Identity section with object name and icon
 * - Live data preview (2-3 rows)
 * - Friendly field icons (no technical types shown by default)
 * - Linked fields for relationships
 */

'use client';

import { memo, useState, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TableCellsIcon,
  LinkIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CalendarIcon,
  HashtagIcon,
  AtSymbolIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  KeyIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

// Field type to icon mapping
const fieldTypeIcons = {
  // Text types
  'text': DocumentTextIcon,
  'varchar': DocumentTextIcon,
  'char': DocumentTextIcon,
  'string': DocumentTextIcon,
  
  // Number types
  'int': HashtagIcon,
  'integer': HashtagIcon,
  'bigint': HashtagIcon,
  'smallint': HashtagIcon,
  'serial': HashtagIcon,
  'bigserial': HashtagIcon,
  'decimal': CurrencyDollarIcon,
  'numeric': CurrencyDollarIcon,
  'float': HashtagIcon,
  'real': HashtagIcon,
  'double': HashtagIcon,
  'money': CurrencyDollarIcon,
  
  // Date/Time types
  'date': CalendarIcon,
  'time': ClockIcon,
  'timestamp': CalendarIcon,
  'timestamptz': CalendarIcon,
  'datetime': CalendarIcon,
  'interval': ClockIcon,
  
  // Boolean
  'boolean': CheckCircleIcon,
  'bool': CheckCircleIcon,
  
  // Special types
  'uuid': KeyIcon,
  'json': DocumentTextIcon,
  'jsonb': DocumentTextIcon,
  'bytea': PhotoIcon,
  'email': AtSymbolIcon,
  'phone': PhoneIcon,
  'url': GlobeAltIcon,
  'address': MapPinIcon,
  
  // Default
  'default': DocumentTextIcon,
};

// Get friendly field type name
const getFriendlyTypeName = (type) => {
  const typeMap = {
    'varchar': 'Text',
    'text': 'Long Text',
    'int': 'Number',
    'integer': 'Number',
    'bigint': 'Number',
    'serial': 'Auto ID',
    'bigserial': 'Auto ID',
    'decimal': 'Currency',
    'numeric': 'Currency',
    'float': 'Decimal',
    'boolean': 'Checkbox',
    'date': 'Date',
    'timestamp': 'Date & Time',
    'timestamptz': 'Date & Time',
    'uuid': 'Unique ID',
    'json': 'JSON',
    'jsonb': 'JSON',
  };
  
  const lowerType = type?.toLowerCase()?.split('(')[0] || 'text';
  return typeMap[lowerType] || type;
};

// Get icon for field type
const getFieldIcon = (type, isPrimary = false, isForeign = false) => {
  if (isPrimary) return KeyIcon;
  if (isForeign) return LinkIcon;
  
  const lowerType = type?.toLowerCase()?.split('(')[0] || 'default';
  return fieldTypeIcons[lowerType] || fieldTypeIcons.default;
};

// Format cell value for display
const formatCellValue = (value, type) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 30);
  
  const strValue = String(value);
  return strValue.length > 25 ? strValue.slice(0, 25) + '…' : strValue;
};

function ObjectCard({ data, id, selected }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const {
    label,
    columns = [],
    sampleData = [],
    linkedFields = [],
    primaryKeys = [],
    foreignKeys = {},
    onSelect,
    onLinkedFieldClick,
    color = 'blue',
  } = data;

  // Get display columns (max 4 for preview)
  const displayColumns = useMemo(() => {
    return columns.slice(0, 4);
  }, [columns]);

  // Get display rows (max 3 for preview)
  const displayRows = useMemo(() => {
    return sampleData.slice(0, 3);
  }, [sampleData]);

  // Color variants for the card accent
  const colorVariants = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    pink: { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    indigo: { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  };

  const colors = colorVariants[color] || colorVariants.blue;

  // Handle card click
  const handleCardClick = (e) => {
    e.stopPropagation();
    onSelect?.({ id, type: 'table', data });
  };

  // Handle linked field click
  const handleLinkedClick = (linkedTable) => {
    onLinkedFieldClick?.(linkedTable);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "group relative w-[300px] bg-white rounded-lg overflow-hidden",
        "shadow-sm hover:shadow-md transition-all duration-200",
        "border",
        selected ? `ring-2 ring-blue-500 border-blue-200` : "border-gray-200 hover:border-gray-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Hidden handles for connections - only visible during drag */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-400 !border !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-400 !border !border-white opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: '50%' }}
      />

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-gray-900 font-semibold text-sm">{label}</h3>
            <p className="text-gray-500 text-xs mt-1">
              {columns.length} field{columns.length !== 1 ? 's' : ''} {sampleData.length > 0 && `• ${sampleData.length} row${sampleData.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
            <TableCellsIcon className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Data Preview Section */}
      <div className="p-3 space-y-1">
        {displayColumns.slice(0, 3).map((col, idx) => {
          const Icon = getFieldIcon(col.type);
          
          return (
            <div 
              key={idx}
              className="flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{col.name}</span>
              <span className="text-gray-400">{getFriendlyTypeName(col.type)}</span>
            </div>
          );
        })}
        {columns.length > 3 && (
          <div className="px-3 py-2 text-xs text-gray-400">
            +{columns.length - 3} more fields
          </div>
        )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ObjectCard);
