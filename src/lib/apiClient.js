import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const normalizeError = (error) => {
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || error.message || 'An unexpected network error occurred';
  const errors = error.response?.data?.errors || [];
  return Promise.reject({ message, status, errors });
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  normalizeError
);

export const apiClientRaw = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClientRaw.interceptors.response.use(
  (response) => response.data,
  normalizeError
);

export default apiClient;