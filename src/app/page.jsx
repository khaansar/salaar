import StudentShell from '../components/student/StudentShell';
import HeroSection from '../features/home/HeroSection';
import ValueStrip from '../features/home/ValueStrip';
import CategoryGrid from '../features/home/CategoryGrid';
import PremiumCalendar from '../features/home/PremiumCalendar';
import PopularSeries from '../features/home/PopularSeries';
import StartPracticing from '../features/home/StartPracticing';
import ContinueCard from '../features/home/ContinueCard';
import GuestOnly from '../features/home/GuestOnly';
import HowItWorks from '../features/home/HowItWorks';
import StatsStrip from '../features/home/StatsStrip';
import Testimonials from '../features/home/Testimonials';
import JoinBanner from '../features/home/JoinBanner';
import HomeFaq from '../features/home/HomeFaq';
import { catalogService } from '../services/catalogService';

export const metadata = {
  title: 'ClearIt | Practice. Perform. Clear It.',
  description: 'Comprehensive mock tests and real exam practice platform.',
};

async function loadCatalog() {
  const results = await Promise.allSettled([
    catalogService.getCategories(),
    catalogService.getPopularSeries(),
    catalogService.getFeaturedTests(),
    catalogService.getTestimonials().catch(() => []),
  ]);

  return {
    categories: results[0].status === 'fulfilled' ? results[0].value : [],
    popularSeries: results[1].status === 'fulfilled' ? results[1].value : [],
    featuredTests: results[2].status === 'fulfilled' ? results[2].value : [],
    testimonials: results[3].status === 'fulfilled' ? results[3].value : [],
  };
}

export default async function HomePage() {
  const { categories, popularSeries, featuredTests, testimonials } = await loadCatalog();

  return (
    <StudentShell>
      <div className="pb-10">
        <GuestOnly>
          <HeroSection />
        </GuestOnly>
        <ContinueCard />

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch mb-6">
          <div className="flex-1 min-w-0">
            <CategoryGrid categories={categories} />
          </div>
          <div className="shrink-0 flex flex-col w-full max-w-[310px] mx-auto md:w-auto md:max-w-none">
            <PremiumCalendar />
          </div>
        </div>

        <ValueStrip />
        <PopularSeries series={popularSeries} />
        <StartPracticing tests={featuredTests} />

        <HowItWorks />
        <StatsStrip />
        <Testimonials testimonials={testimonials} />
        <JoinBanner />
        <HomeFaq />
      </div>
    </StudentShell>
  );
}
