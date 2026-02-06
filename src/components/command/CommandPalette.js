/**
 * CommandPalette - Notion/Slack style command bar
 * Triggered by Cmd+K / Ctrl+K
 * 
 * Features:
 * - Quick search for objects, commands, settings
 * - Keyboard navigation
 * - Recent actions
 * - Context-aware suggestions
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TableCellsIcon,
  CircleStackIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  KeyIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAppStore, useCanvasStore } from '../../store';
import { v4 as uuidv4 } from 'uuid';

// Command definitions
const commands = [
  {
    id: 'new-object',
    icon: PlusIcon,
    title: 'New Object',
    description: 'Create a new database object',
    shortcut: '⌘N',
    category: 'Create',
    keywords: ['create', 'add', 'table', 'new'],
  },
  {
    id: 'new-field',
    icon: PlusIcon,
    title: 'New Field',
    description: 'Add a field to selected object',
    category: 'Create',
    keywords: ['add', 'column', 'field', 'attribute'],
  },
  {
    id: 'new-link',
    icon: LinkIcon,
    title: 'New Link',
    description: 'Create a relationship between objects',
    category: 'Create',
    keywords: ['relation', 'foreign', 'key', 'connect'],
  },
  {
    id: 'import-csv',
    icon: ArrowUpTrayIcon,
    title: 'Import CSV',
    description: 'Import data from CSV file',
    shortcut: '⌘I',
    category: 'Import/Export',
    keywords: ['upload', 'file', 'data'],
  },
  {
    id: 'export-sql',
    icon: ArrowDownTrayIcon,
    title: 'Export SQL',
    description: 'Export schema as SQL',
    shortcut: '⌘E',
    category: 'Import/Export',
    keywords: ['download', 'save', 'sql'],
  },
  {
    id: 'export-typescript',
    icon: DocumentTextIcon,
    title: 'Export TypeScript',
    description: 'Generate TypeScript types',
    category: 'Import/Export',
    keywords: ['ts', 'types', 'code'],
  },
  {
    id: 'connect-database',
    icon: CircleStackIcon,
    title: 'Connect Database',
    description: 'Connect to PostgreSQL database',
    category: 'Database',
    keywords: ['postgres', 'connect', 'db'],
  },
  {
    id: 'refresh',
    icon: ArrowPathIcon,
    title: 'Refresh',
    description: 'Refresh data from database',
    shortcut: '⌘R',
    category: 'Database',
    keywords: ['reload', 'sync', 'update'],
  },
  {
    id: 'auto-layout',
    icon: Square3Stack3DIcon,
    title: 'Auto Layout',
    description: 'Organize objects in a grid',
    shortcut: '⌘L',
    category: 'View',
    keywords: ['arrange', 'organize', 'grid'],
  },
  {
    id: 'settings',
    icon: Cog6ToothIcon,
    title: 'Settings',
    description: 'Open application settings',
    shortcut: '⌘,',
    category: 'Settings',
    keywords: ['preferences', 'config', 'options'],
  },
];

// Command item component
function CommandItem({ command, isActive, onSelect }) {
  const Icon = command.icon;
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(command)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
        isActive 
          ? "bg-primary-50 text-primary-700" 
          : "text-neutral-700 hover:bg-neutral-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        isActive ? "bg-primary-100" : "bg-neutral-100"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isActive ? "text-primary-600" : "text-neutral-500"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{command.title}</p>
        <p className="text-xs text-neutral-500 truncate">{command.description}</p>
      </div>
      {command.shortcut && (
        <kbd className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-xs text-neutral-500 font-mono">
          {command.shortcut}
        </kbd>
      )}
    </motion.button>
  );
}

// Object result item
function ObjectItem({ object, isActive, onSelect }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(object)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
        isActive 
          ? "bg-primary-50 text-primary-700" 
          : "text-neutral-700 hover:bg-neutral-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
        isActive ? "bg-primary-100" : "bg-neutral-100"
      )}>
        <TableCellsIcon className={cn(
          "w-5 h-5",
          isActive ? "text-primary-600" : "text-neutral-500"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{object.data?.label || 'Untitled'}</p>
        <p className="text-xs text-neutral-500 truncate">
          {object.data?.columns?.length || 0} fields
          {object.data?.sampleData?.length > 0 && ` • ${object.data.sampleData.length} rows`}
        </p>
      </div>
      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
    </motion.button>
  );
}

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState('all'); // 'all', 'commands', 'objects'
  const inputRef = useRef(null);

  const { nodes, addNode } = useCanvasStore();
  const { 
    addNotification, 
    setSelectedObject, 
    setSidePanelOpen,
    fetchTables,
    fetchDatabases,
  } = useAppStore();

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter results based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      cmd.keywords.some(k => k.includes(lowerQuery))
    );
  }, [query]);

  const filteredObjects = useMemo(() => {
    if (!query) return nodes.slice(0, 5);
    
    const lowerQuery = query.toLowerCase();
    return nodes.filter(node => 
      node.data?.label?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [query, nodes]);

  // Combined results
  const allResults = useMemo(() => {
    return {
      commands: mode !== 'objects' ? filteredCommands : [],
      objects: mode !== 'commands' ? filteredObjects : [],
    };
  }, [filteredCommands, filteredObjects, mode]);

  const totalResults = allResults.commands.length + allResults.objects.length;

  // Navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % totalResults);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + totalResults) % totalResults);
          break;
        case 'Enter':
          e.preventDefault();
          handleSelectByIndex(activeIndex);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, totalResults, onClose]);

  // Handle command execution
  const handleCommand = useCallback((command) => {
    switch (command.id) {
      case 'new-object':
        const newNode = {
          id: uuidv4(),
          type: 'objectCard',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
          data: {
            label: 'New Object',
            columns: [
              { name: 'id', type: 'serial', nullable: false },
              { name: 'name', type: 'varchar', nullable: false },
              { name: 'created_at', type: 'timestamp', nullable: false },
            ],
            primaryKeys: ['id'],
            foreignKeys: {},
            sampleData: [],
            color: ['blue', 'purple', 'green', 'orange', 'pink', 'indigo'][Math.floor(Math.random() * 6)],
          },
        };
        addNode(newNode);
        addNotification('New object created', 'success');
        break;
      case 'refresh':
        fetchTables();
        fetchDatabases();
        addNotification('Refreshing data...', 'info');
        break;
      case 'export-sql':
        addNotification('SQL export coming soon', 'info');
        break;
      default:
        addNotification(`${command.title} coming soon`, 'info');
    }
    onClose();
  }, [addNode, addNotification, fetchTables, fetchDatabases, onClose]);

  // Handle object selection
  const handleObjectSelect = useCallback((object) => {
    setSelectedObject({ id: object.id, type: 'table', data: object.data });
    setSidePanelOpen(true);
    onClose();
  }, [setSelectedObject, setSidePanelOpen, onClose]);

  // Handle selection by index
  const handleSelectByIndex = useCallback((index) => {
    const commandCount = allResults.commands.length;
    
    if (index < commandCount) {
      handleCommand(allResults.commands[index]);
    } else {
      handleObjectSelect(allResults.objects[index - commandCount]);
    }
  }, [allResults, handleCommand, handleObjectSelect]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200">
            <MagnifyingGlassIcon className="w-6 h-6 text-neutral-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, objects..."
              className="flex-1 text-lg bg-transparent border-0 outline-none placeholder-neutral-400"
            />
            <kbd className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded text-xs text-neutral-500 font-mono">
              esc
            </kbd>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-neutral-100 bg-neutral-50">
            <button
              onClick={() => setMode('all')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                mode === 'all' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              All
            </button>
            <button
              onClick={() => setMode('commands')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                mode === 'commands' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Commands
            </button>
            <button
              onClick={() => setMode('objects')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                mode === 'objects' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              Objects
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {totalResults === 0 ? (
              <div className="py-12 text-center">
                <SparklesIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No results found</p>
                <p className="text-sm text-neutral-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {/* Commands Section */}
                {allResults.commands.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-neutral-50">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Commands
                      </span>
                    </div>
                    {allResults.commands.map((cmd, idx) => (
                      <CommandItem
                        key={cmd.id}
                        command={cmd}
                        isActive={activeIndex === idx}
                        onSelect={handleCommand}
                      />
                    ))}
                  </div>
                )}

                {/* Objects Section */}
                {allResults.objects.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-neutral-50">
                      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Objects
                      </span>
                    </div>
                    {allResults.objects.map((obj, idx) => (
                      <ObjectItem
                        key={obj.id}
                        object={obj}
                        isActive={activeIndex === allResults.commands.length + idx}
                        onSelect={handleObjectSelect}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <CommandLineIcon className="w-3.5 h-3.5" />
              ObjectFlow
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
