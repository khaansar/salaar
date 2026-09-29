import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const normalizeErrorObject = (error) => {
  const status = error?.response?.status || 500;

  const message =
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected network error occurred';

  const errors = error?.response?.data?.errors || [];

  return {
    message,
    status,
    errors,
  };
};

const normalizeError = (error) => {
  return Promise.reject(normalizeErrorObject(error));
};

let refreshPromise = null;

const NO_REFRESH_PATHS = new Set([
  '/auth-api/login',
  '/auth-api/register',
  '/auth-api/refresh',
  '/auth-api/logout',
]);

const shouldSkipRefresh = (config) => {
  if (!config?.url) {
    return false;
  }

  return Array.from(NO_REFRESH_PATHS).some((path) =>
    config.url.includes(path)
  );
};

const notifySessionExpired = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth-api/refresh')
      .then(() => true)
      .catch((error) => {
        notifySessionExpired();
        throw normalizeErrorObject(error);
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) =>
    response.data?.data !== undefined ? response.data.data : response.data,

  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest)
    ) {
      return normalizeError(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
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
