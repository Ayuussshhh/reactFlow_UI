/**
 * Auth API endpoints
 */
import api from './axiosInstance';

export const authAPI = {
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return { success: data.success, user: data.user, tokens: data.tokens };
  },

  register: async (email, password, name) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    return { success: data.success, user: data.user, tokens: data.tokens };
  },

  logout: async () => {
    await api.post('/api/auth/logout');
  },

  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },

  refresh: async (refreshToken) => {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data;
  },

  listUsers: async () => {
    const { data } = await api.get('/api/auth/users');
    return data;
  },

  updateRole: async (userId, role) => {
    const { data } = await api.put(`/api/auth/users/${userId}/role`, { role });
    return data.data;
  },
};
