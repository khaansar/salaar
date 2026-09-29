import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSeriesList: builder.query({
      query: (params) => ({
        url: '/tests-api/admin/series',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Series', id })),
              { type: 'Series', id: 'LIST' },
            ]
          : [{ type: 'Series', id: 'LIST' }],
    }),
    deleteSeries: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/series/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Series', id: 'LIST' }],
    }),
    
    getQuestionsList: builder.query({
      query: (params) => ({
        url: '/tests-api/admin/questions',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Question', id })),
              { type: 'Question', id: 'LIST' },
            ]
          : [{ type: 'Question', id: 'LIST' }],
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Question', id: 'LIST' }],
    }),

    getCategoriesList: builder.query({
      query: (params) => ({
        url: '/tests-api/admin/categories',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/tests-api/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSeriesListQuery,
  useDeleteSeriesMutation,
  useGetQuestionsListQuery,
  useDeleteQuestionMutation,
  useGetCategoriesListQuery,
  useDeleteCategoryMutation,
} = adminApi;
