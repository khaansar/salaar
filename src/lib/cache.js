/**
 * Shared cache configuration for public/server-side catalog requests.
 *
 * The actual cache is Next.js' Data Cache.
 * Redis caching will be handled by the platform backend independently.
 */

export const CACHE_TAGS = {
  categories: 'catalog:categories',

  popularSeries: 'catalog:series:popular',

  featuredTests: 'catalog:tests:featured',

  seriesList: 'catalog:series:list',

  series: (seriesId) => `catalog:series:${seriesId}`,

  testStructure: (testId) =>
    `catalog:test-structure:${testId}`,
};

/**
 * Resolve the API base URL for server-side requests.
 */
function resolveBaseUrl() {
  const fromEnv =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const baseUrl =
    fromEnv ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:8080');

  if (!baseUrl) {
    throw new Error(
      'API base URL is not set. Define NEXT_PUBLIC_API_BASE_URL (or ' +
        'INTERNAL_API_BASE_URL), or enable NEXT_PUBLIC_USE_CATALOG_MOCKS=true.'
    );
  }

  // Avoid double slashes when joined with paths like "/tests-api/..."
  return baseUrl.trim().replace(/\/+$/, '');
}

/**
 * Fetch a public API endpoint through Next.js Data Cache.
 *
 * @param {string} url
 * @param {object} options
 * @param {number} options.revalidate
 * @param {string[]} options.tags
 * @returns {Promise<any>}
 */
export async function fetchWithCache(url, options = {}) {
  const {
    revalidate = 300,
    tags = [],
    ...fetchOptions
  } = options;

  const fullUrl = `${resolveBaseUrl()}${url}`;

  const response = await fetch(fullUrl, {
    ...fetchOptions,

    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },

    next: {
      revalidate,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  return json?.data !== undefined
    ? json.data
    : json;
}