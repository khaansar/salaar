import StudentShell from '../components/student/StudentShell';
import HeroSection from '../features/home/HeroSection';
import ValueStrip from '../features/home/ValueStrip';
import CategoryGrid from '../features/home/CategoryGrid';
import PremiumCalendar from '../features/home/PremiumCalendar';
import PopularSeries from '../features/home/PopularSeries';
import StartPracticing from '../features/home/StartPracticing';
import ContinueCard from '../features/home/ContinueCard';
import { catalogService } from '../services/catalogService';

export const metadata = {
  title: 'TestHub | Practice Smarter, Score Higher',
  description:
    'High quality mock tests, detailed solutions and performance analytics to help you achieve your goals.',
};

async function loadCatalog() {
  const results = await Promise.allSettled([
    catalogService.getCategories(),
    catalogService.getPopularSeries(),
    catalogService.getFeaturedTests(),
  ]);

  return {
    categories:
      results[0].status === 'fulfilled'
        ? results[0].value
        : [],

    popularSeries:
      results[1].status === 'fulfilled'
        ? results[1].value
        : [],

    featuredTests:
      results[2].status === 'fulfilled'
        ? results[2].value
        : [],
  };
}

export default async function HomePage() {
  const {
    categories,
    popularSeries,
    featuredTests,
  } = await loadCatalog();

  return (
    <StudentShell>
      <div className="pb-10">
        <PremiumCalendar />

        <HeroSection />
        <ContinueCard />
        <ValueStrip />

        <CategoryGrid
          categories={categories}
        />

        <PopularSeries
          series={popularSeries}
        />

        <StartPracticing
          tests={featuredTests}
        />
      </div>
    </StudentShell>
  );
}