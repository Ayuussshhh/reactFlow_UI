'use client';

/**
 * Dashboard - Main workspace with React Flow canvas
 * Protected route - requires authentication
 */
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from '@xyflow/react';

import { Header, Sidebar } from '../../components/layout';
import { SchemaCanvas } from '../../components/canvas';
import { ProposalPanel, ImpactPanel } from '../../components/panels';
import { ConnectDialog } from '../../components/dialogs';
import { AuthGuard } from '../../components/auth';
import { useAuthStore, useConnectionStore } from '../../store/store';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { activeConnection } = useConnectionStore();

  return (
    <AuthGuard>
      <ReactFlowProvider>
        <div className="h-screen flex flex-col overflow-hidden bg-neutral-50">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Canvas Area */}
            <main className="flex-1 relative overflow-hidden">
              {activeConnection ? (
                <SchemaCanvas />
              ) : (
                <EmptyState />
              )}
            </main>
          </div>

          {/* Panels */}
          <ProposalPanel />
          <ImpactPanel />

          {/* Dialogs */}
          <ConnectDialog />

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

// Empty state when no connection
function EmptyState() {
  const { setConnectDialogOpen } = require('../../store/store').useUIStore();

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="text-center max-w-lg px-6">
        {/* Animated database icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-200 rounded-2xl rotate-6 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
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

        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Welcome to SchemaFlow
        </h2>
        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
          Visualize, explore, and manage your PostgreSQL database schema with a beautiful, interactive canvas.
        </p>

        <button
          onClick={() => setConnectDialogOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Connect Database
        </button>

        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-left">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Visual ERD</h3>
            <p className="text-xs text-slate-500">Interactive schema diagrams</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Change Proposals</h3>
            <p className="text-xs text-slate-500">Safe schema modifications</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Team Collaboration</h3>
            <p className="text-xs text-slate-500">Review and approve changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
