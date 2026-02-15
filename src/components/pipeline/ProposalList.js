/**
 * ProposalList - List of schema change proposals
 */

'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';

const STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-600', icon: DocumentPlusIcon },
  pending_review: { color: 'bg-yellow-100 text-yellow-600', icon: ClockIcon },
  approved: { color: 'bg-green-100 text-green-600', icon: CheckCircleIcon },
  rejected: { color: 'bg-red-100 text-red-600', icon: ExclamationTriangleIcon },
  executed: { color: 'bg-blue-100 text-blue-600', icon: PlayIcon },
  rolled_back: { color: 'bg-orange-100 text-orange-600', icon: ArrowPathIcon },
};

function ProposalCard({ proposal, isActive, onClick }) {
  const status = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const changes = proposal.changes || [];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border cursor-pointer transition-all',
        isActive
          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', status.color)}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{proposal.title}</h4>
            <p className="text-xs text-gray-500">
              {changes.length} change{changes.length !== 1 ? 's' : ''} • {formatDate(proposal.createdAt || proposal.created_at)}
            </p>
          </div>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ProposalList({ onSelect }) {
  const {
    proposals,
    activeProposal,
    pipelineLoading,
    fetchProposals,
    createProposal,
    setActiveProposal,
  } = useAppStore();

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleCreateNew = async () => {
    const title = window.prompt('Enter proposal title:', 'New Schema Change');
    if (title) {
      const description = window.prompt('Enter description (optional):', '');
      await createProposal(title, description || '');
    }
  };

  const handleSelect = (proposal) => {
    setActiveProposal(proposal);
    onSelect?.(proposal);
  };

  // Group proposals by status
  const grouped = {
    active: proposals.filter(p => ['draft', 'pending_review', 'approved'].includes(p.status)),
    completed: proposals.filter(p => ['executed', 'rolled_back', 'rejected'].includes(p.status)),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Proposals</h3>
        <button
          onClick={handleCreateNew}
          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Create new proposal"
        >
          <DocumentPlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {pipelineLoading.proposals ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8">
            <DocumentPlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No proposals yet</p>
            <button
              onClick={handleCreateNew}
              className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create First Proposal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Proposals */}
            {grouped.active.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                  Active ({grouped.active.length})
                </h4>
                <div className="space-y-2">
                  {grouped.active.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      isActive={activeProposal?.id === proposal.id}
                      onClick={() => handleSelect(proposal)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Proposals */}
            {grouped.completed.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                  Completed ({grouped.completed.length})
                </h4>
                <div className="space-y-2">
                  {grouped.completed.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      isActive={activeProposal?.id === proposal.id}
                      onClick={() => handleSelect(proposal)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
