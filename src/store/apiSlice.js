import { createApi } from '@reduxjs/toolkit/query/react';
import apiClient from '../lib/apiClient';

/**
 * RTK Query baseQuery using the existing Axios client.
 *
 * apiClient already:
 * - applies the API base URL
 * - handles authentication
 * - unwraps response.data.data
 * - normalizes API errors
 */
const axiosBaseQuery =
  () =>
  async ({
    url,
    method = 'GET',
    data,
    params,
    headers,
  }) => {
    try {
      const result = await apiClient({
        url,
        method,
        data,
        params,
        headers,
      });

      return {
        data: result,
      };
    } catch (error) {
      return {
        error,
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: axiosBaseQuery(),

  tagTypes: [
    'Attempt',
    'Auth',
    'Question',
    'Series',
    'Category',
    'UserCalendar',
    'AuditLog',
    'UserProfile',
    'UserStreak',
    'AttemptHistory',
  ],

  endpoints: (builder) => ({}),
});