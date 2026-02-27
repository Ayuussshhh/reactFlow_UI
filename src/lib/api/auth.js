/**
 * Authentication API
 * 
 * Backend routes:
 * - POST /api/auth/login -> { success, user, tokens }
 * - POST /api/auth/register -> { success, user, tokens }
 * - POST /api/auth/refresh -> { success, tokens }
 * - GET /api/auth/me -> { success, user }
 * - GET /api/users -> { success, data: users[] }
 * - PUT /api/auth/role/{user_id} -> { success, data }
 */
import api from './axiosInstance';

export const authAPI = {
  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return {
      success: data.success,
      user: data.user,
      tokens: data.tokens,
    };
  },

  /**
   * Register new user (name is required by backend)
   */
  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { 
      email, 
      password, 
      name: name || email.split('@')[0],
    });
    return {
      success: data.success,
      user: data.user,
      tokens: data.tokens,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (refreshToken) => {
    const { data } = await api.post('/api/auth/refresh', { 
      refresh_token: refreshToken,
    });
    return {
      success: data.success,
      tokens: data.tokens,
    };
  },

  /**
   * Get current authenticated user
   */
  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return {
      success: data.success,
      user: data.user,
    };
  },

  /**
   * List all users (admin)
   */
  listUsers: async () => {
    const { data } = await api.get('/api/users');
    return data.data || [];
  },

  /**
   * Update user role (admin)
   */
  updateRole: async (userId, role) => {
    const { data } = await api.put(`/api/auth/role/${userId}`, { role });
    return data.data;
  },
};
