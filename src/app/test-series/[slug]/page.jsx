import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

import StudentShell from '../../../components/student/StudentShell';
import SeriesTestsTable from '../../../features/test-series/SeriesTestsTable';
import SeriesCheckoutButton from '../../../features/payments/SeriesCheckoutButton';
import SeriesReviews from '../../../features/test-series/SeriesReviews';
import HomeFaq from '../../../features/home/HomeFaq';
import { testService } from '../../../services/testService';
import { catalogService } from '../../../services/catalogService';
import { siteConfig } from '../../../config/site';

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const PANEL = 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
const BTN_PRIMARY = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 ${FOCUS}`;

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const INCLUDED = [
  'Detailed step-by-step solutions',
  'Topic-wise and section-wise analysis',
  'Answer key with explanations',
  'All India rank & performance analysis',
  'Mobile & desktop access',
]; // TODO: confirm these feature claims or load from series data

const WHY = [
  { title: 'Real exam experience', text: 'Tests built to the latest exam pattern.' },
  { title: 'Detailed solutions', text: 'Step-by-step explanations for every question.' },
  { title: 'Performance analytics', text: 'Identify your weak areas quickly.' },
  { title: 'All subjects covered', text: 'Complete syllabus coverage.' },
  { title: 'Track your progress', text: 'See how you improve test after test.' },
];

const TABS = [
  ['Overview', '#overview'],
  ['Tests', '#tests'],
  ['Reviews', '#reviews'],
  ['FAQs', '#faqs'],
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(value) {
  if (!value || Number(value) === 0) return 'Free';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function PanelHeader({ title, description }) {
  return (
    <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </header>
  );
}

function AccessBadge({ isFree }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${isFree ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30'}`}>
      {isFree ? 'Free' : 'Premium'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Metadata (unchanged)                                               */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const series = await testService.getSeriesBySlug(slug);

    if (!series) {
      return {
        title: siteConfig.formatTitle('Test Series'),
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = series.title || 'Test Series';
    const description =
      series.description ||
      `Explore ${title}, practice mock tests, and review your performance.`;

    const baseUrl = siteConfig.url;
    const canonicalUrl = baseUrl
      ? new URL(
          `/test-series/${encodeURIComponent(slug)}`,
          `${baseUrl}/`
        ).toString()
      : undefined;

    return {
      title: siteConfig.formatTitle(title),
      description,
      ...(canonicalUrl
        ? {
            alternates: {
              canonical: canonicalUrl,
            },
            openGraph: {
              type: 'website',
              title,
              description,
              url: canonicalUrl,
              siteName: siteConfig.name,
            },
          }
        : {}),
    };
  } catch (error) {
    if (error?.status === 404) {
      return {
        title: siteConfig.formatTitle('Test Series'),
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    console.error(
      `Failed to generate metadata for series "${slug}":`,
      error
    );

    return {
      title: siteConfig.formatTitle('Test Series'),
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function TestSeriesPage({ params }) {
  const { slug } = await params;

  let series;

  try {
    series = await testService.getSeriesBySlug(slug);
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!series) notFound();

  const mockTests = Array.isArray(series.mockTests) ? series.mockTests : [];
  const isFree = !series.basePrice || Number(series.basePrice) === 0;

  const popular = await catalogService.getPopularSeries().catch(() => []);
  const similar = (Array.isArray(popular) ? popular : []).filter((s) => s.slug !== slug).slice(0, 4);

  const description =
    series.description ||
    `${series.title} is designed to help you practice effectively and score higher. Each test comes with detailed solutions, performance analysis and topic-wise insights to help you identify your strengths and weaknesses.`;

  return (
    <StudentShell>
      <div className="mx-auto max-w-7xl pb-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/test-series" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Test Series</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{series.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* ============================ Main ============================ */}
          <div className="min-w-0 space-y-6">
            {/* Series header */}
            <section className={`${PANEL} p-5 sm:p-7`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{series.categoryName || 'Test Series'}</p>
                <AccessBadge isFree={isFree} />
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{series.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {series.description || `A collection of high-quality mock tests from ${series.title}, with detailed solutions and in-depth performance analysis.`}
              </p>

              <dl className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="px-4 py-3">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Mock tests</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{mockTests.length}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Access</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{isFree ? 'Free' : 'One-time'}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">Includes</dt>
                  <dd className="mt-0.5 text-sm font-semibold leading-7 text-slate-900 dark:text-white">Solutions &amp; analysis</dd>
                </div>
              </dl>

              {/* Mobile-only call to action (sidebar card sits below on small screens) */}
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-800 lg:hidden">
                <div>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{formatPrice(series.basePrice)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{isFree ? 'Free access' : 'One-time payment'}</p>
                </div>
                <a href={isFree ? '#tests' : '#purchase'} className={BTN_PRIMARY}>
                  {isFree ? 'Start practicing' : 'Get access'} <ArrowRight size={15} />
                </a>
              </div>
            </section>

            {/* Section tabs (anchor links) */}
            <nav aria-label="Series sections" className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-slate-200 px-1 dark:border-slate-800">
              {TABS.map(([label, href]) => (
                <a key={label} href={href} className="shrink-0 border-b-2 border-transparent py-3 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200">
                  {label}{label === 'Tests' ? <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{mockTests.length}</span> : null}
                </a>
              ))}
            </nav>

            {/* Overview */}
            <section id="overview" className={`${PANEL} scroll-mt-24`}>
              <PanelHeader title="About this series" />
              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>

                <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">What&apos;s included</h3>
                <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                  <li className="flex items-center gap-2.5"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" />{mockTests.length} mock tests</li>
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2.5"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" />{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Tests */}
            <section id="tests" className={`${PANEL} scroll-mt-24`}>
              <PanelHeader title={`Tests in this series (${mockTests.length})`} description={isFree ? 'All tests are free to attempt.' : 'Purchase the series to unlock every test.'} />
              <div className="p-5 sm:p-6">
                <SeriesTestsTable tests={mockTests} seriesId={series.id} locked={!isFree} />
              </div>
            </section>

            {/* Why choose */}
            <section className={PANEL}>
              <PanelHeader title={`Why choose ${siteConfig.name}?`} description="Everything you need to crack your exam, in one place." />
              <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {WHY.map((item) => (
                  <div key={item.title}>
                    <dt className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</dt>
                    <dd className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.text}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* =========================== Sidebar =========================== */}
          <aside className="space-y-6 lg:sticky lg:top-20">
            <div id="purchase" className={`${PANEL} scroll-mt-24 p-5 sm:p-6`}>
              <p className="text-sm text-slate-500 dark:text-slate-400">{isFree ? 'Free access' : 'One-time payment'}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatPrice(series.basePrice)}</p>

              <div className="mt-5">
                {isFree ? (
                  <Link href="#tests" className={`${BTN_PRIMARY} w-full py-3`}>
                    Start practicing <ArrowRight size={15} />
                  </Link>
                ) : (
                  <SeriesCheckoutButton seriesId={series.id} seriesTitle={series.title} />
                )}
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {[`Full access to all ${mockTests.length} tests`, 'Detailed solutions & analytics', 'Access on web, mobile and tablet', 'No hidden charges'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />{item}</li>
                ))}
              </ul>
            </div>

            {similar.length > 0 && (
              <section className={PANEL}>
                <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                  <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">Similar test series</h2>
                  <Link href="/test-series" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">View all</Link>
                </header>
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {similar.map((s) => (
                    <li key={s.id}>
                      <Link href={`/test-series/${s.slug}`} className={`group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${FOCUS}`}>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{s.title}</span>
                          {s.testCount != null && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{s.testCount} tests</span>}
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>

        {/* Reviews + FAQs (components unchanged) */}
        <div id="reviews" className="mt-6 scroll-mt-24">
          <SeriesReviews seriesId={series.id} slug={slug} seriesTitle={series.title} isFree={isFree} />
        </div>
        <div id="faqs" className="mt-6 scroll-mt-24">
          <HomeFaq targetId={series.id} title={`FAQs`} subtitle={`Helpful answers about the ${series.title} test series.`} />
        </div>
      </div>
    </StudentShell>
  );
}