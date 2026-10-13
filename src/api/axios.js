import axios from 'axios';

/**
 * Central Axios Client for communicating with the Spring Boot backend.
 *
 * Configuration:
 *   - Configurable baseURL via VITE_API_BASE_URL environment variable.
 *   - Automatically attaches JWT Bearer token on all outgoing requests.
 *   - Intercepts 401 Unauthorized responses (expired / invalid token) to clear session.
 */

// Read API base URL from Vite environment variables (defaults to /api proxy forwarded to backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 8 second timeout
});

// ── Request Interceptor: Attach JWT Bearer Token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor: Global Error & Session Handling ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for 401 Unauthorized (Expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Clear expired credentials from storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Dispatch global event for AuthContext to pick up without forced full-page reload
      window.dispatchEvent(new CustomEvent('auth:session-expired'));

      // Redirect to login page if user is not already on login or register
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
