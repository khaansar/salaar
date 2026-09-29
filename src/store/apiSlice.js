import { createApi } from '@reduxjs/toolkit/query/react';
import apiClient from '../lib/apiClient';

/**
 * A custom baseQuery that wraps your existing Axios instance (apiClient).
 * This ensures RTK Query uses your interceptors, base URLs, and error handling.
 */
const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers,
      });
      // apiClient interceptor already unwraps response.data.data
      return { data: result };
    } catch (error) {
      // apiClient interceptor normalizes error to { message, status, errors }
      return {
        error: error,
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  // Define global tag types for caching invalidation
  tagTypes: ['Attempt', 'Auth', 'Question', 'Series', 'Category'],
  // Endpoints are injected in separate files for code splitting
  endpoints: (builder) => ({}),
});
