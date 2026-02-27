/**
 * Connection API
 * 
 * Backend routes:
 * - POST /api/connections -> { success, message, data: { connection, schema } }
 * - POST /api/connections/test -> { success, message, data: ConnectionTestResult }
 * - GET /api/connections -> { success, message, data: ConnectionInfo[] }
 * - GET /api/connections/active -> { success, hasActiveConnection, connection? }
 * - POST /api/connections/active -> { message }
 * - POST /api/connections/disconnect-all -> { message }
 * - GET /api/connections/{id} -> { success, message, data: ConnectionInfo }
 * - DELETE /api/connections/{id} -> { message }
 * - POST /api/connections/{id}/introspect -> { success, message, data: SchemaSnapshot }
 * - GET /api/schema -> { success, message, data: SchemaSnapshot } (active connection)
 */
import api from './axiosInstance';

export const connectionAPI = {
  /**
   * Connect to a database
   * @returns {{ connection: ConnectionInfo, schema: SchemaSnapshot }}
   */
  connect: async (connectionString, name, environment) => {
    if (!connectionString?.trim()) {
      throw new Error('Connection string is required');
    }
    
    const payload = {
      connectionString: connectionString.trim(),
    };
    
    if (name?.trim()) {
      payload.name = name.trim();
    }
    
    if (environment) {
      payload.environment = environment;
    }
    
    const { data } = await api.post('/api/connections', payload);
    
    // Backend returns: { success, message, data: { connection, schema } }
    const result = data.data || data;
    
    if (!result?.connection) {
      throw new Error('Invalid response from server');
    }
    
    return { 
      connection: result.connection, 
      schema: result.schema || { tables: [], foreignKeys: [] },
    };
  },

  /**
   * Test a connection without persisting
   */
  test: async (connectionString) => {
    const { data } = await api.post('/api/connections/test', { 
      connectionString: connectionString.trim(),
    });
    
    const result = data.data || data;
    
    return {
      success: data.success !== false,
      latencyMs: result.latencyMs || result.latency_ms || 0,
      serverVersion: result.serverVersion || result.server_version || 'Unknown',
    };
  },

  /**
   * List all active connections
   */
  list: async () => {
    const { data } = await api.get('/api/connections');
    return data.data || [];
  },

  /**
   * Get a specific connection by ID
   */
  get: async (id) => {
    const { data } = await api.get(`/api/connections/${id}`);
    return data.data;
  },

  /**
   * Disconnect from a specific database
   */
  disconnect: async (id) => {
    await api.delete(`/api/connections/${id}`);
  },

  /**
   * Disconnect from all databases
   */
  disconnectAll: async () => {
    await api.post('/api/connections/disconnect-all');
  },

  /**
   * Get the active connection
   */
  getActive: async () => {
    const { data } = await api.get('/api/connections/active');
    return {
      hasActive: data.hasActiveConnection,
      connection: data.connection || null,
    };
  },

  /**
   * Set the active connection
   */
  setActive: async (connectionId) => {
    const { data } = await api.post('/api/connections/active', { 
      connectionId,
    });
    return data;
  },

  /**
   * Introspect (refresh) schema for a connection
   * Returns: SchemaSnapshot { tables, foreignKeys, connectionId, version, ... }
   */
  introspect: async (connectionId) => {
    const { data } = await api.post(`/api/connections/${connectionId}/introspect`);
    return data.data;
  },

  /**
   * Get schema for the currently active connection
   */
  getActiveSchema: async () => {
    const { data } = await api.get('/api/schema');
    return data.data;
  },
};

/**
 * Snapshot API
 * 
 * Backend routes:
 * - POST /api/connections/{id}/snapshots -> { success, message, snapshot }
 * - GET /api/connections/{id}/snapshots -> { success, snapshots }
 * - GET /api/connections/{id}/snapshots/latest -> { success, message, snapshot }
 * - GET /api/connections/{id}/snapshots/{version} -> { success, message, snapshot }
 * - GET /api/connections/{id}/snapshots/diff?fromVersion&toVersion -> { success, diff, rulesResult }
 * - POST /api/connections/{id}/snapshots/{snapshot_id}/baseline -> { success }
 * - POST /api/connections/{id}/blast-radius -> { success, blastRadius }
 * - GET /api/connections/{id}/schema-drift -> { success, diff, rulesResult }
 */
export const snapshotAPI = {
  /**
   * Create a new schema snapshot
   */
  create: async (connectionId, label) => {
    const { data } = await api.post(`/api/connections/${connectionId}/snapshots`, { 
      label,
    });
    return data.snapshot;
  },

  /**
   * List all snapshots for a connection
   */
  list: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots`);
    return data.snapshots || [];
  },

  /**
   * Get the latest snapshot
   */
  getLatest: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/latest`);
    return data.snapshot;
  },

  /**
   * Get a specific snapshot version
   */
  getVersion: async (connectionId, version) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/${version}`);
    return data.snapshot;
  },

  /**
   * Compare two snapshots (diff)
   */
  diff: async (connectionId, fromVersion, toVersion) => {
    const params = new URLSearchParams();
    if (fromVersion) params.set('fromVersion', fromVersion);
    if (toVersion) params.set('toVersion', toVersion);
    
    const { data } = await api.get(
      `/api/connections/${connectionId}/snapshots/diff?${params}`
    );
    
    return { 
      diff: data.diff, 
      rulesResult: data.rulesResult || data.rules_result,
    };
  },

  /**
   * Set a snapshot as baseline
   */
  setBaseline: async (connectionId, snapshotId) => {
    const { data } = await api.post(
      `/api/connections/${connectionId}/snapshots/${snapshotId}/baseline`
    );
    return data;
  },

  /**
   * Analyze blast radius for a schema change
   */
  analyzeBlastRadius: async (connectionId, schema, table, column) => {
    const { data } = await api.post(`/api/connections/${connectionId}/blast-radius`, {
      schema,
      table,
      column,
    });
    return data.blastRadius || data.blast_radius;
  },

  /**
   * Check for schema drift
   */
  checkDrift: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/schema-drift`);
    return { 
      diff: data.diff, 
      rulesResult: data.rulesResult || data.rules_result,
    };
  },
};

