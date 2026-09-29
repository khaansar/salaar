import { apiSlice } from '../../../store/apiSlice';
import apiClient from '../../../lib/apiClient';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export const attemptApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET request: Fetches attempt details AND structure, exactly like attemptService
    getAttemptState: builder.query({
      queryFn: async (attemptId, _queryApi, _extraOptions, baseQuery) => {
        if (USE_MOCKS) {
          const mockData = await import('../mock/mockAttempt');
          return { data: mockData.MOCK_ATTEMPT_DATA };
        }

        try {
          // 1. Fetch Attempt State
          const attemptRes = await apiClient.get(`/attempts-api/${attemptId}`);
          
          // 2. Fetch Test Structure
          const testId = attemptRes.testId;
          const structureRes = await apiClient.get(`/catalog/mock-tests/${testId}/structure`);
          const structure = structureRes.data?.data || structureRes.data || structureRes;

          // 3. Transform data (same logic as attemptService)
          const sections = [];
          const questions = {};
          const responses = {};

          structure.sections?.forEach(sec => {
            const qIds = [];
            sec.questions?.forEach(q => {
              const id = q.questionId;
              qIds.push(id);
              
              let options = [];
              if (q.optionsJson && typeof q.optionsJson === 'object') {
                 options = Object.entries(q.optionsJson).map(([key, val]) => ({
                   id: key,
                   text: val
                 }));
              }

              questions[id] = {
                id: id,
                type: q.questionType,
                text: q.questionText,
                options: options,
                marks: q.positiveMarks,
                negativeMarks: q.negativeMarks,
              };
            });
            sections.push({
              id: sec.sectionId,
              name: sec.title,
              questionIds: qIds
            });
          });

          if (attemptRes.answers) {
            Object.entries(attemptRes.answers).forEach(([qId, ans]) => {
              const type = questions[qId]?.type;
              const resObj = { visited: true, marked: false, saveState: 'synced' };
              if (type === 'NAT') {
                resObj.numeric = ans;
              } else if (type === 'MSQ') {
                resObj.selected = ans.split(','); 
              } else {
                resObj.selected = [ans];
              }
              responses[qId] = resObj;
            });
          }

          const transformedData = {
            attempt: {
              id: attemptRes.attemptId,
              testId: attemptRes.testId,
              title: structure.title,
              type: 'Mock Test',
              status: attemptRes.status,
              remainingSeconds: structure.durationMinutes * 60,
            },
            sections,
            questions,
            responses
          };

          return { data: transformedData };
        } catch (error) {
          return { error: { message: error.message || 'Failed to fetch attempt data' } };
        }
      },
      providesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),

    saveResponses: builder.mutation({
      queryFn: async ({ attemptId, updates }, _queryApi, _extraOptions, baseQuery) => {
        if (USE_MOCKS) return { data: { success: true } };
        
        try {
          const res = await apiClient.patch(`/attempts-api/${attemptId}`, { updates });
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
      // Note: We intentionally DO NOT invalidate 'Attempt' here because we are handling
      // the autosave state optimistically in Redux (attemptSlice) to avoid screen flickering.
    }),

    submitAttempt: builder.mutation({
      queryFn: async (attemptId, _queryApi, _extraOptions, baseQuery) => {
        if (USE_MOCKS) return { data: { success: true } };
        
        try {
          const res = await apiClient.post(`/attempts-api/${attemptId}/submit`);
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttemptStateQuery,
  useSaveResponsesMutation,
  useSubmitAttemptMutation,
} = attemptApi;
