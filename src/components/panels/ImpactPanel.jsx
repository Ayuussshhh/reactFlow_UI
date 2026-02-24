'use client';

/**
 * Impact Analysis Panel
 * Shows blast radius, schema diff, and rule violations
 * The core "What breaks if I change this?" feature
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldExclamationIcon,
  TableCellsIcon,
  ArrowPathIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { useUIStore, useImpactStore, useConnectionStore } from '../../store/store';
import { snapshotAPI } from '../../lib';
import toast from 'react-hot-toast';

// Risk level colors and icons
const RISK_COLORS = {
  none: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  safe: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  contained: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  spreading: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  pandemic: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const SEVERITY_CONFIG = {
  info: { icon: CheckCircleIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
  warning: { icon: ExclamationTriangleIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
  error: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-50' },
  block: { icon: ShieldExclamationIcon, color: 'text-red-600', bg: 'bg-red-100' },
};

export default function ImpactPanel() {
  const { impactPanelOpen, setImpactPanelOpen } = useUIStore();
  const { activeConnection } = useConnectionStore();
  const {
    selectedObject,
    blastRadius,
    setBlastRadius,
    clearBlastRadius,
    currentDiff,
    rulesResult,
    setDiff,
    clearDiff,
    snapshots,
    setSnapshots,
    setLoadingSnapshots,
    latestSnapshot,
    setLatestSnapshot,
  } = useImpactStore();

  const [activeTab, setActiveTab] = useState('blast-radius');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    impacted: true,
    violations: true,
    changes: true,
  });

  // Load snapshots when panel opens
  useEffect(() => {
    if (impactPanelOpen && activeConnection?.id) {
      loadSnapshots();
    }
  }, [impactPanelOpen, activeConnection?.id]);

  const loadSnapshots = async () => {
    if (!activeConnection?.id) return;
    
    setLoadingSnapshots(true);
    try {
      const [snapshotsList, latest] = await Promise.all([
        snapshotAPI.list(activeConnection.id),
        snapshotAPI.getLatest(activeConnection.id).catch(() => null),
      ]);
      setSnapshots(snapshotsList);
      setLatestSnapshot(latest);
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  // Analyze blast radius when object is selected
  const analyzeBlastRadius = useCallback(async () => {
    if (!selectedObject || !activeConnection?.id) return;

    setIsAnalyzing(true);
    try {
      const result = await snapshotAPI.analyzeBlastRadius(
        activeConnection.id,
        selectedObject.schema || 'public',
        selectedObject.table,
        selectedObject.column
      );
      setBlastRadius(result);
      toast.success(`Found ${result.impacted?.length || 0} impacted objects`);
    } catch (error) {
      toast.error(error.message || 'Failed to analyze impact');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedObject, activeConnection?.id, setBlastRadius]);

  // Create a new snapshot
  const createSnapshot = async () => {
    if (!activeConnection?.id) return;

    try {
      const snapshot = await snapshotAPI.create(activeConnection.id);
      toast.success(`Snapshot v${snapshot.version} created`);
      loadSnapshots();
    } catch (error) {
      toast.error(error.message || 'Failed to create snapshot');
    }
  };

  // Compare snapshots
  const compareSnapshots = async (fromVersion, toVersion) => {
    if (!activeConnection?.id) return;

    try {
      const { diff, rulesResult } = await snapshotAPI.diff(
        activeConnection.id,
        fromVersion,
        toVersion
      );
      setDiff(diff, rulesResult);
      toast.success(`Found ${diff.changes?.length || 0} changes`);
    } catch (error) {
      toast.error(error.message || 'Failed to compare snapshots');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!impactPanelOpen) return null;

  const riskColors = RISK_COLORS[blastRadius?.riskLevel?.toLowerCase()] || RISK_COLORS.safe;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl border-l border-neutral-200 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Impact Analysis</h2>
              <p className="text-xs text-neutral-500">What breaks if I change this?</p>
            </div>
          </div>
          <button
            onClick={() => setImpactPanelOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 border-b border-neutral-100 flex gap-1">
          <TabButton
            active={activeTab === 'blast-radius'}
            onClick={() => setActiveTab('blast-radius')}
            icon={ArrowsPointingOutIcon}
            label="Blast Radius"
          />
          <TabButton
            active={activeTab === 'diff'}
            onClick={() => setActiveTab('diff')}
            icon={ArrowPathIcon}
            label="Schema Diff"
          />
          <TabButton
            active={activeTab === 'snapshots'}
            onClick={() => setActiveTab('snapshots')}
            icon={BeakerIcon}
            label="Snapshots"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'blast-radius' && (
            <BlastRadiusTab
              selectedObject={selectedObject}
              blastRadius={blastRadius}
              isAnalyzing={isAnalyzing}
              analyzeBlastRadius={analyzeBlastRadius}
              clearBlastRadius={clearBlastRadius}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              riskColors={riskColors}
            />
          )}

          {activeTab === 'diff' && (
            <DiffTab
              currentDiff={currentDiff}
              rulesResult={rulesResult}
              snapshots={snapshots}
              compareSnapshots={compareSnapshots}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
          )}

          {activeTab === 'snapshots' && (
            <SnapshotsTab
              snapshots={snapshots}
              latestSnapshot={latestSnapshot}
              createSnapshot={createSnapshot}
              compareSnapshots={compareSnapshots}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Blast Radius Tab
function BlastRadiusTab({
  selectedObject,
  blastRadius,
  isAnalyzing,
  analyzeBlastRadius,
  clearBlastRadius,
  expandedSections,
  toggleSection,
  riskColors,
}) {
  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ArrowsPointingOutIcon className="w-12 h-12 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-700 mb-2">
          Select an Object
        </h3>
        <p className="text-sm text-neutral-500 max-w-xs">
          Click on a table or column in the canvas to analyze its blast radius
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Object Card */}
      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <TableCellsIcon className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-sm text-indigo-600 font-medium">Analyzing Impact For</p>
            <p className="text-lg font-mono font-semibold text-indigo-900">
              {selectedObject.schema || 'public'}.{selectedObject.table}
              {selectedObject.column && `.${selectedObject.column}`}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={analyzeBlastRadius}
            disabled={isAnalyzing}
            className="btn-primary text-sm py-1.5"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Impact'}
          </button>
          <button
            onClick={clearBlastRadius}
            className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-white rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Blast Radius Results */}
      {blastRadius && (
        <>
          {/* Risk Summary */}
          <div className={`p-4 rounded-xl border ${riskColors.bg} ${riskColors.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${riskColors.text}`}>Risk Level</p>
                <p className={`text-2xl font-bold ${riskColors.text} capitalize`}>
                  {blastRadius.riskLevel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Total Impact</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {blastRadius.summary?.totalTables || 0} tables
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-neutral-600">{blastRadius.explanation}</p>
          </div>

          {/* Impacted Objects */}
          {blastRadius.impacted?.length > 0 && (
            <CollapsibleSection
              title={`Impacted Objects (${blastRadius.impacted.length})`}
              expanded={expandedSections.impacted}
              onToggle={() => toggleSection('impacted')}
            >
              <div className="space-y-2">
                {blastRadius.impacted.map((item, idx) => (
                  <ImpactedObjectItem key={idx} item={item} />
                ))}
              </div>
            </CollapsibleSection>
          )}
        </>
      )}
    </div>
  );
}

// Diff Tab
function DiffTab({
  currentDiff,
  rulesResult,
  snapshots,
  compareSnapshots,
  expandedSections,
  toggleSection,
}) {
  const [fromVersion, setFromVersion] = useState('');
  const [toVersion, setToVersion] = useState('');

  const handleCompare = () => {
    if (fromVersion && toVersion) {
      compareSnapshots(parseInt(fromVersion), parseInt(toVersion));
    }
  };

  return (
    <div className="space-y-4">
      {/* Version Selector */}
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm font-medium text-neutral-700 mb-3">Compare Versions</p>
        <div className="flex gap-2 items-center">
          <select
            value={fromVersion}
            onChange={(e) => setFromVersion(e.target.value)}
            className="input text-sm py-1.5"
          >
            <option value="">From version...</option>
            {snapshots.map((s) => (
              <option key={s.id} value={s.version}>
                v{s.version}
              </option>
            ))}
          </select>
          <span className="text-neutral-400">→</span>
          <select
            value={toVersion}
            onChange={(e) => setToVersion(e.target.value)}
            className="input text-sm py-1.5"
          >
            <option value="">To version...</option>
            {snapshots.map((s) => (
              <option key={s.id} value={s.version}>
                v{s.version}
              </option>
            ))}
          </select>
          <button
            onClick={handleCompare}
            disabled={!fromVersion || !toVersion}
            className="btn-primary text-sm py-1.5 whitespace-nowrap"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Diff Results */}
      {currentDiff && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Added"
              value={currentDiff.summary?.columnsAdded || 0}
              color="green"
            />
            <StatCard
              label="Removed"
              value={currentDiff.summary?.columnsRemoved || 0}
              color="red"
            />
            <StatCard
              label="Modified"
              value={currentDiff.summary?.columnsModified || 0}
              color="amber"
            />
          </div>

          {/* Rule Violations */}
          {rulesResult?.violations?.length > 0 && (
            <CollapsibleSection
              title={`Rule Violations (${rulesResult.violations.length})`}
              expanded={expandedSections.violations}
              onToggle={() => toggleSection('violations')}
            >
              <div className="space-y-2">
                {rulesResult.violations.map((v, idx) => (
                  <ViolationItem key={idx} violation={v} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Changes List */}
          {currentDiff.changes?.length > 0 && (
            <CollapsibleSection
              title={`All Changes (${currentDiff.changes.length})`}
              expanded={expandedSections.changes}
              onToggle={() => toggleSection('changes')}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentDiff.changes.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </div>
            </CollapsibleSection>
          )}
        </>
      )}
    </div>
  );
}

// Snapshots Tab
function SnapshotsTab({ snapshots, latestSnapshot, createSnapshot, compareSnapshots }) {
  return (
    <div className="space-y-4">
      {/* Create Snapshot Button */}
      <button
        onClick={createSnapshot}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
      >
        <BeakerIcon className="w-5 h-5" />
        Create New Snapshot
      </button>

      {/* Latest Snapshot */}
      {latestSnapshot && (
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-sm text-indigo-600 font-medium">Latest Snapshot</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-indigo-900">v{latestSnapshot.version}</p>
            <p className="text-sm text-indigo-600">
              {new Date(latestSnapshot.capturedAt).toLocaleString()}
            </p>
          </div>
          <div className="mt-2 flex gap-4 text-sm text-indigo-700">
            <span>{latestSnapshot.tables?.length || 0} tables</span>
            <span>{latestSnapshot.foreignKeys?.length || 0} FKs</span>
          </div>
        </div>
      )}

      {/* Snapshot List */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-700">All Snapshots</p>
        {snapshots.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">
            No snapshots yet. Create one to start tracking.
          </p>
        ) : (
          snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="p-3 bg-white rounded-lg border border-neutral-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-neutral-900">
                  v{snapshot.version}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(snapshot.capturedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {snapshot.tableCount} tables • {snapshot.fkCount} FKs
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper Components
function CollapsibleSection({ title, expanded, onToggle, children }) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <span className="font-medium text-neutral-700">{title}</span>
        {expanded ? (
          <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
        )}
      </button>
      {expanded && <div className="p-4 border-t border-neutral-200">{children}</div>}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className={`p-3 rounded-lg border text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}

function ImpactedObjectItem({ item }) {
  const isTable = item.objectType === 'table';

  return (
    <div className="p-3 bg-white rounded-lg border border-neutral-200 hover:border-indigo-300 transition-colors">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
          item.isDirect ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {item.isDirect ? 'Direct' : `Hop ${item.distance}`}
        </span>
        <span className="font-mono text-sm font-medium text-neutral-800">
          {item.path.split('.').pop()}
        </span>
      </div>
      <p className="text-xs text-neutral-500 mt-1">{item.impact}</p>
    </div>
  );
}

function ViolationItem({ violation }) {
  const config = SEVERITY_CONFIG[violation.severity] || SEVERITY_CONFIG.warning;
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg ${config.bg}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div>
          <p className="text-sm font-medium text-neutral-800">{violation.ruleName}</p>
          <p className="text-xs text-neutral-600 mt-0.5">{violation.message}</p>
          {violation.suggestion && (
            <p className="text-xs text-indigo-600 mt-1">💡 {violation.suggestion}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChangeItem({ change }) {
  const typeColors = {
    added: 'bg-green-100 text-green-700',
    removed: 'bg-red-100 text-red-700',
    modified: 'bg-amber-100 text-amber-700',
    renamed: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="p-2 bg-white rounded-lg border border-neutral-200">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
          typeColors[change.changeType] || 'bg-neutral-100 text-neutral-600'
        }`}>
          {change.changeType}
        </span>
        <span className="font-mono text-xs text-neutral-600">{change.objectPath}</span>
      </div>
      <p className="text-xs text-neutral-500 mt-1 truncate">{change.description}</p>
    </div>
  );
}
