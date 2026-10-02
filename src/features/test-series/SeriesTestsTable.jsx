import Link from 'next/link';
import { Clock, Play, ArrowRight } from 'lucide-react';

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} min`;
}

export default function SeriesTestsTable({ tests }) {
  if (!tests || tests.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-semibold text-slate-900 dark:text-white">
          No published tests yet
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          This series exists, but there are no published mock tests available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {tests.map((test, index) => (
        <div
          key={test.testId || index}
          className="flex flex-col gap-4 bg-white px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 dark:hover:bg-slate-800/50"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {test.title}
            </h3>

            <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              {test.durationMinutes != null && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  {formatDuration(test.durationMinutes)}
                </span>
              )}

              <span>{test.totalMarks ?? 0} marks</span>

              {test.isFree && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  FREE
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/tests/${test.slug}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
          >
            <Play size={14} />
            View test
            <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
}
