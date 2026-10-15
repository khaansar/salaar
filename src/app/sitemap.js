import { siteConfig } from '@/config/site';
import { testService } from '@/services/testService';

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export default async function sitemap() {
  const baseUrl = siteConfig.url;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_SITE_URL is not configured; sitemap is empty.');
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

  const seriesPages = [];
  let page = 1;

  try {
    while (page <= MAX_PAGES) {
      const series = await testService.getPublishedSeries(page, PAGE_SIZE);

      if (!Array.isArray(series) || series.length === 0) {
        break;
      }

      for (const item of series) {
        if (
          item?.slug &&
          typeof item.slug === 'string' &&
          item.published !== false
        ) {
          seriesPages.push({
            url: new URL(
              `/test-series/${encodeURIComponent(item.slug)}`,
              `${baseUrl}/`
            ).toString(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }

      if (series.length < PAGE_SIZE) {
        break;
      }

      page += 1;
    }
  } catch (error) {
    console.error('Failed to load published series for sitemap:', error);

    return staticPages;
  }

  return [
    ...staticPages,
    ...seriesPages,
  ];
}