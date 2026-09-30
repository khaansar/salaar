import StudentShell from '../components/student/StudentShell';
import NotFoundView from '../components/common/NotFoundView';
import { catalogService } from '../services/catalogService';

export const metadata = {
  title: 'Page Not Found | TestHub',
};

async function getSuggestions() {
  try {
    const series = await catalogService.getPopularSeries();

    if (!Array.isArray(series)) {
      return [];
    }

    return series.slice(0, 4).map((item) => ({
      title: item.title,
      subtitle: [
        item.testCount != null
          ? `${item.testCount} tests`
          : null,
        item.durationMinutes
          ? `${item.durationMinutes} min`
          : null,
      ]
        .filter(Boolean)
        .join(' • '),
      href: `/test-series/${item.slug}`,
    }));
  } catch (error) {
    console.error('Failed to load 404 suggestions:', error);
    return [];
  }
}

export default async function NotFound() {
  const suggestions = await getSuggestions();

  return (
    <StudentShell>
      <NotFoundView suggestions={suggestions} />
    </StudentShell>
  );
}