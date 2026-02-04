"use client";

import { EdgeLabelRenderer, BaseEdge, getBezierPath } from 'reactflow';
import { TrashIcon } from '@heroicons/react/24/outline';

function ForeignKeyEdgeLabel({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  onDelete,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const relationshipType = data?.relationshipType || '1:N';
  const cascadeInfo = `${data?.onDelete || 'RESTRICT'} / ${data?.onUpdate || 'RESTRICT'}`;

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: '#3b82f6', strokeWidth: 2.5 }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="group"
        >
          {/* Label Badge */}
          <div className="flex flex-col items-center gap-1">
            {/* Main Label */}
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap flex items-center gap-2">
              <span>{relationshipType}</span>
              {/* Delete Button on Hover */}
              <button
                onClick={() => onDelete && onDelete(id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-500 rounded ml-1"
                title="Delete relationship"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </div>

            {/* Cascade Info Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {cascadeInfo}
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default ForeignKeyEdgeLabel;
