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
