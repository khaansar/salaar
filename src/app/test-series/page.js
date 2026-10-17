import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Layers3 } from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';
import { testService } from '../../services/testService';
import { catalogService } from '../../services/catalogService';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Test Series'),
  description:
    'Explore exam test series and practice structured mock tests for your target exam.',
  alternates: {
    canonical: '/test-series',
  },
};

// Needs the API at request time, so don't try to prerender it during `next build`.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function toList(data) {
  return Array.isArray(data) ? data : [];
}

function isFree(value) {
  return !value || Number(value) === 0;
}

function formatPrice(value) {
  if (isFree(value)) return 'Free';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

export default async function TestSeriesIndexPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params?.page, 10) || 1);
  const category = params?.category || '';

  let series = [];
  let categories = [];
  let failed = false;

  try {
    const [seriesData, categoryData] = await Promise.all([
      testService.getPublishedSeries(page, PAGE_SIZE),
      catalogService.getCategories().catch(() => []),
    ]);

    series = toList(seriesData);
    categories = Array.isArray(categoryData) ? categoryData : [];
  } catch (error) {
    console.error('Failed to load test series:', error);
    failed = true;
  }

  const visible = category
    ? series.filter(
        (item) => item.categorySlug === category || slugify(item.categoryName) === category
      )
    : series;

  const hasNext = series.length >= PAGE_SIZE;

  const pageHref = (target) => {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (target > 1) query.set('page', String(target));
    const qs = query.toString();

    return qs ? `/test-series?${qs}` : '/test-series';
  };

  const pill = (active) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${focusRing} ${
      active
        ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-600 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:text-white'
    }`;

  const pager = `inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-600 hover:text-brand-600 ${focusRing} dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white`;

  return (
    <StudentShell>
      <div className="pb-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-white">Home</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-200">Test series</span>
        </nav>

        {/* Header */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-white to-brand-50 px-6 py-8 sm:px-10 sm:py-10 dark:border-slate-800 dark:bg-slate-900 dark:bg-none">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-brand-100 dark:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 hidden h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl dark:block" />

          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Test series
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base sm:leading-7">
              Structured practice, one series at a time. Pick a series for your exam and work through its mock tests.
            </p>
          </div>
        </section>

        {/* Category filter */}
        {categories.length > 0 && (
          <nav
            aria-label="Filter by category"
            className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap sm:overflow-visible"
          >
            <Link href="/test-series" aria-current={!category ? 'true' : undefined} className={pill(!category)}>
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
                aria-current={category === cat.slug ? 'true' : undefined}
                className={pill(category === cat.slug)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}

        {failed ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            We couldn&apos;t load test series right now. Please try again in a moment.
          </p>
        ) : visible.length === 0 ? (
          <div className="mx-auto mt-10 flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
              <Layers3 size={24} aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold text-slate-900 dark:text-white">No test series found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {category ? 'There are no series in this category yet.' : 'Check back soon for new series.'}
            </p>
            {category && (
              <Link href="/test-series" className={`mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}>
                View all series
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((item) => {
              const testCount = item.testCount ?? item.mockTests?.length;
              const free = isFree(item.basePrice);

              return (
                <li key={item.id} className="flex">
                  <Link
                    href={`/test-series/${item.slug}`}
                    className={`group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-600 ${focusRing} dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
                        <Layers3 size={20} aria-hidden="true" />
                      </span>
                      <span className="truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {item.categoryName || 'Test series'}
                      </span>
                    </div>

                    <h2 className="mt-4 line-clamp-2 text-base font-bold leading-6 text-slate-900 dark:text-white">
                      {item.title}
                    </h2>

                    {testCount != null && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <FileText size={15} aria-hidden="true" />
                        {testCount} {testCount === 1 ? 'test' : 'tests'}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span
                        className={`text-base font-extrabold ${
                          free ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatPrice(item.basePrice)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-indigo-400">
                        View details
                        <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!failed && (page > 1 || hasNext) && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-between">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={pager}>
                <ChevronLeft size={14} aria-hidden="true" /> Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Page {page}</span>
            {hasNext ? (
              <Link href={pageHref(page + 1)} className={pager}>
                Next <ChevronRight size={14} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </StudentShell>
  );
}