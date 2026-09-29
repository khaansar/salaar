/**
 * Shared cache configuration for public/server-side catalog requests.
 *
 * The actual cache is Next.js' Data Cache.
 * Redis caching will be handled by Baahubali independently.
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

  const baseUrl =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8080';

  const fullUrl = `${baseUrl}${url}`;

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