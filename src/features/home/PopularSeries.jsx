import Link from 'next/link';
import { ArrowRight, FileText, Clock, Layers3 } from 'lucide-react';

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} min`;
}

const BADGE = {
  popular: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  new: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  bestseller: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
  recommended: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};
const BADGE_DEFAULT = 'bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-300';

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

export default function PopularSeries({ series = [] }) {
  if (!Array.isArray(series) || series.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-series-heading"
      className="mb-10 sm:mb-12"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="featured-series-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Featured test series
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Popular, highly rated series to boost your preparation.
          </p>
        </div>
        <Link
          href="/test-series"
          className={`inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
        >
          View all test series <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((item) => {
          const duration = formatDuration(item.durationMinutes);
          const badgeStyle = BADGE[String(item.badge).toLowerCase()] || BADGE_DEFAULT;

          return (
            <li key={item.id} className="flex">
              <Link
                href={`/test-series/${item.slug}`}
                className={`group flex w-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-brand-600 ${focusRing} dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
                    <Layers3 size={20} aria-hidden="true" />
                  </span>
                  {item.badge && (
                    <span className={`truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyle}`}>
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-slate-900 dark:text-white">{item.title}</h3>
                {item.subtitle && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                )}

                {(item.testCount != null || duration) && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.testCount != null && (
                      <li className="flex items-center gap-1.5">
                        <FileText size={14} aria-hidden="true" /> {item.testCount} {item.testCount === 1 ? 'test' : 'tests'}
                      </li>
                    )}
                    {duration && (
                      <li className="flex items-center gap-1.5">
                        <Clock size={14} aria-hidden="true" /> {duration}
                      </li>
                    )}
                  </ul>
                )}

                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-brand-600 dark:border-slate-800 dark:text-indigo-400">
                    <span>View details</span>
                    <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}