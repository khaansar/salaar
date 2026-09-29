import apiClient from '@/lib/apiClient';

export const usersApi = {
  list: (filters = {}) => {
    const { page = 0, size = 20, ...filterParams } = filters;
    const dateFields = [
      'createdAfter', 'createdBefore', 'updatedAfter', 'updatedBefore',
      'deletedAfter', 'deletedBefore',
    ];
    const normalizedParams = Object.fromEntries(
      Object.entries(filterParams).map(([key, value]) => {
        if (!dateFields.includes(key) || !/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
          return [key, value];
        }
        const time = key.endsWith('Before') ? 'T23:59:59.999999999Z' : 'T00:00:00Z';
        return [key, `${value}${time}`];
      })
    );
    const params = Object.fromEntries(
      Object.entries({ page, size, ...normalizedParams }).filter(
        ([, value]) => value !== '' && value !== null && value !== undefined
      )
    );

    return apiClient.get('/auth-api/users', { params });
  },
};
