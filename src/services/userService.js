
import { apiClientRaw } from '@/lib/apiClient';

const readPagination = (response) => {
  const candidates = [
    response?.meta?.pagination,
    response?.data?.meta?.pagination,
    response?.data?.data?.meta?.pagination,
    response?.page,
    response?.data?.page,
    response?.data?.data?.page,
  ];

  return candidates.find((value) => value && typeof value === 'object') ?? {};
};

const readTotalElements = (response) => {
  const pagination = readPagination(response);
  const candidates = [
    pagination.total_records,
    pagination.totalElements,
    response?.totalElements,
    response?.data?.totalElements,
    response?.data?.data?.totalElements,
    response?.data?.page?.totalElements,
    response?.data?.data?.page?.totalElements,
  ];

  return candidates.find((value) => Number.isFinite(value)) ?? null;
};

const readTotalPages = (response) => {
  const pagination = readPagination(response);
  const candidates = [
    pagination.total_pages,
    pagination.totalPages,
    response?.totalPages,
    response?.data?.totalPages,
    response?.data?.data?.totalPages,
    response?.data?.page?.totalPages,
    response?.data?.data?.page?.totalPages,
  ];

  return candidates.find((value) => Number.isFinite(value)) ?? null;
};

const readUsers = (response) => {
  const candidates = [
    response?.data,
    response?.content,
    response?.data?.content,
    response?.data?.data,
    response?.data?.data?.content,
  ];

  return candidates.find((value) => Array.isArray(value)) ?? [];
};

const normalizeUserPage = (response) => ({
  content: readUsers(response),
  totalElements: readTotalElements(response),
  totalPages: readTotalPages(response),
});

export const usersApi = {
  stats: async () => {
    const [allUsers, activeUsers, admins] = await Promise.all([
      usersApi.list({ page: 0, size: 1 }),
      usersApi.list({ page: 0, size: 1, isActive: true }),
      usersApi.list({ page: 0, size: 1, role: 'ADMIN' }),
    ]);

    return {
      totalUsers: allUsers.totalElements,
      activeUsers: activeUsers.totalElements,
      adminUsers: admins.totalElements,
    };
  },

  list: async (filters = {}) => {
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

    const response = await apiClientRaw.get('/auth-api/users', { params });

    return normalizeUserPage(response);
  },
};
