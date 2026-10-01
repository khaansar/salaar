import { apiSlice } from './apiSlice';

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttemptReport: builder.query({
      query: (attemptId) => ({
        url: `analytics-api/reports/${attemptId}`,
        method: 'GET',
      }),
      providesTags: (result, error, attemptId) => [
        {
          type: 'AttemptReport',
          id: attemptId,
        },
      ],
    }),
  }),
});

export const {
  useGetAttemptReportQuery,
} = reportApi;