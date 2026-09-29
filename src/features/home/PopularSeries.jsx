import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

function formatDuration(minutes) {
  if (!minutes) {
    return null;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;

    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }

  return `${minutes} min`;
}

export default function PopularSeries({ series = [] }) {
  if (!Array.isArray(series) || series.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              Popular Test Series
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Build consistency with structured practice.
          </p>
        </div>

        <Link
          href="/test-series"
          className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 sm:inline-flex"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series.map((item) => (
          <Link
            key={item.id}
            href={`/test-series/${item.id}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40"
          >
            <div className="flex flex-1 flex-col p-4">
              {item.badge && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
              <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950 dark:text-white">
                {item.title}
              </h3>

              <div className="mt-auto pt-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {item.testCount != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <FileText size={14} />
                      {item.testCount} tests
                    </span>
                  )}

                  {item.durationMinutes != null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatDuration(item.durationMinutes)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    View series
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/test-series"
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 sm:hidden"
      >
        View all test series
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
