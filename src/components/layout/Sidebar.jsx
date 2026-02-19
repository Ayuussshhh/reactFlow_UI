'use client';

/**
 * Sidebar - Professional left navigation and table explorer
 */
import { useUIStore, useSchemaStore, useCanvasStore, useProposalStore, useAuthStore } from '../../store/store';
import { ROLES } from '../auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TableCellsIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentPlusIcon,
  FolderIcon,
  ChevronRightIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';

export default function Sidebar() {
  const { sidebarOpen, setProposalPanelOpen } = useUIStore();
  const { tables, foreignKeys } = useSchemaStore();
  const { setSelectedNode, nodes } = useCanvasStore();
  const { draftChanges } = useProposalStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSchemas, setExpandedSchemas] = useState(['public']);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role-based permissions
  const canModifySchema = mounted && user && (user.role === ROLES.ADMIN || user.role === ROLES.DEVELOPER);
  const canApproveChanges = mounted && user && user.role === ROLES.ADMIN;

  // Group tables by schema
  const tablesBySchema = useMemo(() => {
    const groups = {};
    tables.forEach((table) => {
      const schema = table.schema || 'public';
      if (!groups[schema]) groups[schema] = [];
      groups[schema].push(table);
    });
    // Sort tables alphabetically within each schema
    Object.keys(groups).forEach(schema => {
      groups[schema].sort((a, b) => a.name.localeCompare(b.name));
    });
    return groups;
  }, [tables]);

  // Filter tables by search
  const filteredSchemas = useMemo(() => {
    if (!searchQuery) return tablesBySchema;
    
    const filtered = {};
    Object.entries(tablesBySchema).forEach(([schema, schemaTables]) => {
      const matches = schemaTables.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matches.length > 0) filtered[schema] = matches;
    });
    return filtered;
  }, [tablesBySchema, searchQuery]);

  const toggleSchema = (schema) => {
    setExpandedSchemas((prev) =>
      prev.includes(schema)
        ? prev.filter((s) => s !== schema)
        : [...prev, schema]
    );
  };

  const handleTableClick = (tableName) => {
    const node = nodes.find((n) => n.id === tableName);
    if (node) {
      setSelectedNode(node);
    }
  };

  // Get FK count for a table
  const getTableFKCount = (tableName) => {
    return foreignKeys?.filter(fk => 
      fk.sourceTable === tableName || fk.fromTable === tableName
    ).length || 0;
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Schema Explorer</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 flex gap-2 border-b border-slate-100 bg-slate-50/50">
            {canModifySchema ? (
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                <PlusIcon className="w-3.5 h-3.5" />
                New Table
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed" title="Viewers cannot create tables">
                <PlusIcon className="w-3.5 h-3.5" />
                View Only
              </div>
            )}
            <button
              onClick={() => setProposalPanelOpen(true)}
              className="relative flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <DocumentPlusIcon className="w-3.5 h-3.5" />
              Proposals
              {draftChanges.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {draftChanges.length}
                </span>
              )}
            </button>
          </div>

          {/* Table List */}
          <div className="flex-1 overflow-y-auto">
            {Object.entries(filteredSchemas).map(([schema, schemaTables]) => (
              <div key={schema}>
                {/* Schema Header */}
                <button
                  onClick={() => toggleSchema(schema)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <ChevronRightIcon
                    className={clsx(
                      'w-3 h-3 transition-transform duration-200',
                      expandedSchemas.includes(schema) && 'rotate-90'
                    )}
                  />
                  <FolderIcon className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">{schema}</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                    {schemaTables.length}
                  </span>
                </button>

                {/* Tables */}
                <AnimatePresence>
                  {expandedSchemas.includes(schema) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden bg-slate-50/30"
                    >
                      {schemaTables.map((table) => {
                        const fkCount = getTableFKCount(table.name);
                        return (
                          <button
                            key={table.name}
                            onClick={() => handleTableClick(table.name)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-white transition-colors border-l-2 border-transparent hover:border-indigo-400"
                          >
                            <TableCellsIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <span className="flex-1 truncate text-left font-medium">{table.name}</span>
                            <div className="flex items-center gap-1.5">
                              {fkCount > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px] text-slate-400" title={`${fkCount} foreign keys`}>
                                  <KeyIcon className="w-3 h-3" />
                                  {fkCount}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 bg-slate-200/50 text-slate-500 rounded text-[10px] font-medium">
                                {table.columns?.length || 0}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Empty State */}
            {Object.keys(filteredSchemas).length === 0 && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TableCellsIcon className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {searchQuery ? 'No tables found' : 'No tables yet'}
                </p>
                <p className="text-xs text-slate-400">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Connect to a database to explore'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <TableCellsIcon className="w-3.5 h-3.5" />
                  {tables.length} tables
                </span>
                <span className="flex items-center gap-1">
                  <KeyIcon className="w-3.5 h-3.5" />
                  {foreignKeys?.length || 0} FKs
                </span>
              </div>
              {draftChanges.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">
                  {draftChanges.length} pending
                </span>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
