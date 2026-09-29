import apiClient from '@/lib/apiClient';

import {
  fetchWithCache,
  CACHE_TAGS,
} from '@/lib/cache';

export const testService = {
  getPublishedSeries: async (
    page = 0,
    size = 10
  ) => {
    return fetchWithCache(
      `/tests-api/public/series?page=${page}&size=${size}`,
      {
        revalidate: 300,

        tags: [
          CACHE_TAGS.seriesList,
        ],
      }
    );
  },

  getSeriesById: async (seriesId) => {
    if (!seriesId) {
      throw new Error(
        'seriesId is required'
      );
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

  createSeries: async (payload) => {
    return apiClient.post(
      '/tests-api/admin/series',
      payload
    );
  },
};