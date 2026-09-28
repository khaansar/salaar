import apiClient from '../lib/apiClient';

import {
  CATEGORIES_MOCK,
  POPULAR_SERIES_MOCK,
  FEATURED_TESTS_MOCK,
  CONTINUE_ATTEMPT_MOCK,
} from '../features/home/mock/homeMocks';

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_CATALOG_MOCKS === 'true';

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const catalogService = {
  async getCategories() {
    if (USE_MOCKS) {
      await delay(500);
      return CATEGORIES_MOCK;
    }

    return apiClient.get('/tests-api/public/categories');
  },

  async getPopularSeries() {
    if (USE_MOCKS) {
      await delay(600);
      return POPULAR_SERIES_MOCK;
    }

    return apiClient.get('/tests-api/public/series/popular');
  },

  async getFeaturedTests() {
    if (USE_MOCKS) {
      await delay(700);
      return FEATURED_TESTS_MOCK;
    }

    return apiClient.get('/tests-api/public/mock-tests/featured');
  },

  async getContinueAttempt() {
    if (USE_MOCKS) {
      await delay(300);
      return CONTINUE_ATTEMPT_MOCK;
    }

    return apiClient.get('/attempts-api/attempts/in-progress');
  },

  async getStreak() {
    if (USE_MOCKS) {
      await delay(400);

      const { STREAK_MOCK } = await import(
        '../features/home/mock/homeMocks'
      );

      return STREAK_MOCK;
    }

    return apiClient.get('/attempts-api/streak/yearly');
  },
};