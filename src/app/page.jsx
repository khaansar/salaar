import { cookies } from 'next/headers';
import StudentShell from '../components/student/StudentShell';
import HeroSection from '../features/home/HeroSection';
import ValueStrip from '../features/home/ValueStrip';
import CategoryGrid from '../features/home/CategoryGrid';
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

import { siteConfig } from '../config/site';
import StudentBanner from '@/features/home/StudentBanner';

export const metadata = {
  title: siteConfig.formatTitle(siteConfig.tagline),
  description:
    'Full-length mock tests, previous year papers, AI-powered insights and personalized practice to help you achieve your dream.',
  alternates: {
    canonical: '/',
  },
};

// FAQ content is managed in the admin dashboard, so load it at request time.
export const dynamic = 'force-dynamic';

async function loadCatalog() {
  let cookieReviews = [];
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('HOMEPAGE_REVIEWS')?.value;
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(parsed) && parsed.length > 0) {
        cookieReviews = parsed;
      }
    }
  } catch {}

  const results = await Promise.allSettled([
    catalogService.getCategories(),
    catalogService.getPopularSeries(),
    catalogService.getFeaturedTests(),
    catalogService.getTestimonials().catch(() => []),
  ]);

  const apiTestimonials =
    results[3].status === 'fulfilled' && Array.isArray(results[3].value)
      ? results[3].value
      : [];

  const testimonials = cookieReviews.length > 0 ? cookieReviews : apiTestimonials;

  return {
    categories: results[0].status === 'fulfilled' ? results[0].value : [],
    popularSeries: results[1].status === 'fulfilled' ? results[1].value : [],
    featuredTests: results[2].status === 'fulfilled' ? results[2].value : [],
    testimonials,
  };
}

export default async function HomePage() {
  const { categories, popularSeries, featuredTests, testimonials } = await loadCatalog();

  return (
    <StudentShell>
      <div className="pb-10">
        <StudentBanner
        activeDays={['2026-10-13', '2026-10-15']}
        stats={[{ label: 'Tests taken', value: 12 }, { label: 'Avg. score', value: '68%' }]}
        goal={{ name: 'SSC CGL', date: '2026-12-14' }}
        />
        <GuestOnly>
          <HeroSection />
        </GuestOnly>
        <ContinueCard />

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch mb-6">
            <CategoryGrid categories={categories} />
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
