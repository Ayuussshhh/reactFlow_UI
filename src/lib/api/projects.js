/**
 * Projects API endpoints
 */
import api from './axiosInstance';

export const projectsAPI = {
  list: async () => {
    try {
      const { data } = await api.get('/api/projects');
      return (data && data.data) || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  get: async (id) => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data.data;
  },

  create: async (projectData) => {
    const { data } = await api.post('/api/projects', projectData);
    return data.data || data;
  },

  update: async (id, updates) => {
    const { data } = await api.put(`/api/projects/${id}`, updates);
    return data.data || data;
  },

  delete: async (id) => {
    await api.delete(`/api/projects/${id}`);
  },

  /* Connection Management */
  saveConnection: async (projectId, connectionData) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!connectionData.connection_string) {
      throw new Error('Connection string is required');
    }
    
    const payload = {
      name: (connectionData.name || 'Default Connection').trim(),
      connection_string: connectionData.connection_string.trim(),
      connection_type: connectionData.connection_type || 'postgresql',
      environment: connectionData.environment || 'development',
    };
    
    const { data } = await api.post(
      `/api/projects/${projectId}/connections`,
      payload
    );
    
    if (!data) {
      throw new Error('Invalid response from server');
    }
    
    return data.data || data;
  },

  getConnections: async (projectId) => {
    const { data } = await api.get(`/api/projects/${projectId}/connections`);
    return (data && data.data) || [];
  },

  deleteConnection: async (projectId, connectionId) => {
    await api.delete(`/api/projects/${projectId}/connections/${connectionId}`);
  },

  activateConnection: async (projectId, connectionId) => {
    const { data } = await api.post(
      `/api/projects/${projectId}/connections/${connectionId}/activate`
    );
    return data.data || data;
  },
};
