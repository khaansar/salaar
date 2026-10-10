import { createApi } from '@reduxjs/toolkit/query/react';
import apiClient from '../lib/apiClient';

/**
 * RTK Query baseQuery using the existing Axios client.
 *
 * apiClient already applies the configured API base URL, attaches the
 * existing authentication/session credentials, unwraps response.data.data,
 * and normalizes API errors. Do not add another response-unwrapping layer
 * inside individual endpoint definitions.
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
    'UserPerformance',
    'AttemptReport',
    'UserTopicPerformance',
    'PaymentProduct',
    'Payment',
    'Orders',
    'Entitlements',

    // Admin payment-management cache tags.
    'AdminPayment',
    'AdminOrder',
    'AdminOrderTimeline',
    'AdminRefund',
    'AdminRefundableAmount',
  ],

  endpoints: () => ({}),
});