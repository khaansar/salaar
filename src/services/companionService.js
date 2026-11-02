import { apiClientRaw } from '../lib/apiClient';

const BASE_PATH = '/companion-api';
const config = { timeout: 5000 };

export const companionService = {
  getNext: () => apiClientRaw.get(`${BASE_PATH}/next`, config),
  answer: (promptId, selectedOption) =>
    apiClientRaw.post(`${BASE_PATH}/prompts/${promptId}/answer`, { selectedOption }, config),
  skip: (promptId) => apiClientRaw.post(`${BASE_PATH}/prompts/${promptId}/skip`, null, config),
  getSettings: () => apiClientRaw.get(`${BASE_PATH}/settings`, config),
  updateSettings: (changes) => apiClientRaw.put(`${BASE_PATH}/settings`, changes, config),
};
