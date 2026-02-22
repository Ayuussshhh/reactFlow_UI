'use client';

/**
 * Project Dashboard - Individual project workspace
 * Handles database connections and schema visualization for specific project
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from '@xyflow/react';
import {
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { Header, Sidebar } from '../../../components/layout';
import { SchemaCanvas } from '../../../components/canvas';
import { ProposalPanel, ImpactPanel } from '../../../components/panels';
import { ConnectDialog } from '../../../components/dialogs';
import { AuthGuard } from '../../../components/auth';
import { useProjectStore } from '../../../store/projectStore';
import { useConnectionStore, useUIStore } from '../../../store/store';

export default function ProjectDashboardPage({ params }) {
  const router = useRouter();
  const paramData = useParams();
  const projectId = paramData?.projectId || params?.projectId;

  const {
    currentProject,
    currentConnection,
    isLoading,
    error,
    getProject,
  } = useProjectStore();

  const { activeConnection } = useConnectionStore();
  const { setConnectDialogOpen } = useUIStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check mobile on mount
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load project
  useEffect(() => {
    if (mounted && projectId) {
      getProject(projectId).catch(() => {
        router.push('/projects');
      });
    }
  }, [projectId, mounted, getProject, router]);

  if (!mounted) return null;

  if (error && !currentProject) {
    return (
      <AuthGuard>
        <div className="w-full h-screen flex flex-col items-center justify-center bg-rose-50">
          <div className="text-center max-w-md mx-auto px-4">
            <ExclamationTriangleIcon className="w-16 h-16 text-rose-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-rose-900 mb-2">Error</h2>
            <p className="text-rose-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ReactFlowProvider>
        <div className="h-screen flex flex-col overflow-hidden bg-white md:bg-neutral-50">
          {/* Header - Mobile responsive */}
          <div className="border-b border-neutral-200 bg-white shadow-sm h-16 px-3 md:px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600 hover:text-neutral-900 flex-shrink-0"
                title="Back to projects"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-semibold text-neutral-900 truncate">
                  {currentProject?.name || 'Loading...'}
                </h1>
                {currentProject?.description && (
                  <p className="text-xs text-neutral-500 truncate hidden sm:block">
                    {currentProject.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Toolbar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Connection Status Badge */}
              {activeConnection || currentConnection ? (
                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs md:text-sm font-medium text-green-700 hidden sm:inline">Connected</span>
                  <span className="text-xs font-medium text-green-700 sm:hidden">✓</span>
                </div>
              ) : (
                <button
                  onClick={() => setConnectDialogOpen(true)}
                  className="px-2 md:px-4 py-1.5 md:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
                >
                  Connect DB
                </button>
              )}

              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors md:hidden"
                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>

              <Header />
            </div>
          </div>

          {/* Main Content Area with responsive layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar - Desktop always visible, mobile overlay */}
            {sidebarOpen && (
              <>
                <div className="hidden md:block md:w-64 border-r border-neutral-200 bg-neutral-50 overflow-y-auto">
                  <Sidebar />
                </div>
                {/* Mobile overlay */}
                <div className="md:hidden absolute left-0 top-0 bottom-0 w-64 border-r border-neutral-200 bg-neutral-50 overflow-y-auto shadow-lg z-40">
                  <Sidebar />
                </div>
              </>
            )}

            {/* Canvas Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                  <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="mt-3 text-neutral-600 text-sm">Loading project...</p>
                  </div>
                </div>
              ) : activeConnection || currentConnection ? (
                <SchemaCanvas />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          {/* Panels */}
          <ProposalPanel />
          <ImpactPanel />

          {/* Dialogs */}
          <ConnectDialog />

          {/* Mobile overlay for sidebar */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 top-16"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Toast notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'text-sm',
              style: {
                background: '#18181b',
                color: '#fff',
                borderRadius: '8px',
              },
            }}
          />
        </div>
      </ReactFlowProvider>
    </AuthGuard>
  );
}

// Empty state component
function EmptyState() {
  const { setConnectDialogOpen } = useUIStore();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4">
      <div className="text-center max-w-lg">
        {/* Animated database icon */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8">
          <div className="absolute inset-0 bg-indigo-200 rounded-2xl rotate-6 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3 tracking-tight">
          No database connected
        </h2>
        <p className="text-slate-600 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
          Connect your database to start exploring and managing your schema with SchemaFlow.
        </p>

        <button
          onClick={() => setConnectDialogOpen(true)}
          className="px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 text-sm md:text-base"
        >
          Connect Database
        </button>
      </div>
    </div>
  );
}
