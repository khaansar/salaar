import { apiSlice } from '../../../store/apiSlice';
import apiClient from '../../../lib/apiClient';
import { attemptService } from '../../../services/attemptService';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export const attemptApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttemptState: builder.query({
      queryFn: async (attemptId) => {
        try {
          const data = await attemptService.getAttemptState(attemptId);
          return { data };
        } catch (error) {
          return { error: { status: error?.status, message: error.message || 'Failed to fetch attempt data' } };
        }
      },
      providesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),

    saveResponses: builder.mutation({
      queryFn: async ({ attemptId, ...payload }) => {
        try {
          const res = await attemptService.saveResponses(attemptId, payload);
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
    }),

    submitAttempt: builder.mutation({
      queryFn: async (attemptId) => {
        try {
          const res = await attemptService.submitAttempt(attemptId);
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),

    switchSection: builder.mutation({
      queryFn: async ({ attemptId, sectionId }) => {
        try {
          const res = await attemptService.switchSection(attemptId, sectionId);
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAttemptStateQuery,
  useSaveResponsesMutation,
  useSubmitAttemptMutation,
  useSwitchSectionMutation,
} = attemptApi;
