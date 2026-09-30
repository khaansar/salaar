import Link from 'next/link';
import { ArrowRight, FileText, Layers3 } from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';
import { testService } from '../../services/testService';
import { catalogService } from '../../services/catalogService';

export const metadata = {
  title: 'Test Series | TestHub',
  description: 'Structured mock test series for your exam.',
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

function formatPrice(value) {
  if (!value || Number(value) === 0) return 'Free';

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

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
        (item) =>
          item.categorySlug === category ||
          slugify(item.categoryName) === category
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

  return (
    <StudentShell>
      <div className="pb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Test Series
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Structured practice, one series at a time.
        </p>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/test-series"
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                !category
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              All
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  category === cat.slug
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {failed ? (
          <p className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            We couldn&apos;t load test series right now. Please try again in a moment.
          </p>
        ) : visible.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-semibold text-slate-900 dark:text-white">
              No test series found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try a different category.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => {
              const testCount =
                item.testCount ?? item.mockTests?.length;

              return (
                <Link
                  key={item.id}
                  href={`/test-series/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40"
                >
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.categoryName || 'Test Series'}
                  </span>

                  <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-slate-950 dark:text-white">
                    {item.title}
                  </h2>

                  <div className="mt-auto flex items-center justify-between pt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {testCount != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <FileText size={14} />
                          {testCount} tests
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5">
                        <Layers3 size={14} />
                        {formatPrice(item.basePrice)}
                      </span>
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-slate-400 transition-colors group-hover:text-indigo-600"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!failed && (page > 1 || hasNext) && (
          <div className="mt-10 flex items-center justify-between">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Previous
              </Link>
            ) : (
              <span />
            )}

            {hasNext && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
