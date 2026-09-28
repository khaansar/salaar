import apiClient from '../lib/apiClient';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export const attemptService = {
  async getAttemptState(attemptId) {
    if (USE_MOCKS) {
      return require('../features/attempt/mock/mockAttempt').MOCK_ATTEMPT_DATA;
    }
    // 1. Fetch Attempt State from attempt-service
    const attemptRes = await apiClient.get(`/attempts-api/${attemptId}`);
    
    // 2. Fetch Test Structure from test-service
    const testId = attemptRes.testId;
    const structureRes = await apiClient.get(`/catalog/mock-tests/${testId}/structure`);
    const structure = structureRes.data?.data || structureRes.data || structureRes;

    // 3. Transform into the shape expected by attemptSlice
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
           // Handle map of options to array if needed
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

    // Populate responses from backend answers map
    if (attemptRes.answers) {
      Object.entries(attemptRes.answers).forEach(([qId, ans]) => {
        const type = questions[qId]?.type;
        const resObj = { visited: true, marked: false, saveState: 'synced' };
        if (type === 'NAT') {
          resObj.numeric = ans;
        } else if (type === 'MSQ') {
          resObj.selected = ans.split(','); // Assuming comma-separated
        } else {
          resObj.selected = [ans];
        }
        responses[qId] = resObj;
      });
    }

    return {
      attempt: {
        id: attemptRes.attemptId,
        testId: attemptRes.testId,
        title: structure.title,
        type: 'Mock Test',
        status: attemptRes.status,
        remainingSeconds: structure.durationMinutes * 60, // Fallback until SSE connects
      },
      sections,
      questions,
      responses
    };
  },

  async saveResponses(attemptId, updates) {
    if (USE_MOCKS) {
      return { success: true };
    }
    return await apiClient.patch(`/attempts-api/${attemptId}`, { updates });
  },

  async submitAttempt(attemptId) {
    if (USE_MOCKS) {
      return { success: true };
    }
    return await apiClient.post(`/attempts-api/${attemptId}/submit`);
  },

  async startAttempt(testId, durationMinutes) {
    return await apiClient.post(`/attempts-api/`, { testId, durationMinutes });
  },
  
  getStreamUrl(attemptId) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/attempts-api/${attemptId}/stream`;
  }
};
