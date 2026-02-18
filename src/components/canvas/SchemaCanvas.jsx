'use client';

/**
 * SchemaCanvas - Main React Flow canvas for database visualization
 */
import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import TableNode from './TableNode';
import RelationEdge from './RelationEdge';
import { useCanvasStore, useSchemaStore, useUIStore } from '../../store/store';

// Node types registry
const nodeTypes = {
  tableNode: TableNode,
};

// Edge types registry
const edgeTypes = {
  relationEdge: RelationEdge,
};

// Default edge options
const defaultEdgeOptions = {
  type: 'relationEdge',
  animated: false,
};

export default function SchemaCanvas() {
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    setNodes: setStoreNodes, 
    setEdges: setStoreEdges,
    setSelectedNode,
    setSelectedEdge,
    setViewport,
  } = useCanvasStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync with store
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, type: 'relationEdge' }, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (event, edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge]
  );

  // Handle canvas click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  // Handle move end (save viewport)
  const onMoveEnd = useCallback(
    (event, viewport) => {
      setViewport(viewport);
    },
    [setViewport]
  );

  // Node drag end - persist positions
  const onNodeDragStop = useCallback(
    (event, node) => {
      setStoreNodes(nodes);
    },
    [nodes, setStoreNodes]
  );

  // MiniMap node color
  const miniMapNodeColor = useCallback((node) => {
    if (node.data?.proposalType === 'new') return '#22c55e';
    if (node.data?.proposalType === 'modified') return '#f59e0b';
    if (node.data?.proposalType === 'delete') return '#ef4444';
    return '#6366f1';
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        snapToGrid
        snapGrid={[16, 16]}
        className="bg-[var(--canvas-bg)]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#d1d5db"
        />
        <Controls 
          showInteractive={false}
          position="bottom-left"
        />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(99, 102, 241, 0.1)"
          nodeStrokeWidth={3}
          pannable
          zoomable
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
