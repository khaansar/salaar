import apiClient from '@/lib/apiClient';

const BASE = '/community-api';

export const faqApi = {
  listAll: () => apiClient.get(`${BASE}/admin/faq`),
  list: (targetId) =>
    apiClient.get(targetId == null
      ? `${BASE}/public/faq`
      : `${BASE}/public/faq/${encodeURIComponent(targetId)}`),
  create: (payload) => apiClient.post(`${BASE}/admin/faq`, payload),
  update: (targetId, faqId, payload) =>
    apiClient.put(targetId == null
      ? `${BASE}/admin/faq/${faqId}`
      : `${BASE}/admin/faq/${encodeURIComponent(targetId)}/${faqId}`, payload),
  remove: (targetId, faqId) =>
    apiClient.delete(targetId == null
      ? `${BASE}/admin/faq/${faqId}`
      : `${BASE}/admin/faq/${encodeURIComponent(targetId)}/${faqId}`),
};
