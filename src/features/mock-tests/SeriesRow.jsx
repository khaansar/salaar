import Link from 'next/link';
import { ArrowRight, CalendarCheck, Clock, FileText, Layers } from 'lucide-react';

const BADGE = {
  popular: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  new: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30',
  bestseller: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
};
const BADGE_DEFAULT = 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/40';

const fmt = (m) => (!m ? null : m % 60 === 0 ? `${m / 60} hr${m / 60 === 1 ? '' : 's'}` : `${m} min`);

// Real data from catalogService.getPopularSeries(). Price / discount / validity show only if the API returns them.
export default function SeriesRow({ series = [] }) {
  if (!series.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Popular test series</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Structured practice plans picked by other students.</p>
        </div>
        <Link href="/test-series" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {series.slice(0, 6).map((item) => {
          const duration = fmt(item.durationMinutes);
          const badgeKey = item.badge ? String(item.badge).toLowerCase() : '';
          const hasMeta = item.testCount != null || duration || item.validityMonths;

          return (
            <Link
              key={item.id}
              href={`/test-series/${item.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:focus-visible:ring-offset-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Layers size={20} strokeWidth={1.8} />
                </span>
                {item.badge && (
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE[badgeKey] || BADGE_DEFAULT}`}>{item.badge}</span>
                )}
              </div>

              <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-white">{item.title}</h3>
              {item.subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>}

              {hasMeta && (
                <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {item.testCount != null && <li className="flex items-center gap-2"><FileText size={14} className="text-slate-400" />{item.testCount} {Number(item.testCount) === 1 ? 'test' : 'tests'}</li>}
                  {duration && <li className="flex items-center gap-2"><Clock size={14} className="text-slate-400" />{duration}</li>}
                  {item.validityMonths && <li className="flex items-center gap-2"><CalendarCheck size={14} className="text-slate-400" />Valid for {item.validityMonths} months</li>}
                </ul>
              )}

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                  {item.price != null ? (
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">{Number(item.price) === 0 ? 'Free' : `₹${item.price}`}</span>
                      {item.originalPrice && <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>}
                      {item.discountPercent && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{item.discountPercent}% off</span>}
                    </p>
                  ) : <span />}
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    View details <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}