'use client';

/**
 * ProposalPanel - Side panel for managing schema change proposals
 */
import { useUIStore, useProposalStore, useAuthStore } from '../../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import clsx from 'clsx';

// Change type badges
const ChangeTypeBadge = ({ type }) => {
  const config = {
    CreateTable: { label: 'New Table', class: 'badge-success' },
    DropTable: { label: 'Drop Table', class: 'badge-danger' },
    AddColumn: { label: 'Add Column', class: 'badge-primary' },
    DropColumn: { label: 'Drop Column', class: 'badge-danger' },
    AlterColumn: { label: 'Modify', class: 'badge-warning' },
    AddIndex: { label: 'Add Index', class: 'badge-neutral' },
  };
  
  const { label, class: badgeClass } = config[type] || { label: type, class: 'badge-neutral' };
  
  return <span className={badgeClass}>{label}</span>;
};

// Status indicator
const StatusIndicator = ({ status }) => {
  const config = {
    Draft: { icon: DocumentTextIcon, color: 'text-neutral-500', label: 'Draft' },
    PendingReview: { icon: ClockIcon, color: 'text-amber-500', label: 'Pending Review' },
    Approved: { icon: CheckIcon, color: 'text-green-500', label: 'Approved' },
    Rejected: { icon: XMarkIcon, color: 'text-red-500', label: 'Rejected' },
    Executing: { icon: PlayIcon, color: 'text-indigo-500', label: 'Executing' },
  };
  
  const { icon: Icon, color, label } = config[status] || config.Draft;
  
  return (
    <div className={clsx('flex items-center gap-1.5', color)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default function ProposalPanel() {
  const { proposalPanelOpen, setProposalPanelOpen } = useUIStore();
  const { draftChanges, removeDraftChange, clearDraftChanges, proposals } = useProposalStore();
  const { user } = useAuthStore();
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');

  const canApprove = user?.role === 'Admin' || user?.role === 'Developer';
  const canExecute = user?.role === 'Admin';

  const handleCreateProposal = () => {
    // TODO: Create proposal via API
    console.log('Creating proposal:', {
      title: proposalTitle,
      description: proposalDescription,
      changes: draftChanges,
    });
    clearDraftChanges();
    setProposalTitle('');
    setProposalDescription('');
  };

  return (
    <AnimatePresence>
      {proposalPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={() => setProposalPanelOpen(false)}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Schema Proposals
              </h2>
              <button
                onClick={() => setProposalPanelOpen(false)}
                className="btn-ghost p-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Draft Changes Section */}
              {draftChanges.length > 0 && (
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-700">
                      Draft Changes ({draftChanges.length})
                    </h3>
                    <button
                      onClick={clearDraftChanges}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {draftChanges.map((change) => (
                      <div
                        key={change.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <ChangeTypeBadge type={change.type} />
                          <span className="text-sm text-neutral-700">
                            {change.tableName || change.table}
                          </span>
                        </div>
                        <button
                          onClick={() => removeDraftChange(change.id)}
                          className="p-1 text-neutral-400 hover:text-red-500"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Create Proposal Form */}
                  <div className="space-y-3 p-4 bg-indigo-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Proposal title"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                      className="input"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={proposalDescription}
                      onChange={(e) => setProposalDescription(e.target.value)}
                      rows={2}
                      className="input resize-none"
                    />
                    <button
                      onClick={handleCreateProposal}
                      disabled={!proposalTitle.trim()}
                      className="btn-primary w-full"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Create Proposal
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Proposals */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                  Recent Proposals
                </h3>

                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">
                      No proposals yet. Make some changes and create your first
                      proposal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-neutral-900">
                            {proposal.title}
                          </h4>
                          <StatusIndicator status={proposal.status} />
                        </div>
                        {proposal.description && (
                          <p className="text-sm text-neutral-600 mb-3">
                            {proposal.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {proposal.changes?.length || 0} changes
                          </span>
                          
                          {/* Action buttons based on status and role */}
                          <div className="flex gap-2">
                            {proposal.status === 'PendingReview' && canApprove && (
                              <button className="btn-sm badge-success">
                                <CheckIcon className="w-3 h-3" />
                                Approve
                              </button>
                            )}
                            {proposal.status === 'Approved' && canExecute && (
                              <button className="btn-primary btn-sm">
                                <PlayIcon className="w-3 h-3" />
                                Execute
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>
                  {canExecute
                    ? 'You have permission to execute proposals'
                    : 'Only admins can execute approved proposals'}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
