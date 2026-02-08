/**
 * DatabaseView - Main database workspace view
 * "Figma for Database" - Object-First Canvas Experience
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { TldrawCanvas } from '../../components/canvas';
import { Sidebar } from '../../components/layout';
import { SidePanel } from '../../components/panels';
import { CommandPalette } from '../../components/command';
import { Header } from '../../components/layout';
import { ConnectDatabaseDialog } from '../../components/dialogs';
import { useAppStore, useCanvasStore } from '../../store';
import { cn } from '../../lib/utils';

export default function DatabaseView() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  
  const { 
    selectedObject,
    setSelectedObject,
    sidePanelOpen,
    setSidePanelOpen,
    notifications,
    clearNotification,
    activeConnection,
    connection,
    connectWithConnectionString,
    fetchConnections,
    tables,
    foreignKeys,
    isLoadingSchema,
  } = useAppStore();

  const { buildNodesFromTables, buildEdgesFromForeignKeys } = useCanvasStore();

  // Check for existing connections on mount
  useEffect(() => {
    const initialize = async () => {
      const connections = await fetchConnections();
      
      // If no active connection, show the connect dialog
      if (!connections || connections.length === 0 || !connections.some(c => c.is_active)) {
        setShowConnectDialog(true);
      }
    };
    
    initialize();
  }, [fetchConnections]);

  // Build canvas nodes when tables change
  useEffect(() => {
    if (tables && tables.length > 0) {
      console.log('[DatabaseView] Building nodes from tables:', tables.length);
      buildNodesFromTables(tables);
      
      if (foreignKeys && foreignKeys.length > 0) {
        console.log('[DatabaseView] Building edges from foreign keys:', foreignKeys.length);
        buildEdgesFromForeignKeys(foreignKeys);
      }
    }
  }, [tables, foreignKeys, buildNodesFromTables, buildEdgesFromForeignKeys]);

  // Handle successful connection
  const handleConnected = async (result) => {
    console.log('[DatabaseView] Connected:', result);
    setShowConnectDialog(false);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      
      // Escape - Close panels
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (sidePanelOpen) {
          setSidePanelOpen(false);
          setSelectedObject(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, sidePanelOpen, setSidePanelOpen, setSelectedObject]);

  // Show toast notifications
  useEffect(() => {
    notifications.forEach((notif) => {
      const toastOptions = {
        id: notif.id,
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1a1a1a',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          padding: '16px 20px',
          fontSize: '14px',
        },
      };

      switch (notif.type) {
        case 'success':
          toast.success(notif.message, toastOptions);
          break;
        case 'error':
          toast.error(notif.message, toastOptions);
          break;
        default:
          toast(notif.message, toastOptions);
      }

      clearNotification(notif.id);
    });
  }, [notifications, clearNotification]);

  // Handle object selection for side panel
  const handleObjectSelect = useCallback((object) => {
    setSelectedObject(object);
    setSidePanelOpen(true);
  }, [setSelectedObject, setSidePanelOpen]);

  return (
    <div className="h-screen flex flex-col bg-canvas overflow-hidden">
      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{ className: 'font-sans' }}
      />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Connect Database Dialog */}
      <ConnectDatabaseDialog
        open={showConnectDialog}
        onClose={() => setShowConnectDialog(false)}
        onConnected={handleConnected}
      />

      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenConnect={() => setShowConnectDialog(true)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Object Explorer Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <Sidebar />
          )}
        </AnimatePresence>

        {/* Object Canvas */}
        <div className="flex-1 relative">
          {isLoadingSchema ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
                <p className="text-sm text-gray-600 font-medium">Introspecting schema...</p>
                <p className="text-xs text-gray-400 mt-1">Reading tables, columns, and relationships</p>
              </div>
            </div>
          ) : null}
          <TldrawCanvas />
        </div>

        {/* Side Panel (Notion-style peek) */}
        <AnimatePresence>
          {sidePanelOpen && selectedObject && (
            <SidePanel
              object={selectedObject}
              onClose={() => {
                setSidePanelOpen(false);
                setSelectedObject(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 flex items-center justify-between bg-gray-50 border-t border-gray-200 text-[10px] text-gray-500">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-600">SchemaFlow</span>
          <span className="text-gray-300">•</span>
          <span>Rust + Next.js</span>
        </div>
        <div className="flex items-center gap-3">
          <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] text-gray-400 font-mono">
            ⌘K
          </kbd>
          <span>Commands</span>
        </div>
      </div>
    </div>
  );
}
