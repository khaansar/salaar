import axios from 'axios';
import { getCookie } from 'cookies-next';

// In Next.js SSR, use internal URL; on browser, use public URL
const baseURL = typeof window === 'undefined'
  ? process.env.INTERNAL_API_GATEWAY_URL || 'http://localhost:8080/api'
  : process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends cookies across requests if using cookie-based auth
  timeout: 10000,
});

// Request Interceptor: Attach JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    // If running in browser, read auth token from cookie
    if (typeof window !== 'undefined') {
      const token = getCookie('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = error.response?.data || {
      message: error.message || 'An unexpected network error occurred',
    };
    return Promise.reject(errorResponse);
  }
);

export default apiClient;