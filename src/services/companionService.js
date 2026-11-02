import { apiClientRaw } from '../lib/apiClient';

const BASE_PATH = '/companion-api';
export const COMPANION_CHANNEL = 'clearit-companion';
export const COMPANION_TEST_STARTED = 'test-started';
export const COMPANION_SETTINGS_CHANGED = 'settings-changed';
const config = { timeout: 5000 };

export function announceToCompanion(message) {
  if (typeof BroadcastChannel === 'undefined') return;

  const channel = new BroadcastChannel(COMPANION_CHANNEL);
  channel.postMessage(message);
  channel.close();
}

export const companionService = {
  getNext: () => apiClientRaw.get(`${BASE_PATH}/next`, config),
  answer: (promptId, selectedOption) =>
    apiClientRaw.post(`${BASE_PATH}/prompts/${promptId}/answer`, { selectedOption }, config),
  skip: (promptId) => apiClientRaw.post(`${BASE_PATH}/prompts/${promptId}/skip`, null, config),
  getSettings: () => apiClientRaw.get(`${BASE_PATH}/settings`, config),
  updateSettings: (changes) => apiClientRaw.put(`${BASE_PATH}/settings`, changes, config),
};
