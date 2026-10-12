import { apiSlice } from './apiSlice';

export const leaderboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTestLeaderboard: builder.query({
      query: ({ slug, page = 1, pageSize = 25 }) => ({
        url: `/analytics-api/reports/leaderboard/tests/${encodeURIComponent(slug)}`,
        method: 'GET',
        params: { page, pageSize },
      }),
      providesTags: (result, error, { slug }) => [{ type: 'TestLeaderboard', id: slug }],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetTestLeaderboardQuery } = leaderboardApi;
