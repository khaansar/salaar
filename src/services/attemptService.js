import apiClient from '../lib/apiClient';

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

    const attemptRes = await apiClient.get(
      `/attempts-api/${attemptId}`
    );

    if (!attemptRes) {
      throw new Error(
        'Attempt response was empty'
      );
    }

    const testId = attemptRes.testId;

    if (!testId) {
      throw new Error(
        'Attempt response is missing testId'
      );
    }

    const structureRes = await apiClient.get(
      `/catalog/mock-tests/${testId}/structure`
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
              typeof answer === 'string'
                ? answer
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)
                : Array.isArray(answer)
                  ? answer
                  : [];
          } else {
            response.selected =
              answer == null
                ? []
                : [answer];
          }

          responses[questionId] = response;
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Prefer a backend-provided remainingSeconds if it
     * exists. Do NOT overwrite it with the full duration.
     *
     * Until Baahubali exposes a server-authoritative
     * remainingSeconds/expiresAt value, the duration fallback
     * remains only a temporary compatibility fallback.
     */
    const remainingSeconds =
      Number.isFinite(
        Number(attemptRes.remainingSeconds)
      )
        ? Number(attemptRes.remainingSeconds)
        : structureRes.durationMinutes * 60;

    return {
      attempt: {
        id:
          attemptRes.attemptId ||
          attemptId,

        testId,

        title: structureRes.title,

        type: 'Mock Test',

        status: attemptRes.status,

        remainingSeconds,
      },

      sections,
      questions,
      responses,
    };
  },

  async saveResponses(
    attemptId,
    updates
  ) {
    if (USE_MOCKS) {
      return {
        success: true,
      };
    }

    return apiClient.patch(
      `/attempts-api/${attemptId}`,
      {
        updates,
      }
    );
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