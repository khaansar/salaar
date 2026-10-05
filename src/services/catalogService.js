import apiClient from '../lib/apiClient';

import {
  fetchWithCache,
  CACHE_TAGS,
} from '../lib/cache';

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

    return fetchWithCache(
      '/tests-api/public/categories',
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.categories,
        ],
      }
    );
  },

  async getPopularSeries() {
    if (USE_MOCKS) {
      await delay(600);
      return POPULAR_SERIES_MOCK;
    }

    return fetchWithCache(
      '/tests-api/public/series/popular',
      {
        revalidate: 120,
        tags: [
          CACHE_TAGS.popularSeries,
          CACHE_TAGS.seriesList,
        ],
      }
    );
  },

  async getFeaturedTests() {
    if (USE_MOCKS) {
      await delay(700);
      return FEATURED_TESTS_MOCK;
    }

    return fetchWithCache(
      '/tests-api/public/mock-tests/featured',
      {
        revalidate: 120,
        tags: [
          CACHE_TAGS.featuredTests,
        ],
      }
    );
  },

  async getContinueAttempt() {
    if (USE_MOCKS) {
      await delay(300);
      return CONTINUE_ATTEMPT_MOCK;
    }

    return apiClient.get(
      '/attempts-api/attempts/in-progress'
    );
  },

  async getStreak() {
    if (USE_MOCKS) {
      await delay(400);

      const { STREAK_MOCK } = await import(
        '../features/home/mock/homeMocks'
      );

      return STREAK_MOCK;
    }

    return apiClient.get(
      '/attempts-api/streak/yearly'
    );
  },

  async getTestimonials() {
    if (USE_MOCKS) {
      await delay(300);
      return []; // Return mock or empty if mocks enabled
    }

    return fetchWithCache(
      '/community-api/public/reviews/PLATFORM',
      {
        revalidate: 3600,
        tags: ['catalog:testimonials'],
      }
    );
  },
};