"use client";

import { useRef } from 'react';
import { ReactFlow, Controls, MiniMap, Background, useReactFlow } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragOver, nodeTypes, connectToDatabase, fetchColumns }) {
  const reactFlowWrapper = useRef(null);
  const { project } = useReactFlow();

  const handleDrop = async (event) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const dragData = JSON.parse(event.dataTransfer.getData('application/reactflow') || '{}');

    if (!dragData || !dragData.type || !dragData.db || !dragData.table) return;

    const connected = await connectToDatabase(dragData.db);
    if (!connected) return;

    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newId = uuidv4();
    const newNode = {
      id: newId,
      type: dragData.type,
      position,
      data: {
        label: dragData.table,
        db: dragData.db,
        columns: [],
        loading: true,
      },
    };

    onNodesChange([{ type: 'add', item: newNode }]);
    const columns = await fetchColumns(dragData.table);
    onNodesChange([
      {
        id: newId,
        type: 'update',
        item: { ...newNode, data: { ...newNode.data, columns, loading: false } },
      },
    ]);
  };

  return (
    <div className="flex-1 relative h-full">
      <div ref={reactFlowWrapper} className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
        >
          <MiniMap nodeColor="#6366f1" nodeStrokeColor="#ffffff" maskColor="rgba(255,255,255,0.2)" />
          <Controls className="bg-white shadow-sm rounded-md" />
          <Background color="#e5e7eb" gap={16} />
        </ReactFlow>
      </div>
      {nodes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Start Building Your Schema</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select a database from the sidebar to load tables or create a new one.
          </p>
          <div className="flex justify-center space-x-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md flex items-center space-x-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span>Drag & Drop</span>
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-md flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Auto Layout</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;