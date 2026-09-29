import apiClient from '@/lib/apiClient';
import { fetchWithCache } from '@/lib/cache';

export const testService = {
  // Public Catalog: Fetches published test series via Spring Cloud Gateway
  getPublishedSeries: async (page = 0, size = 10) => {
    return await fetchWithCache(`/tests-api/public/series?page=${page}&size=${size}`, { revalidate: 300 });
  },

  // Public Catalog: Fetches details of a single series by ID
  getSeriesById: async (seriesId) => {
    return await fetchWithCache(`/tests-api/public/series/${seriesId}`, { revalidate: 300 });
  },

  // Admin: Create a new test series (requires evaluator/admin role)
  createSeries: async (payload) => {
    return await apiClient.post('/tests-api/admin/series', payload);
  },
};
