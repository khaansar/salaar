import { siteConfig } from '../config/site';

const STORAGE_KEY = 'clearit_homepage_reviews';
const COOKIE_NAME = 'HOMEPAGE_REVIEWS';

/**
 * Safely parse document.cookie in browser context.
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Safely set a cookie on the client with 30 days expiration.
 */
function setCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Normalizes a review object for display on the home page.
 */
export function normalizeReviewForHomepage(review) {
  if (!review) return null;
  const reviewId = String(review.reviewId ?? review.id ?? '');
  const authorName = review.userName || review.authorName || (review.userId ? `User #${String(review.userId).slice(0, 6)}` : 'Student');
  const seriesName = review.seriesName || review.targetId || (review.targetType === 'PLATFORM' ? 'Platform Review' : `${siteConfig.name} Student`);

  return {
    id: reviewId,
    reviewId,
    name: authorName,
    authorName,
    userName: authorName,
    exam: seriesName,
    seriesName,
    text: review.comment || review.text || 'Great platform and quality practice tests.',
    comment: review.comment || review.text || 'Great platform and quality practice tests.',
    rating: Number(review.rating) || 5,
    targetType: review.targetType || 'SERIES',
    targetId: review.targetId || '',
    createdAt: review.createdAt || new Date().toISOString(),
    addedToHomepageAt: review.addedToHomepageAt || new Date().toISOString(),
  };
}

export const homepageReviewService = {
  /**
   * Retrieves all reviews selected by admin to appear on the homepage.
   */
  getHomepageReviews() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeReviewForHomepage).filter(Boolean);
        }
      }

      // Fallback: check cookie if localStorage was empty
      const cookieVal = getCookie(COOKIE_NAME);
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeReviewForHomepage).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Failed to retrieve homepage reviews:', e);
    }
    return [];
  },

  /**
   * Checks if a review is currently featured on the homepage.
   */
  isReviewOnHomepage(reviewId) {
    if (!reviewId) return false;
    const targetId = String(reviewId);
    const list = this.getHomepageReviews();
    return list.some((r) => String(r.reviewId) === targetId || String(r.id) === targetId);
  },

  /**
   * Adds or removes a review from the homepage list.
   * Persists to both localStorage and cookie, and dispatches a notification event.
   */
  setReviewOnHomepage(review, onHomepage) {
    if (!review) return [];
    const reviewId = String(review.reviewId ?? review.id ?? '');
    if (!reviewId) return [];

    const currentList = this.getHomepageReviews();
    let updatedList;

    if (onHomepage) {
      const normalized = normalizeReviewForHomepage(review);
      const existingIdx = currentList.findIndex(
        (r) => String(r.reviewId) === reviewId || String(r.id) === reviewId
      );
      if (existingIdx >= 0) {
        updatedList = [...currentList];
        updatedList[existingIdx] = normalized;
      } else {
        updatedList = [...currentList, normalized];
      }
    } else {
      updatedList = currentList.filter(
        (r) => String(r.reviewId) !== reviewId && String(r.id) !== reviewId
      );
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }

      try {
        setCookie(COOKIE_NAME, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Failed to save to cookie:', e);
      }

      window.dispatchEvent(
        new CustomEvent('homepage-reviews-updated', { detail: updatedList })
      );
    }

    return updatedList;
  },

  /**
   * Subscribes to changes to homepage reviews (same tab or cross-tab).
   */
  subscribeHomepageReviews(callback) {
    if (typeof window === 'undefined') return () => {};

    const handler = () => callback();
    window.addEventListener('homepage-reviews-updated', handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('homepage-reviews-updated', handler);
      window.removeEventListener('storage', handler);
    };
  },
};
