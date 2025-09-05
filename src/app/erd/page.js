'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

// Custom Table Node - Luxurious design
function TableNode({ data }) {
  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-lg min-w-[250px] transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="flex items-center space-x-2 mb-3">
        <svg
          className="w-5 h-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">{data.label}</h3>
      </div>

      <p className="text-sm text-gray-500 mb-3">{data.db}</p>
      <hr className="border-gray-200 mb-3" />

      {data.loading ? (
        <p className="text-sm text-gray-500 italic">Loading columns...</p>
      ) : data.columns.length === 0 ? (
        <p className="text-sm text-gray-500">No columns defined</p>
      ) : (
        <ul className="space-y-2">
          {data.columns.map((col, index) => (
            <li
              key={`${data.label}-${col.name}-${index}`} // ✅ unique key
              className="flex items-center space-x-2 text-sm text-gray-700"
            >
              <span className="w-2 h-2 bg-indigo-200 rounded-full"></span>
              <span>{col.name}:</span>
              <span className="text-gray-500 font-mono">{col.type}</span>
            </li>
          ))}
        </ul>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

function FlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const idCount = useRef(0);

  const [databases, setDatabases] = useState([]);
  const [showDatabases, setShowDatabases] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dialog states
  const [openAddDB, setOpenAddDB] = useState(false);
  const [dbName, setDbName] = useState('');
  const [openAddTable, setOpenAddTable] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: '' }]);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [toDelete, setToDelete] = useState('');

  // Connect to database
  const connectToDatabase = async (dbName) => {
    try {
      const res = await axios.post('/api/connectDatabase', { dbName });
      showSnackbar(res.data.message);
      return true;
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error connecting to database', 'error');
      return false;
    }
  };

  // Fetch databases
  const fetchDatabases = async () => {
    try {
      const res = await axios.get('/api/listDatabases');
      setDatabases(res.data.databases || []);
      setShowDatabases(true);
    } catch (err) {
      showSnackbar('Failed to fetch databases', 'error');
    }
  };

  // Fetch tables for the current database
  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/listTables');
      return res.data.tables || [];
    } catch (err) {
      showSnackbar('Failed to fetch tables', 'error');
      return [];
    }
  };

  // Fetch columns for a table
const fetchColumns = async (table) => {
  if (!table) {
    showSnackbar('Invalid table name', 'error');
    return [];
  }

  try {
    const res = await axios.get(
      `/api/listColumns?tableName=${encodeURIComponent(table)}`
    );

    if (res.status !== 200) {
      showSnackbar(`Failed to fetch columns for ${table}`, 'error');
      return [];
    }

    // Ensure data format is always consistent
    return Array.isArray(res.data?.columns) ? res.data.columns : [];
  } catch (err) {
    console.error(`Error fetching columns for ${table}:`, err);
    showSnackbar(`Failed to fetch columns for ${table}`, 'error');
    return [];
  }
};

  // Load tables on canvas
  const loadTablesOnCanvas = async (dbName) => {
    const connected = await connectToDatabase(dbName);
    if (!connected) return;

    setSelectedDb(dbName);
    setNodes([]);

    const tables = await fetchTables();
    const newNodes = await Promise.all(
      tables.map(async (table, index) => {
        const columns = await fetchColumns(table);
        return {
          id: `node_${idCount.current++}`,
          type: 'tableNode',
          position: { x: (index % 4) * 300 + 50, y: Math.floor(index / 4) * 350 + 50 },
          data: {
            label: table,
            db: dbName,
            columns,
            loading: false,
          },
        };
      })
    );

    setNodes(newNodes);
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 6000);
  };

  // Create database
  const handleCreateDatabase = async () => {
    if (!dbName.trim()) {
      showSnackbar('Database name is required', 'error');
      return;
    }
    try {
      const res = await axios.post('/api/createDatabase', { Name: dbName.trim() });
      showSnackbar(res.data.message);
      setDatabases((prev) => [...prev, dbName.trim()]);
      setDbName('');
      setOpenAddDB(false);
      await fetchDatabases();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error creating database', 'error');
    }
  };

  // Delete database
  const handleDeleteDatabase = async () => {
    try {
      const res = await axios.post('/api/deleteDatabase', { databaseName: toDelete });
      showSnackbar(res.data.message);
      setDatabases((prev) => prev.filter((db) => db !== toDelete));
      if (selectedDb === toDelete) setSelectedDb(null);
      setOpenConfirmDelete(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error deleting database', 'error');
    }
  };

  // Add column input
  const addColumn = () => {
    setColumns((prev) => [...prev, { name: '', type: '' }]);
  };

  // Update column
  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  // Create table
  const handleCreateTable = async () => {
    if (!tableName.trim() || !columns.every((col) => col.name.trim() && col.type.trim())) {
      showSnackbar('Table name and valid columns are required', 'error');
      return;
    }
    try {
      const res = await axios.post('/api/createTable', {
        tableName: tableName.trim(),
        columns: columns.map((col) => ({ name: col.name.trim(), type: col.type.trim() })),
      });
      showSnackbar(res.data.message);
      if (selectedDb) await loadTablesOnCanvas(selectedDb);
      setTableName('');
      setColumns([{ name: '', type: '' }]);
      setOpenAddTable(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error creating table', 'error');
    }
  };

  // Handle connect for edges
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  // Handle drop on canvas
  const onDrop = useCallback(
    async (event) => {
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

      const newId = `node_${idCount.current++}`;
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

      setNodes((nds) => nds.concat(newNode));

      const columns = await fetchColumns(dragData.table);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === newId ? { ...n, data: { ...n.data, columns, loading: false } } : n
        )
      );
    },
    [project, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Header - Elegant design */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
          <h1 className="text-xl font-bold text-gray-900">Database Designer</h1>
          <p className="text-sm text-gray-500">Visual Schema Editor</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDatabases}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Connect</span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm"
            />
            <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">100%</span>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1m0 0v3m0-3H1m3 0h3m14-3v1m0 0v3m0-3h-3m3 0h3M4 8v1m0 0v3m0-3H1m3 0h3m14 3v1m0 0v3m0-3h-3m3 0h3" />
            </svg>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar - Premium look */}
        <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
          <div className="p-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search databases..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {databases.map((db) => (
              <div
                key={db}
                onClick={() => loadTablesOnCanvas(db)}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer rounded-xl transition-all ${selectedDb === db ? 'bg-indigo-50 shadow-md' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full shadow"></span>
                      <span className="text-base font-medium text-gray-900">{db}</span>
                    </div>
                    <p className="text-sm text-gray-500">PostgreSQL</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDelete(db);
                    setOpenConfirmDelete(true);
                  }}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => setOpenAddDB(true)}
              className="w-full px-5 py-3 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors shadow-md font-medium"
            >
              Add Database
            </button>
            {selectedDb && (
              <button
                onClick={() => setOpenAddTable(true)}
                className="w-full px-5 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md font-medium"
              >
                Add Table to {selectedDb}
              </button>
            )}
          </div>
        </aside>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 transform translate-y-1/2 z-10 p-2 bg-white border border-gray-200 rounded-r-full shadow-md hover:bg-gray-100 transition-all"
          style={{ left: sidebarOpen ? '20rem' : '0' }}
        >
          <svg className={`w-5 h-5 text-gray-700 transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Canvas */}
        <div className="flex-1 relative">
          <div ref={reactFlowWrapper} className="h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid
              snapGrid={[16, 16]}
            >
              <MiniMap nodeColor="#6366f1" nodeStrokeColor="#ffffff" maskColor="rgba(255,255,255,0.1)" />
              <Controls className="bg-white shadow-lg rounded-lg" />
              <Background color="#e5e7eb" gap={16} />
            </ReactFlow>
          </div>
          {nodes.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center max-w-lg p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Building Your Schema</h2>
              <p className="text-lg text-gray-600 mb-6">
                Select a database from the sidebar to load tables, or create a new one. Drag, connect, and visualize with ease.
              </p>
              <div className="flex justify-center space-x-4">
                <span className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-full flex items-center space-x-2 shadow-sm">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                  <span>Drag & Drop</span>
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-full flex items-center space-x-2 shadow-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Auto Layout</span>
                </span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-full flex items-center space-x-2 shadow-sm">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span>Smart Relations</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Database Dialog - Modern modal */}
      {openAddDB && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Database</h2>
            <input
              autoFocus
              type="text"
              placeholder="Database Name"
              className="w-full px-5 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setOpenAddDB(false)}
                className="px-6 py-3 text-gray-700 rounded-full hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDatabase}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Dialog */}
      {openAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Table in {selectedDb}</h2>
            <input
              autoFocus
              type="text"
              placeholder="Table Name"
              className="w-full px-5 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm mb-6"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
            <div className="space-y-4">
              {columns.map((col, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Column Name"
                    className="px-5 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={col.name}
                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Type (e.g., VARCHAR(100))"
                    className="px-5 py-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={col.type}
                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addColumn}
              className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors flex items-center space-x-2 mx-auto shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Column</span>
            </button>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setOpenAddTable(false)}
                className="px-6 py-3 text-gray-700 rounded-full hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                disabled={!selectedDb}
                className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {openConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delete Database</h2>
            <p className="text-lg text-gray-600 mb-6">Are you sure you want to delete <span className="font-medium">{toDelete}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setOpenConfirmDelete(false)}
                className="px-6 py-3 text-gray-700 rounded-full hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDatabase}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar - Stylish notification */}
      {snackbarOpen && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-full text-white shadow-lg transition-all duration-300 ${snackbarSeverity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}

export default function DatabaseManager() {
  return (
    <ReactFlowProvider>
      <FlowComponent />
    </ReactFlowProvider>
  );
}