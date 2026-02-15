/**
 * SchemaFlow Global State Management
 * Using Zustand for lightweight, performant state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { databaseAPI, tableAPI, foreignKeyAPI, connectionAPI, schemaAPI, pipelineAPI } from '../lib/api';

/**
 * Main application store
 */
export const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // ==================== Connection State ====================
    // New connection system (v2)
    activeConnection: null, // { id, alias, environment, database, host }
    connections: [], // All available connections
    isLoadingSchema: false,
    
    // Legacy connection (for backward compatibility)
    connection: {
      isConnected: false,
      database: null,
      host: null,
      user: null,
      connectedAt: null,
    },

    // ==================== Database State ====================
    databases: [],
    selectedDatabase: null,
    isLoadingDatabases: false,

    // ==================== Table State ====================
    tables: [],
    isLoadingTables: false,
    
    // ==================== Foreign Key State ====================
    foreignKeys: [],
    isLoadingForeignKeys: false,

    // ==================== UI State ====================
    sidebarOpen: true,
    sqlPanelOpen: false,
    sidePanelOpen: false,
    currentSQL: '',
    activeView: 'schema', // 'schema' | 'data'
    
    // ==================== Selection State ====================
    selectedObject: null, // { id, type, data }
    
    // ==================== Pipeline State (Governance) ====================
    proposals: [], // All schema change proposals
    activeProposal: null, // Currently selected/editing proposal
    riskAnalysis: null, // Latest risk analysis result
    semanticMap: null, // Digital twin of database schema
    pipelineLoading: {
      proposals: false,
      risk: false,
      execution: false,
      mirror: false,
    },
    auditLog: [], // Pipeline execution history
    
    // ==================== Notifications ====================
    notifications: [],

    // ==================== Actions ====================
    
    // NEW: Connection Management (v2)
    connectWithConnectionString: async (connectionString, name, environment) => {
      try {
        const result = await connectionAPI.connect(connectionString, name, environment);
        
        // result contains { connection, schema }
        const { connection: connInfo, schema } = result;
        
        // Convert schema tables to our format
        const tables = schema.tables.map(table => ({
          name: table.name,
          schema: table.schema || 'public',
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.dataType || col.data_type,
            nullable: col.nullable,
            isPrimaryKey: col.isPrimaryKey || col.is_primary_key || false,
            isUnique: col.isUnique || col.is_unique || false,
            defaultValue: col.defaultValue || col.default_value,
          })),
        }));
        
        // Convert foreign keys
        const foreignKeys = schema.foreignKeys || schema.foreign_keys || [];
        
        set({ 
          activeConnection: connInfo,
          tables, 
          foreignKeys,
          connection: {
            isConnected: true,
            database: connInfo.database,
            host: connInfo.host || null,
            user: null,
            connectedAt: connInfo.connectedAt || new Date().toISOString(),
          },
        });
        
        get().addNotification(`Connected to ${name || connInfo.database}`, 'success');
        return result;
      } catch (error) {
        get().addNotification(error.message, 'error');
        throw error;
      }
    },

    fetchConnections: async () => {
      try {
        const connections = await connectionAPI.list();
        set({ connections });
        
        // Set active connection if there's one marked as active
        const active = connections.find(c => c.is_active);
        if (active) {
          set({ activeConnection: active });
        }
        
        return connections;
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        return [];
      }
    },

    introspectSchema: async (connectionId) => {
      set({ isLoadingSchema: true });
      try {
        const schema = await connectionAPI.introspect(connectionId);
        
        // Convert schema tables to our format
        const tables = schema.tables.map(table => ({
          name: table.name,
          schema: table.schema || 'public',
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.data_type,
            nullable: col.nullable,
            isPrimaryKey: col.is_primary_key || false,
            isUnique: col.is_unique || false,
            defaultValue: col.default_value,
          })),
        }));
        
        // Convert foreign keys
        const foreignKeys = [];
        schema.tables.forEach(table => {
          if (table.foreign_keys) {
            table.foreign_keys.forEach(fk => {
              foreignKeys.push({
                sourceTable: table.name,
                ...fk,
              });
            });
          }
        });
        
        set({ 
          tables, 
          foreignKeys,
          isLoadingSchema: false,
          connection: {
            isConnected: true,
            database: schema.database_name,
            host: null,
            user: null,
            connectedAt: schema.captured_at,
          },
        });
        
        return schema;
      } catch (error) {
        get().addNotification(error.message, 'error');
        set({ isLoadingSchema: false });
        throw error;
      }
    },

    disconnectConnection: async (connectionId) => {
      try {
        await connectionAPI.disconnect(connectionId);
        await get().fetchConnections();
        
        // Clear state if this was the active connection
        const state = get();
        if (state.activeConnection?.id === connectionId) {
          set({
            activeConnection: null,
            tables: [],
            foreignKeys: [],
            connection: {
              isConnected: false,
              database: null,
              host: null,
              user: null,
              connectedAt: null,
            },
          });
        }
        
        get().addNotification('Disconnected', 'info');
      } catch (error) {
        get().addNotification(error.message, 'error');
      }
    },
    
    // Database actions (legacy)
    fetchDatabases: async () => {
      set({ isLoadingDatabases: true });
      try {
        const databases = await databaseAPI.list();
        set({ databases, isLoadingDatabases: false });
        return databases;
      } catch (error) {
        get().addNotification(error.message, 'error');
        set({ isLoadingDatabases: false });
        return [];
      }
    },

    createDatabase: async (name) => {
      try {
        await databaseAPI.create(name);
        get().addNotification(`Database '${name}' created successfully`, 'success');
        await get().fetchDatabases();
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    deleteDatabase: async (name) => {
      try {
        await databaseAPI.delete(name);
        get().addNotification(`Database '${name}' deleted successfully`, 'success');
        
        // Clear selection if deleted database was selected
        if (get().selectedDatabase === name) {
          set({ selectedDatabase: null, tables: [], connection: { isConnected: false } });
        }
        
        await get().fetchDatabases();
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    connectToDatabase: async (dbName) => {
      try {
        // Clear previous tables when switching databases
        set({ tables: [], foreignKeys: [] });
        
        const response = await databaseAPI.connect(dbName);
        set({
          selectedDatabase: dbName,
          connection: {
            isConnected: true,
            database: response.database || dbName,
            host: response.host,
            user: response.user,
            connectedAt: response.connectedAt || new Date().toISOString(),
          },
        });
        get().addNotification(`Connected to '${dbName}'`, 'success');
        
        // Fetch tables for the new database
        await get().fetchTables();
        
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    disconnectDatabase: async () => {
      try {
        await databaseAPI.disconnect();
        set({
          selectedDatabase: null,
          connection: { isConnected: false, database: null, host: null, user: null, connectedAt: null },
          tables: [],
          foreignKeys: [],
        });
        get().addNotification('Disconnected', 'info');
      } catch (error) {
        // Even if backend disconnect fails, clear local state
        set({
          selectedDatabase: null,
          connection: { isConnected: false, database: null, host: null, user: null, connectedAt: null },
          tables: [],
          foreignKeys: [],
        });
        get().addNotification(error.message, 'error');
      }
    },

    // Table actions
    fetchTables: async () => {
      if (!get().connection.isConnected) {
        console.log('[Store] fetchTables: Not connected, returning empty');
        return [];
      }
      
      console.log('[Store] fetchTables: Fetching tables...');
      set({ isLoadingTables: true });
      try {
        const tableList = await tableAPI.list();
        console.log('[Store] fetchTables: Got table list:', tableList);
        
        // Fetch columns for each table
        const tablesWithColumns = await Promise.all(
          tableList.map(async (table) => {
            const tableName = typeof table === 'string' ? table : table.name;
            console.log('[Store] fetchTables: Fetching columns for', tableName);
            try {
              const columns = await tableAPI.getColumns(tableName);
              console.log('[Store] fetchTables:', tableName, 'has', columns?.length || 0, 'columns');
              return {
                name: tableName,
                schema: table.schema || 'public',
                owner: table.owner || '',
                type: table.table_type || table.type || 'table',
                columns: columns || [],
              };
            } catch (err) {
              console.warn(`Failed to fetch columns for ${tableName}:`, err);
              return {
                name: tableName,
                schema: table.schema || 'public',
                owner: table.owner || '',
                type: table.table_type || table.type || 'table',
                columns: [],
              };
            }
          })
        );
        
        console.log('[Store] fetchTables: Final tables with columns:', tablesWithColumns);
        set({ tables: tablesWithColumns, isLoadingTables: false });
        
        // Also fetch foreign keys
        get().fetchAllForeignKeys();
        
        return tablesWithColumns;
      } catch (error) {
        console.error('[Store] fetchTables error:', error);
        get().addNotification(error.message, 'error');
        set({ isLoadingTables: false });
        return [];
      }
    },

    createTable: async (tableName, columns) => {
      try {
        await tableAPI.create(tableName, columns);
        get().addNotification(`Table '${tableName}' created successfully`, 'success');
        await get().fetchTables();
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    fetchColumns: async (tableName) => {
      try {
        return await tableAPI.getColumns(tableName);
      } catch (error) {
        get().addNotification(error.message, 'error');
        return [];
      }
    },

    // Foreign key actions
    createForeignKey: async (config) => {
      try {
        await foreignKeyAPI.create(config);
        get().addNotification(`Foreign key created successfully`, 'success');
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    deleteForeignKey: async (tableName, constraintName) => {
      try {
        await foreignKeyAPI.delete(tableName, constraintName);
        get().addNotification(`Foreign key deleted`, 'success');
        return true;
      } catch (error) {
        get().addNotification(error.message, 'error');
        return false;
      }
    },

    fetchAllForeignKeys: async () => {
      set({ isLoadingForeignKeys: true });
      try {
        const foreignKeys = await foreignKeyAPI.listAll();
        set({ foreignKeys, isLoadingForeignKeys: false });
        return foreignKeys || [];
      } catch (error) {
        get().addNotification(error.message, 'error');
        set({ isLoadingForeignKeys: false });
        return [];
      }
    },

    // UI actions
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    
    toggleSQLPanel: () => set((state) => ({ sqlPanelOpen: !state.sqlPanelOpen })),
    setSQLPanelOpen: (open) => set({ sqlPanelOpen: open }),
    
    setSidePanelOpen: (open) => set({ sidePanelOpen: open }),
    
    setSelectedObject: (object) => set({ selectedObject: object }),
    
    setCurrentSQL: (sql) => set({ currentSQL: sql }),
    setActiveView: (view) => set({ activeView: view }),

    // ==================== Pipeline Actions (Governance) ====================
    
    // --- Stage 1: Mirror (Introspection) ---
    buildSemanticMap: async (connectionId) => {
      const connId = connectionId || get().activeConnection?.id;
      if (!connId) {
        get().addNotification('No active connection', 'error');
        return null;
      }
      
      set((state) => ({ pipelineLoading: { ...state.pipelineLoading, mirror: true } }));
      try {
        const result = await pipelineAPI.buildSemanticMap(connId);
        set({ semanticMap: result.semanticMap });
        get().addNotification('Semantic map built successfully', 'success');
        return result.semanticMap;
      } catch (error) {
        get().addNotification(`Mirror failed: ${error.message}`, 'error');
        return null;
      } finally {
        set((state) => ({ pipelineLoading: { ...state.pipelineLoading, mirror: false } }));
      }
    },

    checkDrift: async (connectionId) => {
      const connId = connectionId || get().activeConnection?.id;
      if (!connId) {
        get().addNotification('No active connection', 'error');
        return null;
      }
      
      try {
        const result = await pipelineAPI.checkDrift(connId);
        if (result.hasDrift) {
          get().addNotification(`Schema drift detected: ${result.differences.length} changes`, 'warning');
        }
        return result;
      } catch (error) {
        get().addNotification(`Drift check failed: ${error.message}`, 'error');
        return null;
      }
    },

    // --- Stage 2: Proposal (Glow Layer) ---
    fetchProposals: async (filters = {}) => {
      set((state) => ({ pipelineLoading: { ...state.pipelineLoading, proposals: true } }));
      try {
        const result = await pipelineAPI.listProposals(filters);
        set({ proposals: result.proposals || result || [] });
        return result.proposals || result;
      } catch (error) {
        get().addNotification(`Failed to fetch proposals: ${error.message}`, 'error');
        return [];
      } finally {
        set((state) => ({ pipelineLoading: { ...state.pipelineLoading, proposals: false } }));
      }
    },

    createProposal: async (title, description) => {
      const connId = get().activeConnection?.id;
      if (!connId) {
        get().addNotification('No active connection', 'error');
        return null;
      }
      
      try {
        const result = await pipelineAPI.createProposal({
          connectionId: connId,
          title,
          description,
        });
        const proposal = result.proposal || result;
        set((state) => ({ 
          proposals: [...state.proposals, proposal],
          activeProposal: proposal,
        }));
        get().addNotification(`Proposal "${title}" created`, 'success');
        return proposal;
      } catch (error) {
        get().addNotification(`Failed to create proposal: ${error.message}`, 'error');
        return null;
      }
    },

    setActiveProposal: (proposal) => {
      set({ activeProposal: proposal, riskAnalysis: null });
    },

    addChangeToProposal: async (change) => {
      const proposal = get().activeProposal;
      if (!proposal) {
        get().addNotification('No active proposal', 'error');
        return false;
      }
      
      try {
        const result = await pipelineAPI.addChange(proposal.id, change);
        const updatedProposal = result.proposal || result;
        set((state) => ({
          activeProposal: updatedProposal,
          proposals: state.proposals.map(p => p.id === updatedProposal.id ? updatedProposal : p),
        }));
        get().addNotification('Change added to proposal', 'info');
        return true;
      } catch (error) {
        get().addNotification(`Failed to add change: ${error.message}`, 'error');
        return false;
      }
    },

    generateMigration: async (proposalId) => {
      const pId = proposalId || get().activeProposal?.id;
      if (!pId) {
        get().addNotification('No proposal selected', 'error');
        return null;
      }
      
      try {
        const result = await pipelineAPI.generateMigration(pId);
        const updatedProposal = result.proposal || result;
        set((state) => ({
          activeProposal: state.activeProposal?.id === pId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === pId ? updatedProposal : p),
        }));
        get().addNotification('Migration SQL generated', 'success');
        return result.migration || updatedProposal.migrationArtifacts;
      } catch (error) {
        get().addNotification(`Migration generation failed: ${error.message}`, 'error');
        return null;
      }
    },

    submitProposalForReview: async (proposalId) => {
      const pId = proposalId || get().activeProposal?.id;
      if (!pId) {
        get().addNotification('No proposal selected', 'error');
        return false;
      }
      
      try {
        const result = await pipelineAPI.submitForReview(pId);
        const updatedProposal = result.proposal || result;
        set((state) => ({
          activeProposal: state.activeProposal?.id === pId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === pId ? updatedProposal : p),
        }));
        get().addNotification('Proposal submitted for review', 'success');
        return true;
      } catch (error) {
        get().addNotification(`Submit failed: ${error.message}`, 'error');
        return false;
      }
    },

    approveProposal: async (proposalId, comment) => {
      try {
        const result = await pipelineAPI.approveProposal(proposalId, comment);
        const updatedProposal = result.proposal || result;
        set((state) => ({
          activeProposal: state.activeProposal?.id === proposalId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === proposalId ? updatedProposal : p),
        }));
        get().addNotification('Proposal approved', 'success');
        return true;
      } catch (error) {
        get().addNotification(`Approval failed: ${error.message}`, 'error');
        return false;
      }
    },

    rejectProposal: async (proposalId, reason) => {
      try {
        const result = await pipelineAPI.rejectProposal(proposalId, reason);
        const updatedProposal = result.proposal || result;
        set((state) => ({
          activeProposal: state.activeProposal?.id === proposalId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === proposalId ? updatedProposal : p),
        }));
        get().addNotification('Proposal rejected', 'info');
        return true;
      } catch (error) {
        get().addNotification(`Rejection failed: ${error.message}`, 'error');
        return false;
      }
    },

    // --- Stage 3: Brain (Risk Analysis) ---
    analyzeRisk: async (proposalId) => {
      const pId = proposalId || get().activeProposal?.id;
      if (!pId) {
        get().addNotification('No proposal selected', 'error');
        return null;
      }
      
      set((state) => ({ pipelineLoading: { ...state.pipelineLoading, risk: true } }));
      try {
        const result = await pipelineAPI.analyzeRisk(pId);
        const analysis = result.analysis || result;
        set({ riskAnalysis: analysis });
        
        const score = analysis.safetyScore || analysis.safety_score || 0;
        if (score >= 80) {
          get().addNotification(`Risk analysis complete: Safe (${score}/100)`, 'success');
        } else if (score >= 50) {
          get().addNotification(`Risk analysis complete: Moderate risk (${score}/100)`, 'warning');
        } else {
          get().addNotification(`Risk analysis complete: High risk (${score}/100)`, 'error');
        }
        return analysis;
      } catch (error) {
        get().addNotification(`Risk analysis failed: ${error.message}`, 'error');
        return null;
      } finally {
        set((state) => ({ pipelineLoading: { ...state.pipelineLoading, risk: false } }));
      }
    },

    // --- Stage 4: Orchestrator (Safe Execution) ---
    executeProposal: async (proposalId, dryRun = false) => {
      const pId = proposalId || get().activeProposal?.id;
      if (!pId) {
        get().addNotification('No proposal selected', 'error');
        return null;
      }
      
      set((state) => ({ pipelineLoading: { ...state.pipelineLoading, execution: true } }));
      try {
        const result = await pipelineAPI.executeProposal(pId, dryRun);
        const updatedProposal = result.proposal || result;
        
        set((state) => ({
          activeProposal: state.activeProposal?.id === pId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === pId ? updatedProposal : p),
        }));
        
        if (dryRun) {
          get().addNotification('Dry run completed successfully', 'success');
        } else {
          get().addNotification('Schema changes applied successfully!', 'success');
          // Refresh schema after execution
          const connId = get().activeConnection?.id;
          if (connId) {
            await get().introspectSchema(connId);
          }
        }
        return result;
      } catch (error) {
        get().addNotification(`Execution failed: ${error.message}`, 'error');
        return null;
      } finally {
        set((state) => ({ pipelineLoading: { ...state.pipelineLoading, execution: false } }));
      }
    },

    rollbackProposal: async (proposalId) => {
      const pId = proposalId || get().activeProposal?.id;
      if (!pId) {
        get().addNotification('No proposal selected', 'error');
        return false;
      }
      
      set((state) => ({ pipelineLoading: { ...state.pipelineLoading, execution: true } }));
      try {
        const result = await pipelineAPI.rollbackProposal(pId);
        const updatedProposal = result.proposal || result;
        
        set((state) => ({
          activeProposal: state.activeProposal?.id === pId ? updatedProposal : state.activeProposal,
          proposals: state.proposals.map(p => p.id === pId ? updatedProposal : p),
        }));
        
        get().addNotification('Rollback completed successfully', 'success');
        // Refresh schema after rollback
        const connId = get().activeConnection?.id;
        if (connId) {
          await get().introspectSchema(connId);
        }
        return true;
      } catch (error) {
        get().addNotification(`Rollback failed: ${error.message}`, 'error');
        return false;
      } finally {
        set((state) => ({ pipelineLoading: { ...state.pipelineLoading, execution: false } }));
      }
    },

    // --- Audit ---
    fetchAuditLog: async (filters = {}) => {
      try {
        const result = await pipelineAPI.getAuditLog(filters);
        const entries = result.entries || result || [];
        set({ auditLog: entries });
        return entries;
      } catch (error) {
        get().addNotification(`Failed to fetch audit log: ${error.message}`, 'error');
        return [];
      }
    },

    // --- Pipeline Reset ---
    clearPipelineState: () => {
      set({
        proposals: [],
        activeProposal: null,
        riskAnalysis: null,
        semanticMap: null,
        auditLog: [],
        pipelineLoading: {
          proposals: false,
          risk: false,
          execution: false,
          mirror: false,
        },
      });
    },

    // Notification actions
    addNotification: (message, type = 'info') => {
      const id = uuidv4();
      set((state) => ({
        notifications: [...state.notifications, { id, message, type, timestamp: Date.now() }],
      }));
      // Auto-remove after 5 seconds
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, 5000);
    },

    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clearNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },
  }))
);

/**
 * Canvas store for ReactFlow state
 */
export const useCanvasStore = create(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    removeNode: (id) => set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
    })),

    updateNode: (id, data) => set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    })),

    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    removeEdge: (id) => set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

    setSelectedNode: (node) => set({ selectedNode: node }),
    setSelectedEdge: (edge) => set({ selectedEdge: edge }),

    clearCanvas: () => set({ nodes: [], edges: [], selectedNode: null, selectedEdge: null }),

    // Build nodes from tables data
    buildNodesFromTables: (tables) => {
      console.log('[Canvas Store] buildNodesFromTables called with:', tables);
      
      if (!Array.isArray(tables) || tables.length === 0) {
        console.log('[Canvas Store] No tables to build nodes from');
        return [];
      }
      
      // Color palette for object cards
      const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'indigo'];
      
      const nodes = tables.map((table, index) => {
        const tableName = typeof table === 'string' ? table : table.name;
        const rawColumns = (typeof table === 'string' ? [] : table.columns) || [];
        
        // Normalize column data format
        const columns = rawColumns.map(col => ({
          name: col.name,
          type: col.data_type || col.type || 'text',
          nullable: col.nullable === true || col.nullable === 'YES',
          isPrimaryKey: col.is_primary_key || col.isPrimaryKey || false,
          isUnique: col.is_unique || col.isUnique || false,
          defaultValue: col.default_value || col.defaultValue || null,
        }));
        
        // Extract primary keys as array of column names
        const primaryKeys = columns
          .filter(col => col.isPrimaryKey)
          .map(col => col.name);
        
        const node = {
          id: `table-${tableName}-${index}`,
          type: 'objectCard', // Use the new ObjectCard node type
          position: {
            x: 100 + (index % 3) * 380,
            y: 100 + Math.floor(index / 3) * 320,
          },
          data: {
            label: tableName,
            columns,
            primaryKeys,
            foreignKeys: {},
            sampleData: [],
            color: colors[index % colors.length],
          },
        };
        
        console.log('[Canvas Store] Created node:', node);
        return node;
      });
      
      console.log('[Canvas Store] Setting nodes:', nodes.length, 'nodes');
      set({ nodes });
      return nodes;
    },

    // Build edges from foreign keys
    buildEdgesFromForeignKeys: (foreignKeys) => {
      const { nodes } = get();
      
      if (!Array.isArray(foreignKeys) || foreignKeys.length === 0 || !Array.isArray(nodes) || nodes.length === 0) return [];
      
      const edges = foreignKeys.map((fk) => {
        // Handle both camelCase and snake_case field naming
        const sourceTableName = fk.sourceTable || fk.source_table || fk.table_name;
        const targetTableName = fk.referencedTable || fk.referenced_table || fk.foreign_table_name;
        const sourceColumnName = fk.column || fk.source_column || fk.column_name;
        const targetColumnName = fk.referencedColumn || fk.referenced_column || fk.foreign_column_name;
        
        const sourceNode = nodes.find((n) => n.data.label === sourceTableName);
        const targetNode = nodes.find((n) => n.data.label === targetTableName);

        if (!sourceNode || !targetNode) {
          console.warn(`FK: Could not find nodes for ${sourceTableName} -> ${targetTableName}`);
          return null;
        }

        const sourceColIdx = sourceNode.data.columns.findIndex((c) => c.name === sourceColumnName);
        const targetColIdx = targetNode.data.columns.findIndex((c) => c.name === targetColumnName);

        return {
          id: `fk-${fk.constraint_name || fk.constraintName || fk.name || `${sourceTableName}-${targetTableName}`}`,
          source: sourceNode.id,
          target: targetNode.id,
          sourceHandle: sourceColIdx >= 0 ? `col-${sourceColIdx}-right` : undefined,
          targetHandle: targetColIdx >= 0 ? `col-${targetColIdx}-left` : undefined,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          data: {
            constraintName: fk.constraint_name || fk.constraintName || fk.name,
            sourceTable: sourceTableName,
            sourceColumn: sourceColumnName,
            targetTable: targetTableName,
            targetColumn: targetColumnName,
            onDelete: fk.onDelete || fk.on_delete || 'RESTRICT',
            onUpdate: fk.onUpdate || fk.on_update || 'RESTRICT',
          },
        };
      }).filter(Boolean);

      set({ edges });
      return edges;
    },
  }))
);

// Export selectors for common state slices
export const selectConnection = (state) => state.connection;
export const selectDatabases = (state) => state.databases;
export const selectTables = (state) => state.tables;
export const selectNodes = (state) => state.nodes;
export const selectEdges = (state) => state.edges;
