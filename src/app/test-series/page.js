import Link from 'next/link';
import { ArrowRight, ChevronRight, FileText, Layers3, Landmark, TrainFront, MapPin } from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';
import { testService } from '../../services/testService';
import { catalogService } from '../../services/catalogService';

export const metadata = {
  title: 'Test Series | ClearIt',
  description: 'Comprehensive mock tests and real exam practice platform.',
};

// Needs the API at request time, so don't try to prerender it during `next build`.
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

const ICONS = [
  { Icon: Landmark, color: 'text-emerald-600' },
  { Icon: TrainFront, color: 'text-rose-500' },
  { Icon: Landmark, color: 'text-amber-500' },
  { Icon: MapPin, color: 'text-blue-500' },
];

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
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'border-brand-600 bg-brand-600 text-white'
        : 'border-slate-200 bg-white text-slate-600 hover:border-brand-600 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
    }`;

  const pager = 'rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';

  return (
    <StudentShell>
      <div className="pb-12">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-slate-700">Test Series</span>
        </nav>

        <section className="mb-6 rounded-3xl border border-white/60 bg-gradient-to-br from-white via-[#f6f4ff] to-[#ebe7ff] px-6 py-8 sm:px-10 dark:border-white/5 dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/40">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Test <span className="text-brand-600">Series</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Structured practice, one series at a time.
          </p>
        </section>

        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/test-series" className={pill(!category)}>All</Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
                className={pill(category === cat.slug)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {failed ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            We couldn&apos;t load test series right now. Please try again in a moment.
          </p>
        ) : visible.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-semibold text-slate-900 dark:text-white">No test series found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((item, i) => {
              const testCount = item.testCount ?? item.mockTests?.length;
              const { Icon, color } = ICONS[i % ICONS.length];

              return (
                <Link
                  key={item.id}
                  href={`/test-series/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <Icon size={28} className={color} strokeWidth={1.8} />
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                      {item.categoryName || 'Test Series'}
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{item.title}</h2>

                  <ul className="mt-4 space-y-2 text-xs text-slate-500">
                    {testCount != null && (
                      <li className="flex items-center gap-2"><FileText size={14} /> {testCount} Tests</li>
                    )}
                    <li className="flex items-center gap-2"><Layers3 size={14} /> {formatPrice(item.basePrice)}</li>
                  </ul>

                  <span className="mt-auto pt-4">
                    <span className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand-600 py-2 text-xs font-semibold text-brand-600 group-hover:bg-brand-50">
                      View Details <ArrowRight size={13} />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {!failed && (page > 1 || hasNext) && (
          <div className="mt-10 flex items-center justify-between">
            {page > 1 ? <Link href={pageHref(page - 1)} className={pager}>Previous</Link> : <span />}
            {hasNext && <Link href={pageHref(page + 1)} className={pager}>Next</Link>}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
