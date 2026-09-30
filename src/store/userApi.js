import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarAnalytics: builder.query({
      query: ({ year, month }) => ({
        url: `/auth-api/users/calendar`,
        method: 'GET',
        params: { year, month },
      }),
      providesTags: ['UserCalendar'], // Can add more specific tags if needed
    }),
  }),
});

export const { useGetCalendarAnalyticsQuery, useLazyGetCalendarAnalyticsQuery } = userApi;
