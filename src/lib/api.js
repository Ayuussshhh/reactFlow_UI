/**
 * API Client for SchemaFlow
 * Centralized API client connecting to the Rust backend
 * 
 * NEW: Use connectionAPI for dynamic database connections
 * LEGACY: databaseAPI is kept for backward compatibility
 */

import axios from 'axios';

// Backend URL - defaults to localhost:3000 for Rust backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

console.log('[API] Backend URL:', BACKEND_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error';
    console.error(`[API Error]`, message);
    return Promise.reject({ message, status: error.response?.status });
  }
);

// ==================== NEW: Connection API ====================
// Use this for dynamic database connections via connection string

export const connectionAPI = {
  /**
   * Connect to a database using a connection string
   * @param {string} connectionString - PostgreSQL connection string (postgres://user:pass@host:port/db)
   * @param {string} [name] - Optional friendly name for the connection
   * @param {string} [environment] - Optional environment: development, staging, production
   * @returns {Promise<{connection: object, schema: object}>}
   */
  connect: async (connectionString, name = null, environment = null) => {
    const payload = { connectionString };
    if (name) payload.name = name;
    if (environment) payload.environment = environment;
    
    const { data } = await api.post('/api/connections', payload);
    return data.data; // Returns { connection, schema }
  },

  /**
   * Test a connection string without actually connecting
   * @param {string} connectionString - PostgreSQL connection string
   * @returns {Promise<{success: boolean, latencyMs: number, serverVersion: string}>}
   */
  test: async (connectionString) => {
    const { data } = await api.post('/api/connections/test', { connectionString });
    return data.data;
  },

  /**
   * List all active connections
   * @returns {Promise<Array>}
   */
  list: async () => {
    const { data } = await api.get('/api/connections');
    return data.data || [];
  },

  /**
   * Get a specific connection by ID
   * @param {string} id - Connection UUID
   * @returns {Promise<object>}
   */
  get: async (id) => {
    const { data } = await api.get(`/api/connections/${id}`);
    return data.data;
  },

  /**
   * Disconnect from a specific database
   * @param {string} id - Connection UUID
   */
  disconnect: async (id) => {
    const { data } = await api.delete(`/api/connections/${id}`);
    return data;
  },

  /**
   * Disconnect from all databases
   */
  disconnectAll: async () => {
    const { data } = await api.post('/api/connections/disconnect-all');
    return data;
  },

  /**
   * Get the currently active connection
   * @returns {Promise<{hasActiveConnection: boolean, connection?: object}>}
   */
  getActive: async () => {
    const { data } = await api.get('/api/connections/active');
    return data;
  },

  /**
   * Set the active connection
   * @param {string} connectionId - Connection UUID to make active
   */
  setActive: async (connectionId) => {
    const { data } = await api.post('/api/connections/active', { connectionId });
    return data;
  },

  /**
   * Re-introspect schema for a connection (refresh)
   * @param {string} id - Connection UUID
   * @returns {Promise<object>} - Schema snapshot
   */
  introspect: async (id) => {
    const { data } = await api.post(`/api/connections/${id}/introspect`);
    return data.data;
  },
};

// ==================== Schema API ====================

export const schemaAPI = {
  /**
   * Get schema for the currently active connection
   * @returns {Promise<object>} - Full schema with tables, foreign keys, indexes
   */
  get: async () => {
    const { data } = await api.get('/api/schema');
    return data.data;
  },
};

// ==================== Governance Pipeline API ====================
// The four-stage governance pipeline for safe schema changes

export const pipelineAPI = {
  // -------------------- Stage 1: Mirror (Introspection) --------------------
  
  /**
   * Build a semantic map ("Digital Twin") of the database
   * @param {string} connectionId - Connection UUID
   * @returns {Promise<{semanticMap: object}>}
   */
  buildSemanticMap: async (connectionId) => {
    const { data } = await api.post(`/api/pipeline/mirror/${connectionId}`);
    return data.data;
  },

  /**
   * Check for schema drift (differences between stored and live schema)
   * @param {string} connectionId - Connection UUID
   * @returns {Promise<{hasDrift: boolean, differences: array}>}
   */
  checkDrift: async (connectionId) => {
    const { data } = await api.post(`/api/pipeline/drift/${connectionId}`);
    return data.data;
  },

  // -------------------- Stage 2: Proposal (Glow Layer) --------------------
  
  /**
   * Create a new schema change proposal
   * @param {object} proposal - { connectionId, title, description }
   * @returns {Promise<{proposal: object}>}
   */
  createProposal: async (proposal) => {
    const { data } = await api.post('/api/pipeline/proposals', proposal);
    return data.data;
  },

  /**
   * List all proposals, optionally filtered
   * @param {object} filters - { connectionId?, status?, authorId? }
   * @returns {Promise<{proposals: array}>}
   */
  listProposals: async (filters = {}) => {
    const { data } = await api.get('/api/pipeline/proposals', { params: filters });
    return data.data;
  },

  /**
   * Get a specific proposal by ID
   * @param {string} proposalId - Proposal UUID
   * @returns {Promise<{proposal: object}>}
   */
  getProposal: async (proposalId) => {
    const { data } = await api.get(`/api/pipeline/proposals/${proposalId}`);
    return data.data;
  },

  /**
   * Add a schema change to a proposal
   * @param {string} proposalId - Proposal UUID
   * @param {object} change - Schema change object (AddColumn, DropColumn, etc.)
   * @returns {Promise<{proposal: object}>}
   */
  addChange: async (proposalId, change) => {
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/changes`, { change });
    return data.data;
  },

  /**
   * Generate migration SQL for a proposal
   * @param {string} proposalId - Proposal UUID
   * @returns {Promise<{proposal: object, migration: object}>}
   */
  generateMigration: async (proposalId) => {
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/migration`);
    return data.data;
  },

  /**
   * Submit a proposal for review
   * @param {string} proposalId - Proposal UUID
   * @returns {Promise<{proposal: object}>}
   */
  submitForReview: async (proposalId) => {
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/submit`);
    return data.data;
  },

  /**
   * Approve a proposal
   * @param {string} proposalId - Proposal UUID
   * @param {string} [comment] - Optional approval comment
   * @returns {Promise<{proposal: object}>}
   */
  approveProposal: async (proposalId, comment = null) => {
    const payload = comment ? { comment } : {};
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/approve`, payload);
    return data.data;
  },

  /**
   * Reject a proposal
   * @param {string} proposalId - Proposal UUID
   * @param {string} reason - Rejection reason (required)
   * @returns {Promise<{proposal: object}>}
   */
  rejectProposal: async (proposalId, reason) => {
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/reject`, { reason });
    return data.data;
  },

  /**
   * Add a comment to a proposal
   * @param {string} proposalId - Proposal UUID
   * @param {object} comment - { content, targetType?, targetId? }
   * @returns {Promise<{proposal: object}>}
   */
  addComment: async (proposalId, comment) => {
    const { data } = await api.post(`/api/pipeline/proposals/${proposalId}/comments`, comment);
    return data.data;
  },

  // -------------------- Stage 3: Brain (Risk Simulation) --------------------
  
  /**
   * Analyze risk for a proposal
   * @param {string} proposalId - Proposal UUID
   * @returns {Promise<{analysis: object}>} - Risk analysis with safety score
   */
  analyzeRisk: async (proposalId) => {
    const { data } = await api.post('/api/pipeline/risk', { proposalId });
    return data.data;
  },

  // -------------------- Stage 4: Orchestrator (Safe Execution) --------------------
  
  /**
   * Execute a proposal (with optional dry run)
   * @param {string} proposalId - Proposal UUID
   * @param {boolean} [dryRun=false] - If true, validates without executing
   * @returns {Promise<{proposal: object, result: object}>}
   */
  executeProposal: async (proposalId, dryRun = false) => {
    const { data } = await api.post('/api/pipeline/execute', { proposalId, dryRun });
    return data.data;
  },

  /**
   * Rollback a previously executed proposal
   * @param {string} proposalId - Proposal UUID
   * @returns {Promise<{proposal: object}>}
   */
  rollbackProposal: async (proposalId) => {
    const { data } = await api.post('/api/pipeline/rollback', { proposalId });
    return data.data;
  },

  // -------------------- Audit --------------------
  
  /**
   * Get audit log entries
   * @param {object} filters - { connectionId?, proposalId?, limit?, offset? }
   * @returns {Promise<{entries: array}>}
   */
  getAuditLog: async (filters = {}) => {
    const { data } = await api.get('/api/pipeline/audit', { params: filters });
    return data.data;
  },
};

// ==================== LEGACY: Database Operations ====================
// These require database configured in .env - use connectionAPI for dynamic connections

export const databaseAPI = {
  /**
   * List all databases
   */
  list: async () => {
    const { data } = await api.get('/db/list');
    return data.databases || [];
  },

  /**
   * Create a new database
   */
  create: async (name) => {
    const { data } = await api.post('/db/create', { Name: name });
    return data;
  },

  /**
   * Connect to a database
   */
  connect: async (dbName, options = {}) => {
    const payload = {
      dbName: dbName,
    };
    if (options.user) payload.user = options.user;
    if (options.password) payload.password = options.password;
    if (options.host) payload.host = options.host;
    if (options.port) payload.port = options.port;
    
    const { data } = await api.post('/db/connect', payload);
    return data;
  },

  /**
   * Delete a database
   */
  delete: async (databaseName) => {
    const { data } = await api.post('/db/delete', { databaseName: databaseName });
    return data;
  },

  /**
   * Disconnect from current database
   */
  disconnect: async () => {
    const { data } = await api.post('/db/disconnect');
    return data;
  },

  /**
   * Get connection status
   */
  status: async () => {
    const { data } = await api.get('/db/status');
    return data;
  },
};

// ==================== Table Operations ====================

export const tableAPI = {
  /**
   * List all tables in current database
   */
  list: async () => {
    const { data } = await api.get('/table/list');
    return data.tables || [];
  },

  /**
   * Create a new table
   */
  create: async (tableName, columns) => {
    const { data } = await api.post('/table/create', { tableName: tableName, columns });
    return data;
  },

  /**
   * Get columns for a table
   */
  getColumns: async (tableName) => {
    const { data } = await api.get('/table/columns', {
      params: { tableName: tableName },
    });
    return data.columns || [];
  },
};

// ==================== Foreign Key Operations ====================

export const foreignKeyAPI = {
  /**
   * Create a foreign key constraint
   */
  create: async (config) => {
    const { data } = await api.post('/foreignKey/create', {
      sourceTable: config.sourceTable,
      sourceColumn: config.sourceColumn,
      referencedTable: config.referencedTable,
      referencedColumn: config.referencedColumn,
      constraintName: config.constraintName,
      onDelete: config.onDelete || 'RESTRICT',
      onUpdate: config.onUpdate || 'RESTRICT',
    });
    return data;
  },

  /**
   * List foreign keys for a table
   */
  list: async (tableName) => {
    const { data } = await api.get('/foreignKey/list', {
      params: { tableName: tableName },
    });
    return data.foreignKeys || [];
  },

  /**
   * List all foreign keys in the database
   */
  listAll: async () => {
    const { data } = await api.get('/foreignKey/listAll');
    return data.foreignKeys || [];
  },

  /**
   * Delete a foreign key constraint
   */
  delete: async (tableName, constraintName) => {
    const { data } = await api.post('/foreignKey/delete', {
      tableName: tableName,
      constraintName: constraintName,
    });
    return data;
  },

  /**
   * Get primary keys for a table
   */
  getPrimaryKeys: async (tableName) => {
    const { data } = await api.get('/foreignKey/primaryKeys', {
      params: { tableName: tableName },
    });
    return data.primaryKeys || [];
  },

  /**
   * Validate if a column can be referenced
   */
  validateReference: async (tableName, columnName) => {
    const { data } = await api.post('/foreignKey/validateReference', {
      tableName: tableName,
      columnName: columnName,
    });
    return data.isValid;
  },
};

// ==================== Health Check ====================

export const healthAPI = {
  check: async () => {
    const { data } = await api.get('/health');
    return data;
  },
};

// Export all APIs
const allAPIs = {
  // NEW: Dynamic connections
  connection: connectionAPI,
  schema: schemaAPI,
  
  // Governance Pipeline (4-stage change management)
  pipeline: pipelineAPI,
  
  // Operations (work with active connection)
  table: tableAPI,
  foreignKey: foreignKeyAPI,
  
  // Legacy (requires .env database config)
  database: databaseAPI,
  
  // Utils
  health: healthAPI,
};

export default allAPIs;
