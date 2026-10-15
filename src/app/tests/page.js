import StudentShell from '../../components/student/StudentShell';
import MockTestsPage from '../../features/mock-tests/MockTestsPage';
import { fetchWithCache, CACHE_TAGS } from '../../lib/cache';
import { siteConfig } from '../../config/site';
import HomeFaq from '../../features/home/HomeFaq';

export const metadata = {
  title: siteConfig.formatTitle('Mock Tests'),
};

export const dynamic = 'force-dynamic';

function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default async function Page() {
  let series = [];

  try {
    const response = await fetchWithCache(
      '/tests-api/public/series/popular',
      {
        revalidate: 120,
        tags: [
          CACHE_TAGS.popularSeries,
          CACHE_TAGS.seriesList,
        ],
      }
    );

    series = toList(response);
  } catch (error) {
    console.error('Failed to load popular test series:', error);
  }

  return (
    <StudentShell>
      <MockTestsPage series={series} />
      <div className="mx-auto max-w-7xl pb-12">
        <HomeFaq
          title="Mock test FAQs"
          subtitle="Quick answers before you start practicing."
        />
      </div>
    </StudentShell>
  );
}