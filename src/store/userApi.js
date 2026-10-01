import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarAnalytics: builder.query({
      query: ({ year, month }) => ({
        url: '/auth-api/users/calendar',
        method: 'GET',
        params: {
          year,
          month,
        },
      }),
      providesTags: ['UserCalendar'],
    }),

    getYearlyStreak: builder.query({
      query: () => ({
        url: '/attempts-api/streak/yearly',
        method: 'GET',
      }),
      providesTags: ['UserStreak'],
    }),

    getAttemptHistory: builder.query({
      query: ({
        page = 1,
        perPage = 100,
      } = {}) => ({
        url: '/attempts-api/history',
        method: 'GET',
        params: {
          page,
          perPage,
        },
      }),
      providesTags: ['AttemptHistory'],
    }),

    getUserPerformance: builder.query({
      query: () => ({
        url: 'analytics-api/reports/performance',
        method: 'GET',
      }),
      providesTags: ['UserPerformance'],
    }),
  }),
});

export const {
  useGetCalendarAnalyticsQuery,
  useLazyGetCalendarAnalyticsQuery,
  useGetYearlyStreakQuery,
  useLazyGetYearlyStreakQuery,
  useGetAttemptHistoryQuery,
  useLazyGetAttemptHistoryQuery,
  useGetUserPerformanceQuery,
} = userApi;