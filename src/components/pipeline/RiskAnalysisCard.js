/**
 * RiskAnalysisCard - Display risk analysis results
 */

'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

function getScoreLevel(score) {
  if (score >= 80) return { level: 'safe', color: 'text-green-600', bg: 'bg-green-100', label: 'Safe' };
  if (score >= 50) return { level: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Moderate Risk' };
  return { level: 'high', color: 'text-red-600', bg: 'bg-red-100', label: 'High Risk' };
}

function ScoreRing({ score }) {
  const { color, bg, label } = getScoreLevel(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
        />
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold', color)}>{score}</span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
}

function RiskItem({ risk, index }) {
  const severityConfig = {
    low: { icon: InformationCircleIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    medium: { icon: ExclamationTriangleIcon, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    high: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-50' },
  };

  const severity = risk.severity || 'medium';
  const config = severityConfig[severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn('flex items-start gap-2 p-2 rounded-lg', config.bg)}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">{risk.message || risk.description}</p>
        {risk.mitigation && (
          <p className="text-xs text-gray-500 mt-0.5">💡 {risk.mitigation}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function RiskAnalysisCard({ analysis }) {
  if (!analysis) return null;

  const score = analysis.safetyScore || analysis.safety_score || 0;
  const { level, label, bg } = getScoreLevel(score);
  const risks = analysis.risks || analysis.warnings || [];
  const impacts = analysis.impacts || [];

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Score Header */}
      <div className={cn('p-4 flex items-center gap-4', bg)}>
        <ScoreRing score={score} />
        <div>
          <div className="flex items-center gap-2">
            {level === 'safe' && <ShieldCheckIcon className="w-5 h-5 text-green-600" />}
            {level === 'moderate' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />}
            {level === 'high' && <XCircleIcon className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-semibold text-gray-900">{label}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {risks.length === 0
              ? 'No issues detected. Safe to proceed.'
              : `${risks.length} issue${risks.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Details */}
      {(risks.length > 0 || impacts.length > 0) && (
        <div className="p-4 space-y-3">
          {risks.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Risks & Warnings
              </h4>
              <div className="space-y-2">
                {risks.map((risk, idx) => (
                  <RiskItem key={idx} risk={risk} index={idx} />
                ))}
              </div>
            </div>
          )}

          {impacts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Impact Analysis
              </h4>
              <div className="space-y-1">
                {impacts.map((impact, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {impact.description || impact}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-indigo-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
