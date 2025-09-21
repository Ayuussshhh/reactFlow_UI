"use client";

import { useRef, useCallback } from 'react';
import { ReactFlow, Controls, MiniMap, Background, useReactFlow } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import { useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { Menu, Item } from 'react-contexify';

const MENU_ID = 'canvas-context-menu';

function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDragOver, nodeTypes, connectToDatabase, fetchColumns }) {
  const reactFlowWrapper = useRef(null);
  const { project, fitView, zoomIn, zoomOut } = useReactFlow();
  const { show } = useContextMenu({ id: MENU_ID });

  // Auto-layout function using Dagre
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 120 });

    nodes.forEach((node) => {
      const width = 300; // Wider nodes for column display
      const height = 100 + 40 * (node.data.columns?.length || 0); // Dynamic height for columns
      dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: direction === 'TB' ? 'top' : 'left',
        sourcePosition: direction === 'TB' ? 'bottom' : 'right',
        position: {
          x: nodeWithPosition.x - 300 / 2 + Math.random() / 1000,
          y: nodeWithPosition.y - (100 + 40 * (node.data.columns?.length || 0)) / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  const handleLayout = useCallback((direction) => {
    const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, direction);
    const changes = layoutedNodes.map((node) => ({
      id: node.id,
      type: 'position',
      position: node.position,
      dragging: false,
    }));
    onNodesChange(changes);
    setTimeout(() => fitView({ duration: 500 }), 100);
  }, [nodes, edges, onNodesChange, fitView]);

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
    handleLayout('TB');
  };

  const handlePaneDoubleClick = useCallback(
    (event) => {
      const position = project({ x: event.clientX, y: event.clientY });
      const newId = uuidv4();
      const newNode = {
        id: newId,
        type: 'tableNode',
        position,
        data: {
          label: 'New Table',
          db: null,
          columns: [{ name: 'id', type: 'INT', constraints: 'PRIMARY KEY' }],
          loading: false,
        },
      };
      onNodesChange([{ type: 'add', item: newNode }]);
      handleLayout('TB');
    },
    [project, onNodesChange]
  );

  const handleContextMenu = (event) => {
    event.preventDefault();
    show({ event });
  };

  const handleZoomIn = () => zoomIn({ duration: 300 });
  const handleZoomOut = () => zoomOut({ duration: 300 });
  const handleFitView = () => fitView({ duration: 500 });

  return (
    <div className="flex-1 relative h-full bg-gray-100 transition-colors duration-300">
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLayout('TB')}
            className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Vertical Layout</span>
          </button>
          <button
            onClick={() => handleLayout('LR')}
            className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-8-8v16" />
            </svg>
            <span>Horizontal Layout</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleZoomIn}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
            </svg>
          </button>
          <button
            onClick={handleFitView}
            className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div ref={reactFlowWrapper} className="h-full pt-14">
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
          snapGrid={[20, 20]}
          onPaneDoubleClick={handlePaneDoubleClick}
          onPaneContextMenu={handleContextMenu}
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          attributionPosition="bottom-left"
        >
          <MiniMap
            nodeColor="#4f46e5"
            nodeStrokeColor="#ffffff"
            maskColor="rgba(255,255,255,0.1)"
            className="bg-white/90 rounded-lg shadow-md border border-gray-200"
            zoomable
            pannable
          />
          <Controls
            className="bg-white/90 shadow-md rounded-lg border border-gray-200 p-2"
            showInteractive={true}
          />
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#d1d5db"
            className="bg-gray-100"
          />
        </ReactFlow>
      </div>

      {/* Context Menu */}
      <Menu id={MENU_ID} animation="fade" theme="light">
        <Item onClick={() => handlePaneDoubleClick({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 })}>
          Add New Table
        </Item>
        <Item onClick={() => handleLayout('TB')}>Auto Layout (Vertical)</Item>
        <Item onClick={() => handleLayout('LR')}>Auto Layout (Horizontal)</Item>
        <Item onClick={handleFitView}>Fit View</Item>
      </Menu>

      {/* Empty State Prompt */}
      {nodes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-lg p-8 bg-white rounded-xl shadow-xl z-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Craft Your Database Schema</h2>
          <p className="text-base text-gray-600 mb-6">
            Drag tables from the sidebar, double-click to create a new table, or right-click for more options. Connect tables to define relationships.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full flex items-center space-x-2">
              <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
              <span>Drag & Drop</span>
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-full flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-600 rounded-full"></span>
              <span>Auto Layout</span>
            </span>
            <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              <span>Edit Columns</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;