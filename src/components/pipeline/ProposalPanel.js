/**
 * ProposalPanel - Main panel for viewing and editing schema change proposals
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentPlusIcon,
  PlayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import RiskAnalysisCard from './RiskAnalysisCard';
import ChangeItem from './ChangeItem';

const STATUS_CONFIG = {
  draft: { color: 'bg-gray-100 text-gray-700', icon: DocumentPlusIcon, label: 'Draft' },
  pending_review: { color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon, label: 'Pending Review' },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircleIcon, label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon, label: 'Rejected' },
  executed: { color: 'bg-blue-100 text-blue-700', icon: PlayIcon, label: 'Executed' },
  rolled_back: { color: 'bg-orange-100 text-orange-700', icon: ArrowPathIcon, label: 'Rolled Back' },
};

export default function ProposalPanel({ onClose }) {
  const {
    activeProposal,
    riskAnalysis,
    pipelineLoading,
    analyzeRisk,
    generateMigration,
    submitProposalForReview,
    executeProposal,
    rollbackProposal,
    addNotification,
  } = useAppStore();

  const [showMigrationSQL, setShowMigrationSQL] = useState(false);

  if (!activeProposal) {
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed right-0 top-12 bottom-6 w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col items-center justify-center p-8"
      >
        <DocumentPlusIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600">No Proposal Selected</h3>
        <p className="text-sm text-gray-400 text-center mt-2">
          Create a new proposal or select an existing one from the list
        </p>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    );
  }

  const status = STATUS_CONFIG[activeProposal.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const changes = activeProposal.changes || [];
  const migration = activeProposal.migrationArtifacts || activeProposal.migration_artifacts;

  const handleAnalyzeRisk = async () => {
    await analyzeRisk();
  };

  const handleGenerateMigration = async () => {
    await generateMigration();
    setShowMigrationSQL(true);
  };

  const handleSubmitForReview = async () => {
    await submitProposalForReview();
  };

  const handleExecute = async (dryRun = false) => {
    await executeProposal(activeProposal.id, dryRun);
  };

  const handleRollback = async () => {
    if (window.confirm('Are you sure you want to rollback this proposal?')) {
      await rollbackProposal();
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-12 bottom-6 w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <DocumentPlusIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{activeProposal.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('px-2 py-0.5 text-xs rounded-full flex items-center gap-1', status.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span className="text-xs text-gray-400">
                  {changes.length} change{changes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {activeProposal.description && (
          <p className="mt-2 text-sm text-gray-600">{activeProposal.description}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Changes Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Schema Changes</h3>
          {changes.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No changes added yet</p>
              <p className="text-xs text-gray-400 mt-1">Add changes from the canvas or table panel</p>
            </div>
          ) : (
            <div className="space-y-2">
              {changes.map((change, idx) => (
                <ChangeItem key={idx} change={change} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Risk Analysis Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Risk Analysis</h3>
            <button
              onClick={handleAnalyzeRisk}
              disabled={pipelineLoading.risk || changes.length === 0}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-colors',
                pipelineLoading.risk
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              )}
            >
              <BeakerIcon className={cn('w-3.5 h-3.5', pipelineLoading.risk && 'animate-spin')} />
              {pipelineLoading.risk ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
          {riskAnalysis ? (
            <RiskAnalysisCard analysis={riskAnalysis} />
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">No risk analysis yet</p>
              <p className="text-xs text-gray-400 mt-1">Run analysis to see safety score</p>
            </div>
          )}
        </div>

        {/* Migration SQL Section */}
        {migration && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Migration SQL</h3>
              <button
                onClick={() => setShowMigrationSQL(!showMigrationSQL)}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                {showMigrationSQL ? 'Hide' : 'Show'}
              </button>
            </div>
            <AnimatePresence>
              {showMigrationSQL && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                      {migration.upSQL || migration.up_sql || migration.sql || 'No SQL generated'}
                    </pre>
                  </div>
                  {(migration.downSQL || migration.down_sql) && (
                    <div className="mt-2 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                      <p className="text-xs text-gray-500 mb-1">Rollback SQL:</p>
                      <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                        {migration.downSQL || migration.down_sql}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {/* Draft actions */}
          {activeProposal.status === 'draft' && (
            <>
              <button
                onClick={handleGenerateMigration}
                disabled={changes.length === 0}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                Generate SQL
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={!migration}
                className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Submit for Review
              </button>
            </>
          )}

          {/* Approved actions */}
          {activeProposal.status === 'approved' && (
            <>
              <button
                onClick={() => handleExecute(true)}
                disabled={pipelineLoading.execution}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <BeakerIcon className="w-4 h-4" />
                Dry Run
              </button>
              <button
                onClick={() => handleExecute(false)}
                disabled={pipelineLoading.execution}
                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <PlayIcon className="w-4 h-4" />
                Execute
              </button>
            </>
          )}

          {/* Executed actions */}
          {activeProposal.status === 'executed' && (
            <button
              onClick={handleRollback}
              disabled={pipelineLoading.execution}
              className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Rollback
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
