import apiClient from '../lib/apiClient';
import { 
  CATEGORIES_MOCK, 
  POPULAR_SERIES_MOCK, 
  FEATURED_TESTS_MOCK, 
  CONTINUE_ATTEMPT_MOCK 
} from '../features/home/mock/homeMocks';

// Set this to false when connecting to real endpoints
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_CATALOG_MOCKS !== 'false';

// Helper to simulate network delay for mocks
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const catalogService = {
  async getCategories() {
    if (USE_MOCKS) {
      await delay(500);
      return CATEGORIES_MOCK;
    }
    try {
      console.log('Fetching categories...');
      const response = await apiClient.get('/tests-api/public/categories');
      return response;
    } catch (error) {
      console.error('getCategories error:', error);
      return [];
    }
  },

  async getPopularSeries() {
    if (USE_MOCKS) {
      await delay(600);
      return POPULAR_SERIES_MOCK;
    }
    try {
      console.log('Fetching popular series...');
      const response = await apiClient.get('/tests-api/public/series/popular');
      return response;
    } catch (error) {
      console.error('getPopularSeries error:', error);
      return [];
    }
  },

  async getFeaturedTests() {
    if (USE_MOCKS) {
      await delay(700);
      return FEATURED_TESTS_MOCK;
    }
    try {
      console.log('Fetching featured tests...');
      const response = await apiClient.get('/tests-api/public/mock-tests/featured');
      return response;
    } catch (error) {
      console.error('getFeaturedTests error:', error);
      return [];
    }
  },

  async getContinueAttempt() {
    if (USE_MOCKS) {
      await delay(300);
      return CONTINUE_ATTEMPT_MOCK; 
    }
    // TODO: implement real endpoint via attempt-service
    const response = await apiClient.get('/attempts-api/attempts/in-progress');
    return response;
  },

  async getStreak() {
    if (USE_MOCKS) {
      await delay(400);
      return require('../features/home/mock/homeMocks').STREAK_MOCK;
    }
    // TODO: implement real endpoint via attempt-service
    const response = await apiClient.get('/attempts-api/streak/yearly');
    return response;
  }
};
