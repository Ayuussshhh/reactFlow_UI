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
    stroke: selected ? '#6366f1' : '#a78bfa',
    strokeWidth: selected ? 2.5 : 2,
    strokeDasharray: data?.isPending ? '5,5' : 'none',
    transition: 'stroke 0.2s, stroke-width 0.2s',
    opacity: 0.8,
  }), [selected, data?.isPending, style]);

  return (
    <>
      {/* Shadow/glow effect for selected edges */}
      {selected && (
        <>
          <path
            d={edgePath}
            fill="none"
            strokeWidth={10}
            stroke="rgba(99, 102, 241, 0.25)"
            strokeLinecap="round"
          />
          <path
            d={edgePath}
            fill="none"
            strokeWidth={12}
            stroke="rgba(99, 102, 241, 0.1)"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Main edge path */}
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />

      {/* Source marker (many side - crow's foot) */}
      <foreignObject
        x={sourceX - 10}
        y={sourceY - 10}
        width={20}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-4 h-4" title="Foreign Key (Source)">
            <circle 
              cx="8" 
              cy="8" 
              r="5" 
              fill={selected ? '#6366f1' : '#a78bfa'}
              className="transition-colors"
            />
            <circle cx="8" cy="8" r="2" fill="white" />
          </svg>
        </div>
      </foreignObject>

      {/* Target marker (one side - arrow) */}
      <foreignObject
        x={targetX - 10}
        y={targetY - 10}
        width={20}
        height={20}
        className="overflow-visible pointer-events-none"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-4 h-4" title="Foreign Key (Target)">
            <polygon 
              points="8,2 14,8 8,14 10,8" 
              fill={selected ? '#6366f1' : '#a78bfa'}
              className="transition-colors"
            />
          </svg>
        </div>
      </foreignObject>

      {/* Constraint name label (always visible on hover/select) */}
      {data?.constraintName && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
            }}
            className={`
              px-2.5 py-1.5 text-[11px] font-semibold rounded-md
              transition-all duration-200
              whitespace-nowrap
              ${selected 
                ? 'opacity-100 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/40' 
                : 'opacity-0 group-hover:opacity-100 bg-white text-indigo-700 border border-indigo-200 shadow-md'
              }
            `}
            title={`Foreign Key: ${data.constraintName}`}
          >
            🔗 {data.constraintName}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

RelationEdge.displayName = 'RelationEdge';

export default RelationEdge;
