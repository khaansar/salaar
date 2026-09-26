import apiClient, { apiClientRaw } from '@/lib/apiClient';

// All paths are relative to the gateway's `/api` prefix and mirror the
// test-service OpenAPI spec, whose server url is `.../api/tests`. This
// matches the existing convention in `src/services/testService.js`
// (e.g. `/tests/public/series`).
const BASE = '/tests-api';

/**
 * Unwraps the raw ApiResponse envelope from `apiClientRaw` into
 * `{ items, meta }` so list pages can read pagination info that the
 * default (data-stripping) `apiClient` would otherwise discard.
 */
function unwrapList(envelope) {
  return {
    items: envelope?.data ?? [],
    meta: envelope?.meta ?? null,
  };
}

// ---------------------------------------------------------------------------
// Categories — GET/POST/PUT only. The API does not expose a delete endpoint,
// so no `remove()` is provided here (don't invent functionality).
// ---------------------------------------------------------------------------
export const categoriesApi = {
  list: () => apiClient.get(`${BASE}/admin/categories`),
  create: (payload) => apiClient.post(`${BASE}/admin/categories`, payload),
  update: (id, payload) => apiClient.put(`${BASE}/admin/categories/${id}`, payload),
};

// ---------------------------------------------------------------------------
// Test Series
// ---------------------------------------------------------------------------
export const seriesApi = {
  list: async ({ search, status, categoryId, page = 1, limit = 20 } = {}) => {
    const envelope = await apiClientRaw.get(`${BASE}/admin/series`, {
      params: { search: search || undefined, status: status || undefined, categoryId: categoryId || undefined, page, limit },
    });
    return unwrapList(envelope);
  },
  get: (id) => apiClient.get(`${BASE}/admin/series/${id}`),
  create: (payload) => apiClient.post(`${BASE}/admin/series`, payload),
  update: (id, payload) => apiClient.put(`${BASE}/admin/series/${id}`, payload),
  remove: (id) => apiClient.delete(`${BASE}/admin/series/${id}`),
};

// ---------------------------------------------------------------------------
// Mock Tests
// ---------------------------------------------------------------------------
export const mockTestsApi = {
  create: (seriesId, payload) => apiClient.post(`${BASE}/admin/mock-tests/series/${seriesId}/mock-tests`, payload),
  get: (id) => apiClient.get(`${BASE}/admin/mock-tests/${id}`),
  update: (id, payload) => apiClient.put(`${BASE}/admin/mock-tests/${id}`, payload),
  // `getMockTestAnswerKey` returns the full TestBlueprintDto (sections with
  // their questions, translations and correct answers). There is no plain
  // "get sections/questions" endpoint in the spec, so this is the only
  // documented way to read a test's full authoring structure.
  answerKey: (id) => apiClient.get(`${BASE}/admin/mock-tests/${id}/answer-key`),
  // `If-Match` is a date-time (the test's current `updatedAt`), used for
  // optimistic-concurrency control on publish.
  publish: (id, ifMatch) =>
    apiClient.post(`${BASE}/admin/mock-tests/${id}/publish`, null, {
      headers: { 'If-Match': ifMatch },
    }),
  archive: (id) => apiClient.post(`${BASE}/admin/mock-tests/${id}/archive`),
  revertToDraft: (id) => apiClient.patch(`${BASE}/admin/mock-tests/${id}/revert-to-draft`),
  // Request body is a free-form `Map<string, string>` in the spec. We send
  // an optional `title` override if the admin provides one.
  clone: (id, title) => apiClient.post(`${BASE}/admin/mock-tests/${id}/clone`, title ? { title } : {}),
};

// ---------------------------------------------------------------------------
// Sections (nested under a mock test)
//
// NOTE on reorder endpoints: the spec types both reorder request bodies as
// a generic `Map<string, List<UUID>>` rather than a named DTO, so the exact
// key name isn't documented. We send `{ order: [...uuids in new order] }`.
// If your backend expects a different key, update `ORDER_KEY` below.
// ---------------------------------------------------------------------------
const ORDER_KEY = 'order';

export const sectionsApi = {
  create: (testId, payload) => apiClient.post(`${BASE}/admin/mock-tests/${testId}/sections`, payload),
  reorderSections: (testId, orderedSectionIds) =>
    apiClient.put(`${BASE}/admin/mock-tests/${testId}/sections/reorder`, { [ORDER_KEY]: orderedSectionIds }),
  attachQuestions: (sectionId, payload) => apiClient.post(`${BASE}/admin/sections/${sectionId}/questions`, payload),
  reorderQuestions: (sectionId, orderedQuestionIds) =>
    apiClient.put(`${BASE}/admin/sections/${sectionId}/questions/reorder`, { [ORDER_KEY]: orderedQuestionIds }),
  removeQuestion: (sectionId, questionId) => apiClient.delete(`${BASE}/admin/sections/${sectionId}/questions/${questionId}`),
  // Body is a `Map<string, number>`; we reuse the field names from
  // `QuestionMappingDto` (`positiveMarksOverride` / `negativeMarksOverride`).
  updateQuestionMarks: (sectionId, questionId, marks) =>
    apiClient.patch(`${BASE}/admin/sections/${sectionId}/questions/${questionId}`, marks),
};

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------
export const questionsApi = {
  list: async ({ search, type, difficulty, isLocked, unused, page = 1, limit = 20 } = {}) => {
    const envelope = await apiClientRaw.get(`${BASE}/admin/questions`, {
      params: {
        search: search || undefined,
        type: type || undefined,
        difficulty: difficulty || undefined,
        isLocked: typeof isLocked === 'boolean' ? isLocked : undefined,
        unused: typeof unused === 'boolean' ? unused : undefined,
        page,
        limit,
      },
    });
    return unwrapList(envelope);
  },
  get: (id) => apiClient.get(`${BASE}/admin/questions/${id}`),
  create: (payload) => apiClient.post(`${BASE}/admin/questions`, payload),
  update: (id, payload) => apiClient.put(`${BASE}/admin/questions/${id}`, payload),
  remove: (id) => apiClient.delete(`${BASE}/admin/questions/${id}`),
};

// ---------------------------------------------------------------------------
// Public catalog structure — used for "preview as student" (never exposes
// correct answers, unlike the admin answer-key endpoint above).
// ---------------------------------------------------------------------------
export const catalogApi = {
  structure: (testId) => apiClient.get(`${BASE}/catalog/mock-tests/${testId}/structure`),
};