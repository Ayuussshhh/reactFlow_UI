/**
 * Axios instance with interceptors for auth and error handling
 */
import axios from 'axios';
import { useAuthStore } from '../../store/store';

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

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    // Validate response has expected structure
    if (!response.data) {
      console.warn('[API] Empty response data:', response);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setAuth, logout } = useAuthStore.getState();
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          if (data?.tokens) {
            // Auth endpoints return { success, user, tokens } directly
            setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        useAuthStore.getState().logout();
      }
    }

    // Format error response
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || error.message || 'Network error';

    console.error('[API Error]', {
      status: error.response?.status,
      message: errorMessage,
      url: originalRequest?.url,
      method: originalRequest?.method,
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: errorData,
      originalError: error,
    });
  }
);

export default api;
