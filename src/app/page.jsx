import StudentShell from '../components/student/StudentShell';
import HeroSection from '../features/home/HeroSection';
import ValueStrip from '../features/home/ValueStrip';
import CategoryGrid from '../features/home/CategoryGrid';
import PopularSeries from '../features/home/PopularSeries';
import StartPracticing from '../features/home/StartPracticing';
import ContinueCard from '../features/home/ContinueCard';
import { catalogService } from '../services/catalogService';

export const metadata = {
  title: 'TestHub | Practice Smarter, Score Higher',
  description: 'High quality mock tests, detailed solutions and performance analytics to help you achieve your goals.',
};

export default async function HomePage() {
  // Parallel fetching for performance
  const [categories, popularSeries, featuredTests] = await Promise.all([
    catalogService.getCategories(),
    catalogService.getPopularSeries(),
    catalogService.getFeaturedTests(),
  ]);

  return (
    <StudentShell>
      <div className="pb-10">
        <HeroSection />
        <ContinueCard />
        <ValueStrip />
        <CategoryGrid categories={categories} />
        <PopularSeries series={popularSeries} />
        <StartPracticing tests={featuredTests} />
      </div>
    </StudentShell>
  );
}
