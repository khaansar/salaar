'use client';

import { useState } from 'react';
import { Clock, Lock, Play, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { useAppSelector } from '../../hooks/useAppSelector';
import { useMyEntitlements } from '../catalog/useMyEntitlements';
import { hasActiveEntitlementForTest } from '../catalog/entitlementUtils';

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${minutes} min`;
}

export default function SeriesTestsTable({ tests = [], seriesId }) {
  const [showAll, setShowAll] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const { entitlements, isLoading, isError } = useMyEntitlements({ enabled: Boolean(user) });
  const rows = showAll ? tests : tests.slice(0, 5);

  if (!tests.length) {
    return (
      <div className="py-12 text-center">
        <p className="font-semibold text-slate-900 dark:text-white">No published tests yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          This series exists, but there are no published mock tests available right now.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800">
        {rows.map((test, index) => {
          const testId = test.testId || test.id;
          const free = test.isFree === true;
          const entitled = Boolean(user) && hasActiveEntitlementForTest(
            entitlements,
            { ...test, testId, seriesId }
          );
          const checking = Boolean(user) && isLoading;
          const locked = !free && (!user || !entitled || isError || checking);

          return (
            <div key={testId || index} className="flex flex-col gap-4 bg-white px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900 dark:hover:bg-slate-800/50">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{test.title}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {test.durationMinutes != null && <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" />{formatDuration(test.durationMinutes)}</span>}
                  <span>{test.totalMarks ?? 0} marks</span>
                  {free && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">FREE</span>}
                  {!free && locked && <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Lock size={11} /> LOCKED</span>}
                  {!free && !locked && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">UNLOCKED</span>}
                </div>
              </div>

              {locked ? (
                <button type="button" disabled aria-disabled="true"
                  title={isError ? 'Unable to verify access. Refresh and try again.' : 'Purchase this test or its series to unlock it.'}
                  className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 opacity-80 dark:bg-slate-800 dark:text-slate-400">
                  <Lock size={14} aria-hidden="true" />{checking ? 'Checking access…' : 'Start Test'}
                </button>
              ) : (
                <Link href={`/tests/${encodeURIComponent(test.slug || testId)}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
                  <Play size={14} />View test<ArrowRight size={14} />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {tests.length > 5 && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setShowAll((value) => !value)} className="inline-flex items-center gap-1.5 rounded-md border border-brand-600 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50">
            {showAll ? 'Show Fewer' : `View All ${tests.length} Tests`}
            <ChevronDown size={13} className={showAll ? 'rotate-180' : ''} />
          </button>
        </div>
      )}
    </>
  );
}
