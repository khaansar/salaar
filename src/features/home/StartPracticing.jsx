'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, Clock, Award, FileText } from 'lucide-react';

import { formatDuration } from '../../utils/format';
import StartTestButton from '../catalog/StartTestButton';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useGetAttemptHistoryQuery } from '../../store/userApi';

function getAttemptRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.content)) return response.content;
  return [];
}

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

export default function StartPracticing({ tests = [] }) {
  const { user } = useAppSelector((state) => state.auth);
  const { data: attemptHistory } = useGetAttemptHistoryQuery(
    { page: 1, perPage: 50 },
    { skip: !user }
  );
  const attemptedTestIds = useMemo(
    () => new Set(getAttemptRecords(attemptHistory).map((attempt) => String(attempt.testId))),
    [attemptHistory]
  );

  if (!Array.isArray(tests) || tests.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="start-practicing-heading"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="start-practicing-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Start practicing
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Handpicked mock tests to get you started.
          </p>
        </div>

        <Link
          href="/tests"
          className={`inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 ${focusRing}`}
        >
          View all tests <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        {tests.map((test) => {
          const hasAttempted =
            test.hasAttempted === true ||
            Number(test.attemptCount ?? test.totalAttempts ?? 0) > 0 ||
            attemptedTestIds.has(String(test.id)) ||
            undefined;

          return (
            <li
              key={test.id}
              className="flex flex-col rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 dark:border-zinc-800/60 dark:bg-[#18191d]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-2xs dark:bg-zinc-800 dark:text-brand-400">
                  <FileText size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0 truncate rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs dark:bg-zinc-800 dark:text-slate-300">
                  {test.categoryName || 'Mock test'}
                </span>
              </div>

              <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-slate-900 dark:text-white">
                {test.title}
              </h3>

              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden="true" />
                  {formatDuration(test.durationMinutes) || '0 min'}
                </li>
                <li className="flex items-center gap-1.5">
                  <Award size={14} aria-hidden="true" />
                  {test.totalMarks ?? 0} marks
                </li>
              </ul>

              <div className="mt-auto pt-4">
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <StartTestButton
                    testId={test.id}
                    variant="home"
                    isFree={test.isFree === true}
                    hasAttempted={hasAttempted}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}