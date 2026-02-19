'use client';

/**
 * Header - Professional top navigation bar
 */
import { useState, useEffect } from 'react';
import { useAuthStore, useConnectionStore, useUIStore, useSchemaStore } from '../../store/store';
import {
  Bars3Icon,
  BoltIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ServerStackIcon,
  SignalIcon,
  ShieldExclamationIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { activeConnection, disconnect } = useConnectionStore();
  const { toggleSidebar, setConnectDialogOpen } = useUIStore();
  const { devMode, toggleDevMode, tables } = useSchemaStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Developer': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <BoltIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight">SchemaFlow</span>
            <span className="text-[10px] text-slate-400 ml-1.5 font-medium">v2.0</span>
          </div>
        </div>

        {/* Divider */}
        {activeConnection && <div className="w-px h-6 bg-slate-200 mx-2" />}

        {/* Connection status */}
        {activeConnection && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                <SignalIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">
                  {activeConnection.database || 'Connected'}
                </span>
                <span className="text-xs text-emerald-600/70">
                  ({tables?.length || 0} tables)
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50"
                sideOffset={5}
                align="start"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <div className="text-xs text-slate-500 mb-1">Connected to</div>
                  <div className="text-sm font-medium text-slate-900">{activeConnection.host}:{activeConnection.port}</div>
                  <div className="text-xs text-slate-600">{activeConnection.database}</div>
                </div>
                <DropdownMenu.Item
                  onClick={disconnect}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none"
                >
                  <ServerStackIcon className="w-4 h-4" />
                  Disconnect
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Impact Analysis Button */}
        {activeConnection && (
          <button
            onClick={() => useUIStore.getState().setImpactPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <ShieldExclamationIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Impact Analysis</span>
          </button>
        )}

        {/* Dev Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          <CodeBracketIcon className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">SQL Types</span>
          <Switch.Root
            checked={devMode}
            onCheckedChange={toggleDevMode}
            className="w-8 h-[18px] bg-slate-300 rounded-full relative data-[state=checked]:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Switch.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[14px]" />
          </Switch.Root>
        </div>

        {/* Connect Button */}
        {!activeConnection && (
          <button
            onClick={() => setConnectDialogOpen(true)}
            className="btn-primary btn-sm"
          >
            <ServerStackIcon className="w-4 h-4" />
            Connect
          </button>
        )}

        {/* User Menu */}
        {mounted && isAuthenticated && user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors ml-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-slate-800 leading-tight">{user.name || user.email?.split('@')[0]}</div>
                  <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>{user.role}</div>
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[180px] bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-50"
                sideOffset={5}
                align="end"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-sm font-medium text-slate-900">{user.name || user.email}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer outline-none">
                  <Cog6ToothIcon className="w-4 h-4" />
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
                <DropdownMenu.Item
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer outline-none"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
}
