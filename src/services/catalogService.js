import apiClient from '../lib/apiClient';

import {
  fetchWithCache,
  CACHE_TAGS,
} from '../lib/cache';

export const catalogService = {
  async getCategories() {
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
    return apiClient.get(
      '/attempts-api/attempts/in-progress'
    );
  },

  async getStreak() {
    return apiClient.get(
      '/attempts-api/streak/yearly'
    );
  },

  /**
   * Real platform totals for the homepage. Each count is read from the
   * pagination meta of a public list endpoint (asking for a single row), and
   * is `null` when that endpoint is unavailable so the UI can hide it.
   */
  async getPlatformStats() {
    const totalOf = async (url, tags) => {
      const envelope = await fetchWithCache(url, { revalidate: 300, tags, preserveEnvelope: true });
      const total = Number(envelope?.meta?.pagination?.total_records);
      return Number.isFinite(total) ? total : null;
    };

    const [mockTests, testSeries] = await Promise.allSettled([
      totalOf('/tests-api/public/mock-tests?page=1&limit=1', [CACHE_TAGS.featuredTests]),
      totalOf('/tests-api/public/series?page=1&limit=1', [CACHE_TAGS.seriesList]),
    ]);

    return {
      mockTests: mockTests.status === 'fulfilled' ? mockTests.value : null,
      testSeries: testSeries.status === 'fulfilled' ? testSeries.value : null,
    };
  },

  async getTestimonials() {
    return fetchWithCache(
      '/community-api/public/reviews/PLATFORM',
      {
        revalidate: 3600,
        tags: ['catalog:testimonials'],
      }
    );
  },
};
