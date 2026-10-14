import apiClient from '../lib/apiClient';

const BASE = '/community-api';

export const reviewService = {
  /**
   * Fetch approved reviews for a given targetId (series ID or slug).
   * Attempts primary targetId first; if empty or fails, checks fallbackTargetId.
   */
  async getReviews(targetId, fallbackTargetId = null) {
    if (!targetId && !fallbackTargetId) return [];

    try {
      if (targetId) {
        const res = await apiClient.get(
          `${BASE}/public/reviews/${encodeURIComponent(targetId)}`
        );
        const reviews = Array.isArray(res) ? res : res?.data || [];
        if (reviews.length > 0 || !fallbackTargetId || fallbackTargetId === targetId) {
          return reviews;
        }
      }
    } catch {
      // Ignore and try fallback if available
    }

    if (fallbackTargetId && fallbackTargetId !== targetId) {
      try {
        const res = await apiClient.get(
          `${BASE}/public/reviews/${encodeURIComponent(fallbackTargetId)}`
        );
        return Array.isArray(res) ? res : res?.data || [];
      } catch {
        return [];
      }
    }

    return [];
  },

  /**
   * Submits a new review for community moderation.
   */
  async submitReview({ targetId, targetType = 'SERIES', rating, comment }) {
    return apiClient.post(`${BASE}/reviews`, {
      targetId,
      targetType,
      rating,
      comment: comment?.trim() || null,
    });
  },
};
