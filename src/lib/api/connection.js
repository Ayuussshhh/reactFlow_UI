/**
 * Connection API endpoints
 */
import api from './axiosInstance';

export const connectionAPI = {
  connect: async (connectionString, name, environment) => {
    if (!connectionString || connectionString.trim().length === 0) {
      throw new Error('Connection string is required');
    }
    
    const payload = {
      connectionString: connectionString.trim(),
    };
    
    if (name && name.trim()) {
      payload.name = name.trim();
    }
    
    if (environment) {
      payload.environment = environment;
    }
    
    const { data } = await api.post('/api/connections', payload);
    
    if (!data || !data.connection) {
      throw new Error('Invalid response from server');
    }
    
    return { 
      connection: data.connection, 
      schema: data.schema || { tables: [], foreignKeys: [] }
    };
  },

  test: async (connectionString) => {
    const { data } = await api.post('/api/connections/test', { connectionString });
    return {
      success: data.success,
      latencyMs: data.latencyMs || data.latency_ms,
      serverVersion: data.serverVersion || data.server_version,
    };
  },

  list: async () => {
    const { data } = await api.get('/api/connections');
    return data.data || [];
  },

  get: async (id) => {
    const { data } = await api.get(`/api/connections/${id}`);
    return data.data;
  },

  disconnect: async (id) => {
    await api.delete(`/api/connections/${id}`);
  },

  getSchema: async (id) => {
    const { data } = await api.get(`/api/connections/${id}/schema`);
    return data.data;
  },
};

/**
 * Snapshot API endpoints
 */
export const snapshotAPI = {
  create: async (connectionId, label) => {
    const { data } = await api.post(`/api/connections/${connectionId}/snapshots`, { label });
    return data.snapshot;
  },

  list: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots`);
    return data.snapshots || [];
  },

  getLatest: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/latest`);
    return data.snapshot;
  },

  getVersion: async (connectionId, version) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/${version}`);
    return data.snapshot;
  },

  diff: async (connectionId, fromVersion, toVersion) => {
    const params = new URLSearchParams();
    if (fromVersion) params.set('fromVersion', fromVersion);
    if (toVersion) params.set('toVersion', toVersion);
    const { data } = await api.get(
      `/api/connections/${connectionId}/snapshots/diff?${params}`
    );
    return { diff: data.diff, rulesResult: data.rulesResult };
  },

  setBaseline: async (connectionId, snapshotId) => {
    const { data } = await api.post(
      `/api/connections/${connectionId}/snapshots/${snapshotId}/baseline`
    );
    return data;
  },

  analyzeBlastRadius: async (connectionId, schema, table, column) => {
    const { data } = await api.post(`/api/connections/${connectionId}/blast-radius`, {
      schema,
      table,
      column,
    });
    return data.blastRadius;
  },

  checkDrift: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/schema-drift`);
    return { diff: data.diff, rulesResult: data.rulesResult };
  },
};

