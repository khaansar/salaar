import StudentShell from '../../components/student/StudentShell';
import MockTestsPage from '../../features/mock-tests/MockTestsPage';
import { catalogService } from '../../services/catalogService';
import { siteConfig } from '../../config/site';
import HomeFaq from '../../features/home/HomeFaq';

export const metadata = {
  title: siteConfig.formatTitle('Mock Tests'),
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [res] = await Promise.allSettled([catalogService.getPopularSeries()]);
  const series = res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : [];

  return (
    <StudentShell>
      <MockTestsPage series={series} />
      <HomeFaq title="Mock test FAQs" subtitle="Quick answers before you start practicing." />
    </StudentShell>
  );
}
