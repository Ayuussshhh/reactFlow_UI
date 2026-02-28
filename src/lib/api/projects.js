/**
 * Projects API
 * 
 * Backend routes:
 * - POST /api/projects -> { success, message, data: Project }
 * - GET /api/projects -> { success, message, data: Project[] }
 * - GET /api/projects/{id} -> { success, message, data: Project }
 * - PUT /api/projects/{id} -> { success, message, data: Project }
 * - DELETE /api/projects/{id} -> { message }
 * - POST /api/projects/{project_id}/connections -> { success, message, data: SavedConnection }
 * - GET /api/projects/{project_id}/connections -> { success, message, data: ConnectionResponse[] }
 * - DELETE /api/projects/{project_id}/connections/{connection_id} -> { message }
 * - POST /api/projects/{project_id}/connections/{connection_id}/activate -> { success, message, data }
 */
import api from './axiosInstance';

export const projectsAPI = {
  /**
   * List all projects for current user
   */
  list: async () => {
    try {
      const { data } = await api.get('/api/projects');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  /**
   * Get a specific project by ID
   */
  get: async (id) => {
    const { data } = await api.get(`/api/projects/${id}`);
    return data.data;
  },

  /**
   * Create a new project
   */
  create: async (projectData) => {
    const { data } = await api.post('/api/projects', {
      name: projectData.name,
      description: projectData.description || null,
      icon: projectData.icon || null,
      color: projectData.color || null,
    });
    return data.data || data;
  },

  /**
   * Update a project
   */
  update: async (id, updates) => {
    const { data } = await api.put(`/api/projects/${id}`, updates);
    return data.data || data;
  },

  /**
   * Delete a project
   */
  delete: async (id) => {
    await api.delete(`/api/projects/${id}`);
  },

  /**
   * Save a database connection to a project
   * Backend expects: { name, connectionString, connectionType, environment }
   */
  saveConnection: async (projectId, connectionData) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    if (!connectionData.connection_string && !connectionData.connectionString) {
      throw new Error('Connection string is required');
    }
    
    // Backend uses camelCase
    const payload = {
      name: (connectionData.name || 'Default Connection').trim(),
      connectionString: (connectionData.connection_string || connectionData.connectionString).trim(),
      connectionType: connectionData.connection_type || connectionData.connectionType || 'postgresql',
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

  /**
   * Get all connections for a project
   */
  getConnections: async (projectId) => {
    const { data } = await api.get(`/api/projects/${projectId}/connections`);
    return data.data || [];
  },

  /**
   * Delete a connection from a project
   */
  deleteConnection: async (projectId, connectionId) => {
    await api.delete(`/api/projects/${projectId}/connections/${connectionId}`);
  },

  /**
   * Activate a connection for a project
   */
  activateConnection: async (projectId, connectionId) => {
    const { data } = await api.post(
      `/api/projects/${projectId}/connections/${connectionId}/activate`
    );
    return data.data || data;
  },
};
