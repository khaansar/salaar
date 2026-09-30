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
      <div className="pt-4 pb-10 md:pt-6">
        <HeroSection />
        <ContinueCard />
        <ValueStrip />

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch mb-10">
          <div className="flex-1 min-w-0">
            <CategoryGrid categories={categories} />
          </div>
          <div className="shrink-0 flex flex-col w-full max-w-[310px] mx-auto md:w-auto md:max-w-none">
            <PremiumCalendar />
          </div>
        </div>

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
