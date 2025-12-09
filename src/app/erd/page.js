'use client';

import { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, addEdge } from 'reactflow';
import axios from 'axios';
import TableNode from '../components/TableNode';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Canvas from '../components/Canvas';
import AddDatabaseDialog from '../components/AddDatabaseDialog';
import AddTableDialog from '../components/AddTableDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import Snackbar from '../components/Snackbar';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = { tableNode: TableNode };

export default function DatabaseManager() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [openAddDB, setOpenAddDB] = useState(false);
  const [dbName, setDbName] = useState('');
  const [openAddTable, setOpenAddTable] = useState(false);
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: '' }]);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [toDelete, setToDelete] = useState('');

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

  const fetchDatabases = async () => {
    try {
      const res = await axios.get('/api/listDatabases');
      setDatabases(res.data.databases || []);
    } catch (err) {
      showSnackbar('Failed to fetch databases', 'error');
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/listTables');
      return res.data.tables || [];
    } catch (err) {
      showSnackbar('Failed to fetch tables', 'error');
      return [];
    }
  };

  const fetchColumns = async (table) => {
    if (!table) {
      showSnackbar('Invalid table name', 'error');
      return [];
    }
    try {
      const res = await axios.get(`/api/listColumns?tableName=${encodeURIComponent(table)}`);
      if (res.status !== 200) {
        showSnackbar(`Failed to fetch columns for ${table}`, 'error');
        return [];
      }
      return Array.isArray(res.data?.columns) ? res.data.columns : [];
    } catch (err) {
      console.error(`Error fetching columns for ${table}:`, err);
      showSnackbar(`Failed to fetch columns for ${table}`, 'error');
      return [];
    }
  };

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
          id: uuidv4(),
          type: 'tableNode',
          position: { x: (index % 4) * 250 + 50, y: Math.floor(index / 4) * 300 + 50 },
          data: {
            label: table,
            db: dbName,
            columns,
            loading: false,
            onNodesChange,
          },
        };
      })
    );

    setNodes(newNodes);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 4000);
  };

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

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 1.5 } }, eds)
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    fetchDatabases();
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <Header onFetchDatabases={fetchDatabases} />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            databases={databases}
            selectedDb={selectedDb}
            loadTablesOnCanvas={loadTablesOnCanvas}
            setOpenAddDB={setOpenAddDB}
            setOpenAddTable={setOpenAddTable}
            setToDelete={setToDelete}
            setOpenConfirmDelete={setOpenConfirmDelete}
          />
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            connectToDatabase={connectToDatabase}
            fetchColumns={fetchColumns}
          />
        </div>
        <AddDatabaseDialog
          open={openAddDB}
          setOpen={setOpenAddDB}
          dbName={dbName}
          setDbName={setDbName}
          handleCreateDatabase={handleCreateDatabase}
        />
        <AddTableDialog
          open={openAddTable}
          setOpen={setOpenAddTable}
          selectedDb={selectedDb}
          tableName={tableName}
          setTableName={setTableName}
          columns={columns}
          setColumns={setColumns}
          handleCreateTable={handleCreateTable}
        />
        <ConfirmDeleteDialog
          open={openConfirmDelete}
          setOpen={setOpenConfirmDelete}
          toDelete={toDelete}
          handleDeleteDatabase={handleDeleteDatabase}
        />
        <Snackbar open={snackbarOpen} message={snackbarMessage} severity={snackbarSeverity} />
      </div>
    </ReactFlowProvider>
  );
}