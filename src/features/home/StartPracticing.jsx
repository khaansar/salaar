'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  ArrowRight,
  Clock,
  Award,
  Rocket,
} from 'lucide-react';

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
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Rocket
              className="text-indigo-600 dark:text-indigo-400"
              size={18}
            />
            Start Practicing
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Handpicked mock tests to get you started.
          </p>
        </div>

        <Link
          href="/tests"
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        {tests.map((test) => {
          const hasAttempted = test.hasAttempted === true || Number(test.attemptCount ?? test.totalAttempts ?? 0) > 0 || attemptedTestIds.has(String(test.id)) || undefined;

          return (
            <div
              key={test.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-4">
                <span className="inline-flex max-w-full truncate rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {test.categoryName ||
                    'Mock Test'}
                </span>
              </div>

              <h3 className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                {test.title}
              </h3>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />

                  {formatDuration(test.durationMinutes) ||
                    '0 min'}
                </span>

                <span className="flex items-center gap-1.5">
                  <Award size={14} />
                  {test.totalMarks ?? 0} marks
                </span>
              </div>

              <div className="mt-auto">
                <StartTestButton
                  testId={test.id}
                  variant="home"
                  isFree={test.isFree === true}
                  hasAttempted={hasAttempted}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
