"use client";

import { useRef, useCallback, useState } from 'react';
import { ReactFlow, Controls, MiniMap, Background } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import { useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { Menu, Item } from 'react-contexify';
import Toolbar from './Toolbar';
import ForeignKeyDialog from './ForeignKeyDialog';
import ForeignKeyEdgeLabel from './ForeignKeyEdgeLabel';
import axios from 'axios';

const MENU_ID = 'canvas-context-menu';

function Canvas({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onDragOver, 
  nodeTypes, 
  connectToDatabase, 
  fetchColumns,
  showSnackbar 
}) {
  const reactFlowWrapper = useRef(null);
  const reactFlowInstanceRef = useRef(null);
  const { show } = useContextMenu({ id: MENU_ID });
  
  // Foreign key dialog state
  const [fkDialogOpen, setFkDialogOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [allTables, setAllTables] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);

  // Store reactFlow instance on initialization
  const handleInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  // Safe accessors for reactFlow methods
  const project = useCallback((coords) => {
    return reactFlowInstanceRef.current?.project(coords) || coords;
  }, []);

  const fitView = useCallback((opts) => {
    return reactFlowInstanceRef.current?.fitView(opts);
  }, []);

  const zoomIn = useCallback((opts) => {
    return reactFlowInstanceRef.current?.zoomIn(opts);
  }, []);

  const zoomOut = useCallback((opts) => {
    return reactFlowInstanceRef.current?.zoomOut(opts);
  }, []);

  // Get all table names from nodes
  const getTableNames = useCallback(() => {
    return nodes.map((node) => node.data.label).filter(Boolean);
  }, [nodes]);

  // Validate column connection for foreign key
  const validateColumnConnection = useCallback(
    (sourceHandle, targetHandle) => {
      try {
        const sourceNodeId = sourceHandle.nodeId || sourceHandle.split('-')[0];
        const targetNodeId = targetHandle.nodeId || targetHandle.split('-')[0];

        const sourceNode = nodes.find((n) => n.id === sourceNodeId);
        const targetNode = nodes.find((n) => n.id === targetNodeId);

        if (!sourceNode || !targetNode) return false;
        if (sourceNode.id === targetNode.id) return false; // Same table

        return true;
      } catch (err) {
        console.error('Error validating connection:', err);
        return false;
      }
    },
    [nodes]
  );

  // Enhanced onConnect to handle foreign keys
  const handleConnect = useCallback(
    (connection) => {
      // Check if this is a column-level connection (contains 'col-')
      if (
        connection.sourceHandle?.includes('col-') &&
        connection.targetHandle?.includes('col-')
      ) {
        // Extract column indices
        const sourceColIdx = connection.sourceHandle.split('-')[1];
        const targetColIdx = connection.targetHandle.split('-')[1];

        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return;

        const sourceTableName = sourceNode.data.label;
        const targetTableName = targetNode.data.label;
        const sourceColumnName = sourceNode.data.columns[sourceColIdx]?.name;
        const targetColumnName = targetNode.data.columns[targetColIdx]?.name;

        if (!sourceTableName || !targetTableName || !sourceColumnName || !targetColumnName) {
          showSnackbar('Invalid column selection', 'error');
          return;
        }

        // Set pending connection and show dialog
        setPendingConnection({
          source: connection.source,
          target: connection.target,
          sourceTable: sourceTableName,
          sourceColumn: sourceColumnName,
          targetTable: targetTableName,
          targetColumn: targetColumnName,
        });

        setAllTables(getTableNames());
        setAvailableColumns([targetColumnName]); // Pre-fill with the target column
        setFkDialogOpen(true);
      } else {
        // Regular edge connection
        onConnect(connection);
      }
    },
    [nodes, onConnect, showSnackbar, getTableNames]
  );

  // Handle foreign key creation
  const handleForeignKeyCreate = async (config) => {
    if (!pendingConnection) return;

    try {
      const response = await axios.post('/foreignKey/create', {
        sourceTable: pendingConnection.sourceTable,
        sourceColumn: pendingConnection.sourceColumn,
        referencedTable: config.referencedTable,
        referencedColumn: config.referencedColumn,
        onDelete: config.onDelete,
        onUpdate: config.onUpdate,
        constraintName: `fk_${pendingConnection.sourceTable}_${pendingConnection.sourceColumn}`,
      });

      // Add edge to the canvas
      const newEdge = {
        id: `fk-${uuidv4()}`,
        source: pendingConnection.source,
        target: pendingConnection.target,
        sourceHandle: `col-${nodes.find((n) => n.id === pendingConnection.source)?.data.columns.findIndex((c) => c.name === pendingConnection.sourceColumn)}-right`,
        targetHandle: `col-${nodes.find((n) => n.id === pendingConnection.target)?.data.columns.findIndex((c) => c.name === config.referencedColumn)}-left`,
        data: {
          relationshipType: '1:N',
          onDelete: config.onDelete,
          onUpdate: config.onUpdate,
        },
        label: `${config.onDelete} / ${config.onUpdate}`,
        type: 'foreignKey',
      };

      onEdgesChange([{ type: 'add', item: newEdge }]);
      showSnackbar(
        `Foreign key created: ${pendingConnection.sourceTable}.${pendingConnection.sourceColumn} → ${config.referencedTable}.${config.referencedColumn}`,
        'success'
      );
      setFkDialogOpen(false);
      setPendingConnection(null);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Error creating foreign key',
        'error'
      );
    }
  };

  // Handle foreign key deletion
  const handleDeleteForeignKey = async (edgeId) => {
    try {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;

      await axios.post('/foreignKey/delete', {
        tableName: sourceNode.data.label,
        constraintName: `fk_${sourceNode.data.label}_${edge.sourceHandle}`,
      });

      onEdgesChange([{ id: edgeId, type: 'remove' }]);
      showSnackbar('Foreign key deleted successfully', 'success');
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Error deleting foreign key',
        'error'
      );
    }
  };

  // Auto-layout function using Dagre
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 140 });

    nodes.forEach((node) => {
      const width = 400;
      const height = 120 + 48 * (node.data.columns?.length || 0);
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
          x: nodeWithPosition.x - 400 / 2 + Math.random() / 1000,
          y: nodeWithPosition.y - (120 + 48 * (node.data.columns?.length || 0)) / 2,
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
    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!reactFlowBounds) return;

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
        onNodesChange,
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
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newId = uuidv4();
      const newNode = {
        id: newId,
        type: 'tableNode',
        position,
        data: {
          label: 'New Table',
          db: null,
          columns: [{ name: 'id', type: 'SERIAL', nullable: false }],
          primaryKeys: ['id'],
          foreignKeys: {},
          loading: false,
          onNodesChange,
        },
      };
      onNodesChange([{ type: 'add', item: newNode }]);
      handleLayout('TB');
    },
    [project, onNodesChange, handleLayout]
  );

  const handleContextMenu = (event) => {
    event.preventDefault();
    show({ event });
  };

  const handleZoomIn = () => zoomIn({ duration: 300 });
  const handleZoomOut = () => zoomOut({ duration: 300 });
  const handleFitView = () => fitView({ duration: 500 });

  const edgeTypes = {
    foreignKey: ForeignKeyEdgeLabel,
  };

  return (
    <div className="flex-1 relative h-full bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 transition-colors duration-300">
      {/* Premium Toolbar */}
      <Toolbar
        onLayoutVertical={() => handleLayout('TB')}
        onLayoutHorizontal={() => handleLayout('LR')}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
      />

      {/* Foreign Key Dialog */}
      <ForeignKeyDialog
        open={fkDialogOpen}
        onClose={() => {
          setFkDialogOpen(false);
          setPendingConnection(null);
        }}
        onConfirm={handleForeignKeyCreate}
        sourceTable={pendingConnection?.sourceTable}
        sourceColumn={pendingConnection?.sourceColumn}
        availableTables={allTables}
        availableColumns={availableColumns}
        selectedReferencedTable={pendingConnection?.targetTable}
        onTableSelect={(tableName) => {
          // Fetch columns for the selected table
          const selectedNode = nodes.find((n) => n.data.label === tableName);
          if (selectedNode) {
            setAvailableColumns(
              selectedNode.data.columns
                .filter((col) => col.name) // Only valid columns
                .map((col) => col.name)
            );
          }
        }}
      />

      {/* ReactFlow Canvas */}
      <div
        ref={reactFlowWrapper}
        className="h-full pt-16 transition-colors duration-300"
        onDoubleClick={handlePaneDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <ReactFlow
          onInit={handleInit}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          attributionPosition="bottom-left"
        >
          <MiniMap
            nodeColor={(node) => '#0ea5e9'}
            nodeStrokeColor="#ffffff"
            maskColor="rgba(0, 0, 0, 0.05)"
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50"
            zoomable
            pannable
            style={{ borderRadius: '12px' }}
          />
          <Controls
            className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-white/50 p-2"
            showInteractive={true}
          />
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#d1d1d6"
            className="bg-gradient-to-br from-neutral-50 to-neutral-100"
          />
        </ReactFlow>
      </div>

      {/* Premium Context Menu */}
      <Menu id={MENU_ID} animation="fade" theme="light">
        <Item onClick={() => handlePaneDoubleClick({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 })}>
          ➕ Add New Table
        </Item>
        <Item onClick={() => handleLayout('TB')}>↕️ Vertical Layout</Item>
        <Item onClick={() => handleLayout('LR')}>↔️ Horizontal Layout</Item>
        <Item onClick={handleFitView}>🔍 Fit View</Item>
      </Menu>

      {/* Premium Empty State */}
      {nodes.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-lg z-10 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-10 space-y-6">
            {/* Illustration Placeholder */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Design Your Database</h2>
              <p className="text-neutral-600 text-base leading-relaxed">
                Drag tables from the sidebar, double-click to create a table, or right-click for more options
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors duration-200">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                  <path d="M4 5a2 2 0 012-2 1 1 0 000 2H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 000-2h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                </svg>
                <span className="text-xs font-semibold text-primary-700">Drag & Drop</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-success-50 hover:bg-success-100 transition-colors duration-200">
                <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-success-700">Auto Layout</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-warning-50 hover:bg-warning-100 transition-colors duration-200">
                <svg className="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-warning-700">Edit Columns</span>
              </div>
            </div>

            <button
              onClick={() => handlePaneDoubleClick({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 })}
              className="btn-primary w-full mt-4"
            >
              Create Your First Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvas;
