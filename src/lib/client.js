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
          
          setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
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
    return data.data;
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    return data.data;
  },

  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data.data;
  },

  refresh: async (refreshToken) => {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data.data;
  },

  listUsers: async () => {
    const { data } = await api.get('/api/auth/users');
    return data.data;
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

export default api;
