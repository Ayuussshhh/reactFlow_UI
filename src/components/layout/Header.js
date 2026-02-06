/**
 * Header - Top navigation bar
 * Clean, minimal design
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store';
import { cn } from '../../lib/utils';

export default function Header({ onToggleSidebar, onOpenCommandPalette, sidebarOpen }) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const { connection, setSQLPanelOpen, sqlPanelOpen } = useAppStore();

  return (
    <header className="flex-shrink-0 h-12 flex items-center justify-between px-3 bg-white border-b border-gray-200">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
            <CircleStackIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm hidden sm:block">SchemaFlow</span>
        </Link>

        <span className="text-gray-300 hidden sm:block">|</span>

        {/* Project Name */}
        <span className="text-sm text-gray-600 hidden sm:block">Untitled Project</span>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {/* Connection Status */}
        {connection.isConnected && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md mr-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-medium text-emerald-700">{connection.database}</span>
          </div>
        )}

        {/* SQL Toggle */}
        <button
          onClick={() => setSQLPanelOpen(!sqlPanelOpen)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all",
            sqlPanelOpen
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <CodeBracketIcon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">SQL</span>
        </button>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">Export</span>
            <ChevronDownIcon className={cn(
              "w-3 h-3 transition-transform",
              exportMenuOpen && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {exportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-44 p-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                    <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                    SQL
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                    <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                    TypeScript
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                    <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                    Rust (SeaORM)
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                    <ShareIcon className="w-4 h-4 text-gray-400" />
                    Share
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Import */}
        <button className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowUpTrayIcon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Import</span>
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 ml-1 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
          U
        </div>
      </div>
    </header>
  );
}
