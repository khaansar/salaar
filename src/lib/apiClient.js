import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000,
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
  '/auth-api/verify-email',
  '/auth-api/resend-verification',
]);

const shouldSkipRefresh = (config) => {
  if (!config?.url) {
    return false;
  }

  return Array.from(NO_REFRESH_PATHS).some((path) =>
    config.url.includes(path)
  );
};

const isCredentialSubmission = (config) =>
  ['/auth-api/login', '/auth-api/register', '/auth-api/verify-email'].some((path) =>
    config?.url?.includes(path)
  );

const notifySessionExpired = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dispatchEvent(new CustomEvent('auth:session-expired'));

  // Do not redirect while the user is already using an authentication page.
  // Login/register 401s are handled by their forms so their error messages
  // remain visible instead of triggering a needless navigation.
  const { pathname, search } = window.location;
  if (pathname === '/login' || pathname === '/signup') {
    return false;
  }

  const next = `${pathname}${search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
  return true;
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth-api/refresh')
      .then(() => true)
      .catch((error) => {
        const normalizedError = normalizeErrorObject(error);
        normalizedError.isAuthRedirect = notifySessionExpired();
        throw normalizedError;
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

    if (error?.response?.status !== 401 || !originalRequest) {
      return normalizeError(error);
    }

    if (shouldSkipRefresh(originalRequest)) {
      if (!isCredentialSubmission(originalRequest)) {
        if (notifySessionExpired()) {
          // Navigation is in progress. Keep the request pending so feature
          // components cannot render a transient 401 error state first.
          return new Promise(() => {});
        }
      }
      return normalizeError(error);
    }

    // A retry that is still unauthorized means the refreshed session cannot
    // access the resource. Clear the local session and require login again.
    if (originalRequest._retry) {
      if (notifySessionExpired()) {
        return new Promise(() => {});
      }
      return normalizeError(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (refreshError?.isAuthRedirect) {
        return new Promise(() => {});
      }
      return Promise.reject(refreshError);
    }
  }
);


export const apiClientRaw = axios.create({
  baseURL,
  timeout: 15000,
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