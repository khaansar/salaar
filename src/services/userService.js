import apiClient from '@/lib/apiClient';

export const usersApi = {
  list: ({ page = 0, size = 20 } = {}) =>
    apiClient.get('/auth-api/users', {
      params: { page, size },
    }),
};