/**
 * API Client for SchemaFlow
 * Clean, typed API layer with auth support
 */
import axios from 'axios';
import { useAuthStore } from '../store/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { refreshToken, setAuth, logout } = useAuthStore.getState();
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });
          
          // Auth endpoints return { success, user, tokens } directly
          setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error.response?.data || { message: 'Network error' });
  }
);

// ==================== Auth API ====================
export const authAPI = {
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data; // Auth endpoints don't wrap in data field
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    return data; // Auth endpoints don't wrap in data field
  },

  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data; // Returns { success, user }
  },

  refresh: async (refreshToken) => {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data; // Auth endpoints don't wrap in data field
  },

  listUsers: async () => {
    const { data } = await api.get('/api/auth/users');
    return data; // Returns { success, users }
  },

  updateRole: async (userId, role) => {
    const { data } = await api.put(`/api/auth/users/${userId}/role`, { role });
    return data.data;
  },
};

// ==================== Connection API ====================
export const connectionAPI = {
  connect: async (connectionString, name, environment) => {
    const { data } = await api.post('/api/connections', {
      connectionString,
      name,
      environment,
    });
    // Backend uses serde(flatten), so connection/schema are at top level
    return { connection: data.connection, schema: data.schema };
  },

  test: async (connectionString) => {
    const { data } = await api.post('/api/connections/test', { connectionString });
    // Flattened response - latencyMs, serverVersion at top level
    return { 
      success: data.success, 
      latencyMs: data.latencyMs || data.latency_ms,
      serverVersion: data.serverVersion || data.server_version 
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

// ==================== Schema API ====================
export const schemaAPI = {
  getTables: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/tables`);
    return data.data || [];
  },

  getForeignKeys: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/foreign-keys`);
    return data.data || [];
  },
};

// ==================== Pipeline API ====================
export const pipelineAPI = {
  listProposals: async () => {
    const { data } = await api.get('/api/pipeline/proposals');
    return data.data || [];
  },

  createProposal: async (proposal) => {
    const { data } = await api.post('/api/pipeline/proposals', proposal);
    return data.data;
  },

  getProposal: async (id) => {
    const { data } = await api.get(`/api/pipeline/proposals/${id}`);
    return data.data;
  },

  submitForReview: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/submit`);
    return data.data;
  },

  approve: async (id, comments) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/approve`, { comments });
    return data.data;
  },

  reject: async (id, reason) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/reject`, { reason });
    return data.data;
  },

  execute: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/execute`);
    return data.data;
  },

  analyzeRisk: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/analyze`);
    return data.data;
  },

  generateMigration: async (id) => {
    const { data } = await api.post(`/api/pipeline/proposals/${id}/migration`);
    return data.data;
  },
};

// ==================== Snapshot & Impact Analysis API ====================
export const snapshotAPI = {
  // Create a new schema snapshot
  create: async (connectionId, label) => {
    const { data } = await api.post(`/api/connections/${connectionId}/snapshots`, { label });
    return data.snapshot;
  },

  // List all snapshots for a connection
  list: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots`);
    return data.snapshots || [];
  },

  // Get the latest snapshot
  getLatest: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/latest`);
    return data.snapshot;
  },

  // Get a specific snapshot version
  getVersion: async (connectionId, version) => {
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/${version}`);
    return data.snapshot;
  },

  // Compare two snapshot versions and get the diff
  diff: async (connectionId, fromVersion, toVersion) => {
    const params = new URLSearchParams();
    if (fromVersion) params.set('fromVersion', fromVersion);
    if (toVersion) params.set('toVersion', toVersion);
    const { data } = await api.get(`/api/connections/${connectionId}/snapshots/diff?${params}`);
    return { diff: data.diff, rulesResult: data.rulesResult };
  },

  // Set a snapshot as the baseline (production reference)
  setBaseline: async (connectionId, snapshotId) => {
    const { data } = await api.post(`/api/connections/${connectionId}/snapshots/${snapshotId}/baseline`);
    return data;
  },

  // Analyze blast radius for a table or column
  analyzeBlastRadius: async (connectionId, schema, table, column) => {
    const { data } = await api.post(`/api/connections/${connectionId}/blast-radius`, {
      schema,
      table,
      column,
    });
    return data.blastRadius;
  },

  // Check for schema drift from baseline
  checkDrift: async (connectionId) => {
    const { data } = await api.get(`/api/connections/${connectionId}/schema-drift`);
    return { diff: data.diff, rulesResult: data.rulesResult };
  },

  // Get all governance rules
  getRules: async () => {
    const { data } = await api.get('/api/rules');
    return data.rules || [];
  },
};

export default api;
