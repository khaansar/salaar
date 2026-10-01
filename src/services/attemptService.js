import apiClient, { apiClientRaw } from '../lib/apiClient';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

export const attemptService = {
  async getAttemptState(attemptId) {
    if (USE_MOCKS) {
      const {
        MOCK_ATTEMPT_DATA,
      } = await import(
        '../features/attempt/mock/mockAttempt'
      );

      return MOCK_ATTEMPT_DATA;
    }

    const rawRes = await apiClientRaw.get(
      `/attempts-api/${attemptId}`
    );

    if (!rawRes || !rawRes.data) {
      throw new Error(
        'Attempt response was empty'
      );
    }

    const attemptRes = rawRes.data;
    attemptRes.attemptVersion = rawRes.meta?.attemptVersion;

    const testId = attemptRes.testId;

    if (!testId) {
      throw new Error(
        'Attempt response is missing testId'
      );
    }

    const structureRes = await apiClient.get(
      `/tests-api/catalog/mock-tests/${testId}/structure`
    );

    if (!structureRes) {
      throw new Error(
        'Test structure response was empty'
      );
    }

    const sections = [];
    const questions = {};
    const responses = {};

    structureRes.sections?.forEach((section) => {
      const questionIds = [];

      section.questions?.forEach((question) => {
        const questionId = question.questionId;

        if (!questionId) {
          return;
        }

        questionIds.push(questionId);

        let options = [];

        if (
          question.optionsJson &&
          typeof question.optionsJson === 'object'
        ) {
          options = Object.entries(
            question.optionsJson
          ).map(([key, value]) => ({
            id: key,
            text: value,
          }));
        }

        questions[questionId] = {
          id: questionId,
          type: question.questionType,
          text: question.questionText,
          options,
          marks: question.positiveMarks,
          negativeMarks: question.negativeMarks,
        };
      });

      sections.push({
        id: section.sectionId,
        name: section.title,
        questionIds,
      });
    });

    /*
     * Restore persisted answers.
     */
    if (
      attemptRes.answers &&
      typeof attemptRes.answers === 'object'
    ) {
      Object.entries(attemptRes.answers).forEach(
        ([questionId, answer]) => {
          const type =
            questions[questionId]?.type;

          const response = {
            visited: true,
            marked: false,
            saveState: 'synced',
          };

          if (type === 'NAT') {
            response.numeric = answer;
          } else if (type === 'MSQ') {
            response.selected =
              typeof answer === 'string' && answer.length > 0
                ? answer
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)
                : Array.isArray(answer) && answer.length > 0
                  ? answer
                  : undefined;
          } else {
            response.selected =
              answer == null || answer === ''
                ? undefined
                : [answer];
          }

          responses[questionId] = response;
        }
      );
    }

    return {
      attempt: {
        id: attemptRes.attemptId || attemptId,
        testId,
        title: structureRes.title,
        type: 'Mock Test',
        status: attemptRes.status,
        expiresAt: attemptRes.expiresAt,
        attemptVersion: attemptRes.attemptVersion,
        currentQuestionIndex: attemptRes.currentQuestionIndex,
      },

      sections,
      questions,
      responses,
    };
  },

  async saveResponses(attemptId, payload) {
    if (USE_MOCKS) {
      return { success: true };
    }
    const rawRes = await apiClientRaw.patch(`/attempts-api/${attemptId}`, payload);
    return {
      ...rawRes.data,
      attemptVersion: rawRes.meta?.attemptVersion
    };
  },

  async submitAttempt(attemptId) {
    if (USE_MOCKS) {
      return {
        success: true,
      };
    }

    return apiClient.post(
      `/attempts-api/${attemptId}/submit`
    );
  },

  async startAttempt(
    testId,
    durationMinutes
  ) {
    return apiClient.post(
      '/attempts-api/',
      {
        testId,
        durationMinutes,
      }
    );
  },

  getStreamUrl(attemptId) {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8080';

    return `${base}/attempts-api/${attemptId}/stream`;
  },
};
