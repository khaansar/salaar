import StudentShell from '../../components/student/StudentShell';
import MockTestsPage from '../../features/mock-tests/MockTestsPage';
import { catalogService } from '../../services/catalogService';
import { APP_NAME } from '../../constants/brand';

export const metadata = {
  title: `Mock Tests | ${APP_NAME}`,
};

export default async function Page() {
  const [res] = await Promise.allSettled([catalogService.getPopularSeries()]);
  const series = res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : [];

  return (
    <StudentShell>
      <MockTestsPage series={series} />
    </StudentShell>
  );
}
