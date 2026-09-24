import axios from 'axios';
import { getCookie } from 'cookies-next';

// Use the single environment variable as requested
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

// Response Interceptor: Standardize API error messages according to API CONTRACT
apiClient.interceptors.response.use(
  (response) => {
    // The API envelope has `{ success, status, message, data, meta }`.
    // We return `response.data.data` per instructions.
    return response.data.data;
  },
  (error) => {
    // Return a normalized { message, status } object
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected network error occurred';
    
    return Promise.reject({ message, status });
  }
);

export default apiClient;