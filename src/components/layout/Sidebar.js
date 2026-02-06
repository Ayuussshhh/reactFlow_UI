/**
 * Sidebar - Object Explorer Panel
 * Clean, modern design inspired by Figma, Notion, and Airtable
 * 
 * Features:
 * - Database connection status
 * - Object list with icons
 * - Search functionality
 * - Quick actions
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CircleStackIcon,
  TableCellsIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  LinkIcon,
  EllipsisHorizontalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';

// Object item in the list
function ObjectItem({ object, isSelected, onSelect }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-gray-100 text-gray-900"
          : "hover:bg-gray-50 text-gray-700"
      )}
      onClick={() => onSelect(object)}
    >
      {/* Icon */}
      <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
        <TableCellsIcon className="w-3.5 h-3.5 text-gray-500" />
      </div>

      {/* Name & Meta */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{object.name || 'Untitled'}</p>
        <p className="text-[10px] text-gray-400">
          {object.columns?.length || 0} fields
        </p>
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <EllipsisHorizontalIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 w-32 p-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement delete
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Database item
function DatabaseItem({ name, isConnected, isExpanded, onConnect, onToggle, onDelete }) {
  return (
    <div className="group">
      <button
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors",
          isConnected
            ? "bg-emerald-50 text-emerald-700"
            : "hover:bg-gray-50 text-gray-700"
        )}
        onClick={() => {
          if (!isConnected) {
            onConnect(name);
          }
          onToggle();
        }}
      >
        {/* Expand Arrow */}
        <ChevronRightIcon
          className={cn(
            "w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0",
            isExpanded && "rotate-90"
          )}
        />

        {/* Icon */}
        <div className={cn(
          "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
          isConnected ? "bg-emerald-100" : "bg-gray-100"
        )}>
          <CircleStackIcon className={cn(
            "w-3.5 h-3.5",
            isConnected ? "text-emerald-600" : "text-gray-500"
          )} />
        </div>

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-left truncate">{name}</span>

        {/* Status */}
        {isConnected && (
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        )}
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDbs, setExpandedDbs] = useState(new Set());

  const {
    databases = [],
    connection,
    isLoadingDatabases,
    fetchDatabases,
    connectToDatabase,
    disconnectDatabase,
    tables = [],
    fetchTables,
    setSelectedObject,
    setSidePanelOpen,
  } = useAppStore();

  // Fetch databases on mount
  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  // Fetch tables when connected
  useEffect(() => {
    if (connection.isConnected) {
      console.log('[Sidebar] Connected to database, fetching tables...');
      fetchTables();
    } else {
      console.log('[Sidebar] Disconnected, clearing tables');
    }
  }, [connection.isConnected, fetchTables]);

  // Toggle database expansion
  const toggleExpand = (dbName) => {
    const newExpanded = new Set(expandedDbs);
    if (newExpanded.has(dbName)) {
      newExpanded.delete(dbName);
    } else {
      newExpanded.add(dbName);
    }
    setExpandedDbs(newExpanded);
  };

  // Handle database connection
  const handleConnect = async (dbName) => {
    console.log('[Sidebar] Connecting to database:', dbName);
    await connectToDatabase(dbName);
    setExpandedDbs(new Set([dbName]));
  };

  // Handle table selection
  const handleObjectSelect = (table) => {
    console.log('[Sidebar] Table selected:', table.name);
    setSelectedObject({ 
      id: `table-${table.name}`, 
      type: 'table', 
      data: {
        label: table.name,
        columns: table.columns,
        schema: table.schema,
      }
    });
    setSidePanelOpen(true);
  };

  // Filter databases by search
  const filteredDatabases = useMemo(() => (
    (databases || []).filter(db =>
      db.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ), [databases, searchQuery]);

  // Filter tables by search
  const filteredTables = useMemo(() => (
    (tables || []).filter(table =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ), [tables, searchQuery]);

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 260, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col bg-white border-r border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Explorer
          </h2>
          <button
            onClick={fetchDatabases}
            className={cn(
              "p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors",
              isLoadingDatabases && "animate-spin"
            )}
            title="Refresh"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all"
          />
        </div>
      </div>

      {/* Connection Status */}
      {connection.isConnected && (
        <div className="flex-shrink-0 mx-3 mt-3 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-600">Connected</span>
            </div>
            <button
              onClick={disconnectDatabase}
              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Disconnect
            </button>
          </div>
          <p className="mt-1 text-sm font-semibold text-emerald-800 truncate">
            {connection.database}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Databases Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Databases
            </h3>
            <button
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Add Database"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredDatabases.length === 0 ? (
            <div className="py-4 text-center">
              <CircleStackIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">No databases found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredDatabases.map((db) => (
                <DatabaseItem
                  key={db}
                  name={db}
                  isConnected={connection.database === db}
                  isExpanded={expandedDbs.has(db)}
                  onConnect={handleConnect}
                  onToggle={() => toggleExpand(db)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Objects Section (when connected) */}
        {connection.isConnected && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Tables
              </h3>
              <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded">
                {filteredTables.length}
              </span>
            </div>

            {filteredTables.length === 0 ? (
              <div className="py-4 text-center">
                <SparklesIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400">
                  {searchQuery ? 'No matching tables' : 'No tables yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredTables.map((table) => (
                  <ObjectItem
                    key={table.name}
                    object={table}
                    isSelected={false}
                    onSelect={handleObjectSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-gray-100">
        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
          <PlusIcon className="w-3.5 h-3.5" />
          New Table
        </button>
      </div>
    </motion.aside>
  );
}
