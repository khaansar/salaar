import apiClient, { apiClientRaw } from '../lib/apiClient';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_ATTEMPT_MOCKS === 'true';

function parseOptions(optionsJson) {
  if (!optionsJson) {
    return [];
  }

  let parsed = optionsJson;

  if (typeof optionsJson === 'string') {
    try {
      parsed = JSON.parse(optionsJson);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((option, index) => ({
      id: String(option.id ?? index),
      text: String(option.text ?? ''),
    }));
  }

  if (parsed && typeof parsed === 'object') {
    return Object.entries(parsed).map(([id, value]) => ({
      id,
      text: typeof value === 'string'
        ? value
        : String(value ?? ''),
    }));
  }

  return [];
}

function normalizeImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .filter(
      (image) =>
        image &&
        typeof image.url === 'string' &&
        image.url.trim()
    )
    .map((image, index) => ({
      url: image.url,
      publicId: image.publicId ?? image.public_id ?? null,
      altText: image.altText ?? image.alt_text ?? '',
      caption: image.caption ?? '',
      sequence: Number.isInteger(image.sequence)
        ? image.sequence
        : index,
    }))
    .sort((a, b) => a.sequence - b.sequence);
}

function normalizeOptionImages(optionImages) {
  if (
    !optionImages ||
    typeof optionImages !== 'object' ||
    Array.isArray(optionImages)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(optionImages).map(([optionId, images]) => [
      optionId,
      normalizeImages(images),
    ])
  );
}

export const attemptService = {
  async getAttemptState(attemptId) {
    if (USE_MOCKS) {
      const { MOCK_ATTEMPT_DATA } = await import(
        '../features/attempt/mock/mockAttempt'
      );

      return MOCK_ATTEMPT_DATA;
    }

    const rawRes = await apiClientRaw.get(
      `/attempts-api/${attemptId}`
    );

    if (!rawRes || !rawRes.data) {
      throw new Error('Attempt response was empty');
    }

    const attemptRes = rawRes.data;
    attemptRes.attemptVersion = rawRes.meta?.attemptVersion;

    const testId = attemptRes.testId;

    if (!testId) {
      throw new Error('Attempt response is missing testId');
    }

    const structureRes = await apiClient.get(
      `/tests-api/catalog/mock-tests/${testId}/structure`
    );

    if (!structureRes) {
      throw new Error('Test structure response was empty');
    }

    const sections = [];
    const questions = {};
    const responses = {};

    const questionOrder = attemptRes.questionOrder;

    structureRes.sections?.forEach((section) => {
      let rawQuestions = section.questions || [];

      if (
        questionOrder &&
        Array.isArray(questionOrder[section.sectionId]) &&
        questionOrder[section.sectionId].length > 0
      ) {
        const order = questionOrder[section.sectionId];
        const qMap = new Map(rawQuestions.map((q) => [q.questionId, q]));
        const ordered = [];
        order.forEach((id) => {
          const q = qMap.get(id);
          if (q) {
            ordered.push(q);
            qMap.delete(id);
          }
        });
        qMap.forEach((q) => ordered.push(q));
        rawQuestions = ordered;
      }

      const questionIds = [];

      rawQuestions.forEach((question) => {
        const questionId = question.questionId;

        if (!questionId) {
          return;
        }

        questionIds.push(questionId);

        questions[questionId] = {
          id: questionId,
          type: question.questionType,
          text: question.questionText,
          options: parseOptions(question.optionsJson),

          // New Baahubali image fields.
          questionImages: normalizeImages(question.questionImages),
          optionImages: normalizeOptionImages(question.optionImages),

          marks: question.positiveMarks,
          negativeMarks: question.negativeMarks,
        };
      });

      sections.push({
        id: section.sectionId,
        name: section.title,
        durationMinutes: section.durationMinutes,
        questionIds,
      });
    });

    // Restore persisted answers without changing existing answer semantics.
    if (
      attemptRes.answers &&
      typeof attemptRes.answers === 'object'
    ) {
      Object.entries(attemptRes.answers).forEach(
        ([questionId, answer]) => {
          const type = questions[questionId]?.type;

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
        currentSectionId: attemptRes.currentSectionId,
        sectionTimeSpentSec: attemptRes.sectionTimeSpentSec || {},
        currentSectionStartedAt: attemptRes.currentSectionStartedAt,
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

    const rawRes = await apiClientRaw.patch(
      `/attempts-api/${attemptId}`,
      payload
    );

    return {
      ...rawRes.data,
      attemptVersion: rawRes.meta?.attemptVersion,
    };
  },

  async submitAttempt(attemptId) {
    if (USE_MOCKS) {
      return { success: true };
    }

    return apiClient.post(
      `/attempts-api/${attemptId}/submit`
    );
  },

  async startAttempt(testId, durationMinutes) {
    return apiClient.post('/attempts-api/', {
      testId,
      durationMinutes,
    });
  },

  async switchSection(
    attemptId,
    sectionId,
    submitCurrent = false
  ) {
    if (USE_MOCKS) {
      return { success: true };
    }

    const rawRes = await apiClientRaw.post(
      `/attempts-api/${attemptId}/sections/${sectionId}/switch?submitCurrent=${submitCurrent}`
    );

    return rawRes.data;
  },

  getStreamUrl(attemptId) {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8080';

    return `${base}/attempts-api/${attemptId}/stream`;
  },
};