'use client';

/**
 * TableNode - Professional database table visualization
 * Inspired by dbdiagram.io, Prisma Studio, and modern ERD tools
 */
import { memo, useMemo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useSchemaStore, useProposalStore, useImpactStore, useUIStore } from '../../store/store';
import clsx from 'clsx';

// Type to icon mapping (using simple Unicode icons for cleaner look)
const TYPE_CONFIG = {
  // Numeric types
  serial: { icon: '#', color: 'blue', label: 'Serial' },
  bigserial: { icon: '#', color: 'blue', label: 'BigSerial' },
  integer: { icon: '#', color: 'blue', label: 'Int' },
  int4: { icon: '#', color: 'blue', label: 'Int' },
  int8: { icon: '#', color: 'blue', label: 'BigInt' },
  bigint: { icon: '#', color: 'blue', label: 'BigInt' },
  smallint: { icon: '#', color: 'blue', label: 'SmallInt' },
  int2: { icon: '#', color: 'blue', label: 'SmallInt' },
  numeric: { icon: '#', color: 'cyan', label: 'Decimal' },
  decimal: { icon: '#', color: 'cyan', label: 'Decimal' },
  real: { icon: '#', color: 'cyan', label: 'Float' },
  float4: { icon: '#', color: 'cyan', label: 'Float' },
  float8: { icon: '#', color: 'cyan', label: 'Double' },
  double: { icon: '#', color: 'cyan', label: 'Double' },
  
  // Text types
  text: { icon: 'T', color: 'green', label: 'Text' },
  varchar: { icon: 'T', color: 'green', label: 'Varchar' },
  'character varying': { icon: 'T', color: 'green', label: 'Varchar' },
  char: { icon: 'T', color: 'green', label: 'Char' },
  character: { icon: 'T', color: 'green', label: 'Char' },
  citext: { icon: 'T', color: 'green', label: 'CIText' },
  
  // Boolean
  boolean: { icon: '✓', color: 'purple', label: 'Bool' },
  bool: { icon: '✓', color: 'purple', label: 'Bool' },
  
  // Date/Time
  timestamp: { icon: '◷', color: 'amber', label: 'Timestamp' },
  'timestamp with time zone': { icon: '◷', color: 'amber', label: 'TimestampTZ' },
  'timestamp without time zone': { icon: '◷', color: 'amber', label: 'Timestamp' },
  timestamptz: { icon: '◷', color: 'amber', label: 'TimestampTZ' },
  date: { icon: '◷', color: 'amber', label: 'Date' },
  time: { icon: '◷', color: 'amber', label: 'Time' },
  interval: { icon: '◷', color: 'amber', label: 'Interval' },
  
  // Special types
  uuid: { icon: '◊', color: 'pink', label: 'UUID' },
  json: { icon: '{ }', color: 'orange', label: 'JSON' },
  jsonb: { icon: '{ }', color: 'orange', label: 'JSONB' },
  bytea: { icon: '⬡', color: 'slate', label: 'Bytes' },
  inet: { icon: '@', color: 'teal', label: 'IP' },
  macaddr: { icon: '@', color: 'teal', label: 'MAC' },
  array: { icon: '[ ]', color: 'indigo', label: 'Array' },
  
  // Default
  default: { icon: '?', color: 'slate', label: 'Unknown' },
};

// Get type configuration
const getTypeConfig = (type) => {
  const t = (type || '').toLowerCase().trim();
  
  // Check for exact match first
  if (TYPE_CONFIG[t]) return TYPE_CONFIG[t];
  
  // Check for partial matches
  for (const [key, config] of Object.entries(TYPE_CONFIG)) {
    if (t.includes(key)) return config;
  }
  
  return TYPE_CONFIG.default;
};

// Color classes mapping
const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  purple: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  pink: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-600',
    border: 'border-pink-200',
    dot: 'bg-pink-500',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  slate: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

const TableNode = memo(({ data, selected }) => {
  const { table, isProposed, proposalType } = data;
  const devMode = useSchemaStore((state) => state.devMode);
  
  // Impact analysis store
  const highlightedNodes = useImpactStore((state) => state.highlightedNodes);
  const setSelectedObject = useImpactStore((state) => state.setSelectedObject);
  const setImpactPanelOpen = useUIStore((state) => state.setImpactPanelOpen);
  
  // Check if this table is impacted (in blast radius)
  const isImpacted = useMemo(() => {
    return highlightedNodes.includes(table.name);
  }, [highlightedNodes, table.name]);
  
  // Select raw data for stable reference
  const activeProposal = useProposalStore((state) => state.activeProposal);
  const draftChanges = useProposalStore((state) => state.draftChanges);
  
  // Derive table changes with useMemo
  const tableChanges = useMemo(() => {
    const proposalChanges = activeProposal?.changes || [];
    return [...proposalChanges, ...draftChanges].filter(
      (c) => c.tableName === table.name || c.table === table.name
    );
  }, [activeProposal, draftChanges, table.name]);

  // Separate columns by type
  const { pkColumns, fkColumns, regularColumns } = useMemo(() => {
    const columns = table.columns || [];
    return {
      pkColumns: columns.filter((c) => c.isPrimaryKey),
      fkColumns: columns.filter((c) => c.isForeignKey && !c.isPrimaryKey),
      regularColumns: columns.filter((c) => !c.isPrimaryKey && !c.isForeignKey),
    };
  }, [table.columns]);
  
  // Handle right-click to analyze impact
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setSelectedObject({
      schema: table.schema || 'public',
      table: table.name,
    });
    setImpactPanelOpen(true);
  }, [table.name, table.schema, setSelectedObject, setImpactPanelOpen]);

  // Get status styling
  const statusConfig = useMemo(() => {
    // Impact highlighting takes precedence
    if (isImpacted) {
      return { borderColor: 'border-orange-400', headerBg: 'bg-orange-500', glow: 'shadow-orange-500/30', isImpact: true };
    }
    if (proposalType === 'new') {
      return { borderColor: 'border-emerald-400', headerBg: 'bg-emerald-500', glow: 'shadow-emerald-500/20' };
    }
    if (proposalType === 'modified' || tableChanges.length > 0) {
      return { borderColor: 'border-amber-400', headerBg: 'bg-amber-500', glow: 'shadow-amber-500/20' };
    }
    if (proposalType === 'delete') {
      return { borderColor: 'border-red-400', headerBg: 'bg-red-500', glow: 'shadow-red-500/20', opacity: 'opacity-60' };
    }
    return { borderColor: selected ? 'border-indigo-400' : 'border-slate-200', headerBg: 'bg-indigo-500', glow: '' };
  }, [proposalType, tableChanges.length, selected, isImpacted]);

  return (
    <div
      onContextMenu={handleContextMenu}
      className={clsx(
        'table-node-pro group',
        'bg-white rounded-lg border-2 overflow-hidden',
        'shadow-lg hover:shadow-xl transition-all duration-200',
        statusConfig.borderColor,
        statusConfig.glow && `shadow-xl ${statusConfig.glow}`,
        statusConfig.opacity,
        selected && 'ring-2 ring-indigo-400 ring-offset-2',
        isImpacted && 'animate-pulse ring-2 ring-orange-400'
      )}
      style={{ minWidth: 260, maxWidth: 320 }}
      title="Right-click to analyze impact"
    >
      {/* Impact Badge */}
      {isImpacted && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shadow-lg">
            ⚡
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className={clsx('px-3 py-2.5', statusConfig.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold text-white text-sm tracking-tight">{table.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {tableChanges.length > 0 && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-medium text-white">
                {tableChanges.length} changes
              </span>
            )}
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px] font-medium text-white">
              {table.columns?.length || 0}
            </span>
          </div>
        </div>
        {table.schema && table.schema !== 'public' && (
          <span className="text-[10px] text-white/70 mt-0.5 block">{table.schema}</span>
        )}
      </div>

      {/* Columns */}
      <div className="divide-y divide-slate-100">
        {/* Primary Key Section */}
        {pkColumns.length > 0 && (
          <div className="bg-amber-50/50">
            {pkColumns.map((column) => (
              <ColumnRow
                key={column.name}
                column={column}
                isPK
                devMode={devMode}
              />
            ))}
          </div>
        )}

        {/* Foreign Key Section */}
        {fkColumns.length > 0 && (
          <div className="bg-indigo-50/30">
            {fkColumns.map((column) => (
              <ColumnRow
                key={column.name}
                column={column}
                isFK
                devMode={devMode}
              />
            ))}
          </div>
        )}

        {/* Regular Columns */}
        <div className="max-h-[200px] overflow-y-auto scrollbar-thin">
          {regularColumns.map((column) => (
            <ColumnRow
              key={column.name}
              column={column}
              devMode={devMode}
            />
          ))}
        </div>

        {/* Empty State */}
        {(!table.columns || table.columns.length === 0) && (
          <div className="px-3 py-6 text-center text-slate-400 text-xs">
            No columns defined
          </div>
        )}
      </div>
    </div>
  );
});

// Column Row Component
const ColumnRow = memo(({ column, isPK, isFK, devMode }) => {
  const typeConfig = getTypeConfig(column.type);
  const colors = COLOR_CLASSES[typeConfig.color] || COLOR_CLASSES.slate;

  return (
    <div className="relative px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50/80 transition-colors group/row">
      {/* Left Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id={column.name}
        className={clsx(
          '!w-2.5 !h-2.5 !border-2 !border-white !-left-1',
          '!bg-slate-300 group-hover/row:!bg-indigo-400',
          'transition-colors'
        )}
      />

      {/* Key Icon */}
      <div className="flex-shrink-0 w-5 flex justify-center">
        {isPK ? (
          <span className="text-amber-500 text-sm" title="Primary Key">🔑</span>
        ) : isFK ? (
          <span className="text-indigo-500 text-sm" title="Foreign Key">🔗</span>
        ) : (
          <span className={clsx('text-[10px] font-bold', colors.text)}>{typeConfig.icon}</span>
        )}
      </div>

      {/* Column Name */}
      <span className={clsx(
        'flex-1 text-xs font-medium truncate',
        isPK ? 'text-amber-700' : isFK ? 'text-indigo-700' : 'text-slate-700'
      )}>
        {column.name}
        {!column.nullable && <span className="text-red-400 ml-0.5">*</span>}
      </span>

      {/* Type Badge */}
      <span className={clsx(
        'px-1.5 py-0.5 rounded text-[10px] font-medium',
        colors.bg,
        colors.text
      )}>
        {devMode ? column.type : typeConfig.label}
      </span>

      {/* Right Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={column.name}
        className={clsx(
          '!w-2.5 !h-2.5 !border-2 !border-white !-right-1',
          '!bg-slate-300 group-hover/row:!bg-indigo-400',
          'transition-colors'
        )}
      />
    </div>
  );
});

ColumnRow.displayName = 'ColumnRow';
TableNode.displayName = 'TableNode';

export default TableNode;
