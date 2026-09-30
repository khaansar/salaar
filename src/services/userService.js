import apiClient from '@/lib/apiClient';

const readTotalElements = (response) => {
  // Spring Data's Page response can expose the totals at the root, under
  // `page` (for VIA_DTO serialization), or inside an additional API envelope.
  const candidates = [
    response?.totalElements,
    response?.page?.totalElements,
    response?.data?.totalElements,
    response?.data?.page?.totalElements,
    response?.data?.data?.totalElements,
    response?.data?.data?.page?.totalElements,
  ];

  return candidates.find((value) => Number.isFinite(value)) ?? null;
};

export const usersApi = {
  stats: async () => {
    const [allUsers, activeUsers, admins] = await Promise.all([
      usersApi.list({ page: 0, size: 1 }),
      usersApi.list({ page: 0, size: 1, isActive: true }),
      usersApi.list({ page: 0, size: 1, role: 'ADMIN' }),
    ]);

    return {
      totalUsers: readTotalElements(allUsers),
      activeUsers: readTotalElements(activeUsers),
      adminUsers: readTotalElements(admins),
    };
  },

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
