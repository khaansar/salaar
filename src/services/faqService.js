import apiClient from '@/lib/apiClient';

const BASE = '/community-api';

export const faqApi = {
  list: (targetId) =>
    apiClient.get(targetId == null
      ? `${BASE}/public/faq`
      : `${BASE}/public/faq/${encodeURIComponent(targetId)}`),
  create: (payload) => apiClient.post(`${BASE}/admins/faq`, payload),
  update: (targetId, faqId, payload) =>
    apiClient.put(targetId == null
      ? `${BASE}/admins/faq/${faqId}`
      : `${BASE}/admins/faq/${encodeURIComponent(targetId)}/${faqId}`, payload),
  remove: (targetId, faqId) =>
    apiClient.delete(targetId == null
      ? `${BASE}/admins/faq/${faqId}`
      : `${BASE}/admins/faq/${encodeURIComponent(targetId)}/${faqId}`),
};
