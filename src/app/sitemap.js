import { siteConfig } from '@/config/site';
import { testService } from '@/services/testService';

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

function extractSeries(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

export default async function sitemap() {
  const baseUrl = siteConfig.url;

  if (!baseUrl) {
    console.error(
      'NEXT_PUBLIC_SITE_URL is not configured; sitemap is empty.'
    );
    return [];
  }

  const staticPages = [
    {
      url: new URL('/', `${baseUrl}/`).toString(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/test-series', `${baseUrl}/`).toString(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const seriesByUrl = new Map();
  let page = 1;

  try {
    while (page <= MAX_PAGES) {
      const response = await testService.getPublishedSeries(
        page,
        PAGE_SIZE
      );

      const series = extractSeries(response);

      if (series.length === 0) {
        break;
      }

      for (const item of series) {
        if (
          typeof item?.slug !== 'string' ||
          !item.slug.trim() ||
          item.published === false
        ) {
          continue;
        }

        const url = new URL(
          `/test-series/${encodeURIComponent(item.slug)}`,
          `${baseUrl}/`
        ).toString();

        seriesByUrl.set(url, {
          url,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }

      if (series.length < PAGE_SIZE) {
        break;
      }

      page += 1;
    }
  } catch (error) {
    console.error(
      'Failed to load published series for sitemap:',
      error
    );

    return staticPages;
  }

  return [...staticPages, ...seriesByUrl.values()];
}