import apiClient from '@/lib/apiClient';
import {
  fetchWithCache,
  CACHE_TAGS,
} from '@/lib/cache';

export const testService = {
  async getPublishedSeries(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    return fetchWithCache(
      `/tests-api/public/series?${params.toString()}`,
      {
        revalidate: 300,
        tags: [CACHE_TAGS.seriesList],
      }
    );
  },

  async getSeriesById(seriesId) {
    if (!seriesId) {
      throw new Error('seriesId is required');
    }

    return fetchWithCache(
      `/tests-api/public/series/${encodeURIComponent(seriesId)}`,
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.series(seriesId),
          CACHE_TAGS.seriesList,
        ],
      }
    );
  },

  async getSeriesBySlug(slug) {
    if (!slug) {
      throw new Error('slug is required');
    }
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
    if (isUuid) {
      return this.getSeriesById(slug);
    }

    return fetchWithCache(
      `/tests-api/public/series/slug/${encodeURIComponent(slug)}`,
      {
        revalidate: 300,
        tags: [
          `series-slug-${slug}`,
          CACHE_TAGS.seriesList,
        ],
      }
    );
  },

  async getMockTestStructure(testId) {
    if (!testId) {
      throw new Error('testId is required');
    }

    return fetchWithCache(
      `/tests-api/catalog/mock-tests/${encodeURIComponent(testId)}/structure`,
      {
        revalidate: 300,
        tags: [
          CACHE_TAGS.testStructure(testId),
        ],
      }
    );
  },

  async getMockTestStructureBySlug(slug) {
    if (!slug) {
      throw new Error('slug is required');
    }
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);
    if (isUuid) {
      return this.getMockTestStructure(slug);
    }

    return fetchWithCache(
      `/tests-api/catalog/mock-tests/slug/${encodeURIComponent(slug)}/structure`,
      {
        revalidate: 300,
        tags: [
          `test-structure-slug-${slug}`,
        ],
      }
    );
  },

  async createSeries(payload) {
    return apiClient.post(
      '/tests-api/admin/series',
      payload
    );
  },
};