import { apiSlice } from './apiSlice';

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedMockTests: builder.query({
      query: ({ categoryId, query, page = 1, limit = 8 }) => ({
        url: '/tests-api/public/mock-tests',
        method: 'GET',
        params: {
          categoryId,
          query,
          page,
          limit,
        },
      }),
      providesTags: ['CatalogMockTests'],
    }),
    getCategories: builder.query({
      query: () => ({
        url: '/tests-api/public/categories',
        method: 'GET',
      }),
      providesTags: ['CatalogCategories'],
    }),
  }),
});

export const { useGetPublishedMockTestsQuery, useGetCategoriesQuery } = catalogApi;
