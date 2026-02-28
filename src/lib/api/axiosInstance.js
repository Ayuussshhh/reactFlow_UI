/**
 * Axios instance with auth interceptors
 * 
 * Features:
 * - Automatic JWT token injection
 * - Token refresh on 401
 * - Consistent error handling
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
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setAuth, logout } = useAuthStore.getState();
        
        if (refreshToken) {
          // Backend expects: { refresh_token: "..." }
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (data?.tokens) {
            // Update auth store with new tokens
            const currentUser = useAuthStore.getState().user;
            setAuth(currentUser, data.tokens.accessToken, data.tokens.refreshToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
            return api(originalRequest);
          }
        }
        
        // No refresh token or refresh failed
        logout();
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        useAuthStore.getState().logout();
      }
    }

    // Format error for consistent handling
    const errorData = error.response?.data;
    const errorMessage = 
      errorData?.message || 
      errorData?.error || 
      error.message || 
      'Network error';

    console.error('[API Error]', {
      status: error.response?.status,
      message: errorMessage,
      url: originalRequest?.url,
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: errorData,
    });
  }
);

export default api;
