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
  const responseBody = error?.response?.data;

  const message =
    responseBody?.message ||
    responseBody?.error?.message ||
    error?.message ||
    'An unexpected network error occurred';

  // APIs using the standard envelope expose structured error information as
  // `error: { code, details }`, while older endpoints still use `errors`.
  const errors = responseBody?.errors || responseBody?.error?.details || [];

  return {
    message,
    status,
    errors,
    code: responseBody?.error?.code,
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
  '/auth-api/forgot-password',
  '/auth-api/reset-password',
  '/auth-api/reset-password/validate',
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
  ['/auth-api/login', '/auth-api/register', '/auth-api/verify-email'].some(
    (path) => config?.url?.includes(path)
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

// Only an explicit rejection of the refresh token means the session is over.
// Network errors, timeouts and gateway/server errors are transient: the caller
// (for example exam autosave) retries later, and the session stays intact.
const isSessionRejected = (error) =>
  [401, 403].includes(error?.response?.status);

// Refresh tokens rotate on every use, and every tab shares the same cookies.
// Tabs therefore take turns through a Web Lock, and a tab skips its own
// refresh when another tab already refreshed after its request was sent.
const REFRESH_LOCK_NAME = 'salaar:auth-refresh';
const LAST_REFRESH_KEY = 'salaar:auth-last-refresh-at';

const readLastRefreshAt = () => {
  try {
    return Number(window.localStorage.getItem(LAST_REFRESH_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeLastRefreshAt = (timestamp) => {
  try {
    window.localStorage.setItem(LAST_REFRESH_KEY, String(timestamp));
  } catch {
    // Without storage, tabs still serialize through the lock.
  }
};

const refreshUnlessDoneElsewhere = async (requestStartedAt) => {
  if (requestStartedAt && readLastRefreshAt() > requestStartedAt) {
    return;
  }

  await refreshClient.post('/auth-api/refresh');
  writeLastRefreshAt(Date.now());
};

const runWithRefreshLock = (task) => {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) {
    return navigator.locks.request(REFRESH_LOCK_NAME, task);
  }

  return task();
};

export const refreshSession = async (requestStartedAt) => {
  if (!refreshPromise) {
    refreshPromise = runWithRefreshLock(() =>
      refreshUnlessDoneElsewhere(requestStartedAt)
    )
      .then(() => true)
      .catch((error) => {
        const normalizedError = normalizeErrorObject(error);
        normalizedError.isAuthRedirect = isSessionRejected(error)
          ? notifySessionExpired()
          : false;
        throw normalizedError;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Refreshes the session once on a 401 and replays the request through the
// same client, so its success interceptor shapes the retried response too.
const createAuthErrorHandler = (client) => async (error) => {
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
    await refreshSession(originalRequest.requestStartedAt);
    return client(originalRequest);
  } catch (refreshError) {
    if (refreshError?.isAuthRedirect) {
      return new Promise(() => {});
    }

    return Promise.reject(refreshError);
  }
};

// Records when a request was sent so the refresh step can tell whether
// another tab has refreshed the session since then.
const stampRequestStart = (config) => {
  config.requestStartedAt = Date.now();
  return config;
};

apiClient.interceptors.request.use(stampRequestStart);

apiClient.interceptors.response.use(
  (response) => {
    if (response.config?.preserveResponseEnvelope) {
      return response.data;
    }

    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  createAuthErrorHandler(apiClient)
);

export const apiClientRaw = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClientRaw.interceptors.request.use(stampRequestStart);

apiClientRaw.interceptors.response.use(
  (response) => response.data,
  createAuthErrorHandler(apiClientRaw)
);

export default apiClient;
