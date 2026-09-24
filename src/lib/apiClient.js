import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => {
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'An unexpected network error occurred';
    return Promise.reject({ message, status });
  }
);

export default apiClient;