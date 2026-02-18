'use client';

/**
 * RelationEdge - Professional foreign key relationship visualization
 * Features smooth bezier curves with cardinality markers
 */
import { memo, useMemo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

const RelationEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
  markerEnd,
}) => {
  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  // Dynamic styling based on state
  const edgeStyle = useMemo(() => ({
    ...style,
    stroke: selected ? '#6366f1' : '#94a3b8',
    strokeWidth: selected ? 2.5 : 1.5,
    strokeDasharray: data?.isPending ? '5,5' : 'none',
    transition: 'stroke 0.2s, stroke-width 0.2s',
  }), [selected, data?.isPending, style]);

  return (
    <>
      {/* Shadow/glow effect for selected edges */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          strokeWidth={8}
          stroke="rgba(99, 102, 241, 0.15)"
          strokeLinecap="round"
        />
      )}

      {/* Main edge path */}
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />

      {/* Source marker (many side - crow's foot) */}
      <foreignObject
        x={sourceX - 8}
        y={sourceY - 8}
        width={16}
        height={16}
        className="overflow-visible pointer-events-none"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-3 h-3">
            <circle 
              cx="8" 
              cy="8" 
              r="4" 
              fill={selected ? '#6366f1' : '#94a3b8'}
              className="transition-colors"
            />
          </svg>
        </div>
      </foreignObject>

      {/* Target marker (one side - single line) */}
      <foreignObject
        x={targetX - 8}
        y={targetY - 8}
        width={16}
        height={16}
        className="overflow-visible pointer-events-none"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-4 h-4">
            <polygon 
              points="8,2 14,8 8,14" 
              fill={selected ? '#6366f1' : '#94a3b8'}
              className="transition-colors"
            />
          </svg>
        </div>
      </foreignObject>

      {/* Constraint name label (shown on hover/select) */}
      {data?.constraintName && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className={`
              px-2 py-1 text-[10px] font-medium rounded-md
              transition-all duration-200
              ${selected 
                ? 'opacity-100 bg-indigo-500 text-white shadow-lg' 
                : 'opacity-0 bg-slate-100 text-slate-600'
              }
            `}
          >
            {data.constraintName}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

RelationEdge.displayName = 'RelationEdge';

export default RelationEdge;
