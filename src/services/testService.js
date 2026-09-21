import apiClient from '@/lib/apiClient';

export const testService = {
  // Public Catalog: Fetches published test series via Spring Cloud Gateway
  getPublishedSeries: async (page = 0, size = 10) => {
    return await apiClient.get('/tests/public/series', {
      params: { page, size },
    });
  },

  // Public Catalog: Fetches details of a single series by ID
  getSeriesById: async (seriesId) => {
    return await apiClient.get(`/tests/public/series/${seriesId}`);
  },

  // Admin: Create a new test series (requires evaluator/admin role)
  createSeries: async (payload) => {
    return await apiClient.post('/tests/admin/series', payload);
  },
};