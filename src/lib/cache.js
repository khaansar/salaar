/**
 * Shared cache configuration for public/server-side catalog requests.
 *
 * Public catalog data is cached using the Next.js Data Cache.
 * User-specific and authenticated requests should continue using apiClient.
 */

export const CACHE_TAGS = {
  categories: 'catalog:categories',
  popularSeries: 'catalog:series:popular',
  featuredTests: 'catalog:tests:featured',
  seriesList: 'catalog:series:list',

  series: (seriesId) => `catalog:series:${seriesId}`,

  testStructure: (testId) => `catalog:test-structure:${testId}`,
};

/**
 * Error raised when an HTTP response is unsuccessful.
 * Retaining status lets route components distinguish a 404 from a 5xx.
 */
export class ApiResponseError extends Error {
  constructor(message, { status, statusText, url, body } = {}) {
    super(message);

    this.name = 'ApiResponseError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.body = body;
  }
}

function resolveBaseUrl() {
  const configuredUrl =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  const baseUrl =
    configuredUrl ||
    (process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:8080');

  if (!baseUrl) {
    throw new Error(
      'API base URL is missing. Configure INTERNAL_API_BASE_URL or ' +
        'NEXT_PUBLIC_API_BASE_URL.'
    );
  }

  return baseUrl.trim().replace(/\/+$/, '');
}

async function readErrorBody(response) {
  const text = await response.text().catch(() => '');

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Fetch public API data using the Next.js Data Cache.
 *
 * @param {string} url API path beginning with "/".
 * @param {object} options Fetch options plus Next.js revalidate/tags.
 */
export async function fetchWithCache(url, options = {}) {
  const {
    revalidate = 300,
    tags = [],
    next: suppliedNext = {},
    ...fetchOptions
  } = options;

  const fullUrl = `${resolveBaseUrl()}${url}`;

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...fetchOptions.headers,
    },
    next: {
      ...suppliedNext,
      revalidate,
      tags,
    },
  });

  if (!response.ok) {
    const body = await readErrorBody(response);

    const detail =
      body && typeof body === 'object'
        ? body.message || body.error || response.statusText
        : typeof body === 'string' && body.trim()
          ? body
          : response.statusText;

    throw new ApiResponseError(
      `Request to ${url} failed: ${response.status} ${detail}`,
      {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        body,
      }
    );
  }

  if (response.status === 204) {
    return null;
  }

  const json = await response.json();

  // Preserve the API-envelope behavior expected by existing services.
  return json?.data !== undefined ? json.data : json;
}