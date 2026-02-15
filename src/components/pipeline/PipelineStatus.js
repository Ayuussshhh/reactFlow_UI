/**
 * PipelineStatus - Status bar showing pipeline state
 */

'use client';

import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  DocumentTextIcon,
  BeakerIcon,
  PlayIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';

const STAGES = [
  { id: 'mirror', label: 'Mirror', icon: CircleStackIcon, description: 'Schema introspection' },
  { id: 'proposal', label: 'Proposal', icon: DocumentTextIcon, description: 'Draft changes' },
  { id: 'risk', label: 'Risk', icon: BeakerIcon, description: 'Safety analysis' },
  { id: 'execute', label: 'Execute', icon: PlayIcon, description: 'Apply changes' },
];

function StageIndicator({ stage, status, isActive }) {
  const Icon = stage.icon;
  
  const statusColors = {
    pending: 'bg-gray-100 text-gray-400 border-gray-200',
    active: 'bg-indigo-100 text-indigo-600 border-indigo-300',
    complete: 'bg-green-100 text-green-600 border-green-300',
    error: 'bg-red-100 text-red-600 border-red-300',
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={false}
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
        className={cn(
          'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
          statusColors[status] || statusColors.pending
        )}
      >
        {status === 'complete' ? (
          <CheckCircleIcon className="w-5 h-5" />
        ) : (
          <Icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
        )}
      </motion.div>
      <span className={cn(
        'mt-1.5 text-xs font-medium',
        isActive ? 'text-indigo-600' : 'text-gray-500'
      )}>
        {stage.label}
      </span>
    </div>
  );
}

function StageConnector({ complete }) {
  return (
    <div className="flex-1 h-0.5 mx-2 relative">
      <div className="absolute inset-0 bg-gray-200 rounded-full" />
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: complete ? '100%' : 0 }}
        className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

export default function PipelineStatus({ className }) {
  const {
    activeProposal,
    riskAnalysis,
    semanticMap,
    pipelineLoading,
  } = useAppStore();

  // Determine stage statuses
  const getStageStatus = (stageId) => {
    if (pipelineLoading[stageId]) return 'active';
    
    switch (stageId) {
      case 'mirror':
        return semanticMap ? 'complete' : 'pending';
      case 'proposal':
        if (!activeProposal) return 'pending';
        if (activeProposal.status === 'draft') return 'active';
        return 'complete';
      case 'risk':
        if (!activeProposal) return 'pending';
        if (riskAnalysis) return 'complete';
        if (['pending_review', 'approved'].includes(activeProposal.status)) return 'active';
        return 'pending';
      case 'execute':
        if (!activeProposal) return 'pending';
        if (activeProposal.status === 'executed') return 'complete';
        if (activeProposal.status === 'approved') return 'active';
        return 'pending';
      default:
        return 'pending';
    }
  };

  // Find currently active stage
  const activeStage = STAGES.find(s => getStageStatus(s.id) === 'active')?.id || 'mirror';

  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Governance Pipeline</h3>
        {activeProposal && (
          <span className="text-xs text-gray-500">
            {activeProposal.title}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        {STAGES.map((stage, idx) => (
          <div key={stage.id} className="flex items-center flex-1">
            <StageIndicator
              stage={stage}
              status={getStageStatus(stage.id)}
              isActive={activeStage === stage.id}
            />
            {idx < STAGES.length - 1 && (
              <StageConnector
                complete={['complete'].includes(getStageStatus(stage.id))}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for toolbar
export function PipelineStatusCompact({ onClick, className }) {
  const { activeProposal, pipelineLoading } = useAppStore();
  
  const isLoading = Object.values(pipelineLoading).some(Boolean);
  const hasProposal = !!activeProposal;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
        hasProposal
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
        className
      )}
    >
      <CircleStackIcon className={cn('w-4 h-4', isLoading && 'animate-spin')} />
      <span className="text-xs font-medium">
        {hasProposal ? activeProposal.title : 'Pipeline'}
      </span>
      {activeProposal && (
        <span className={cn(
          'px-1.5 py-0.5 text-[10px] rounded-full',
          activeProposal.status === 'draft' ? 'bg-gray-200 text-gray-600' :
          activeProposal.status === 'approved' ? 'bg-green-200 text-green-700' :
          'bg-yellow-200 text-yellow-700'
        )}>
          {activeProposal.changes?.length || 0}
        </span>
      )}
    </button>
  );
}
