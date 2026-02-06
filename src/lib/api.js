/**
 * API Client for SchemaFlow
 * Centralized API client connecting to the Rust backend
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

// ==================== Database Operations ====================

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
  database: databaseAPI,
  table: tableAPI,
  foreignKey: foreignKeyAPI,
  health: healthAPI,
};

export default allAPIs;
