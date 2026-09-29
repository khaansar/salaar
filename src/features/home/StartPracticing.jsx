'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Clock,
  Award,
  Rocket,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

import { useRequireAuth } from '../../hooks/useRequireAuth';
import { attemptService } from '../../services/attemptService';
import { formatDuration } from '../../utils/format';
import { useToast } from '../../components/common/ToastProvider';

export default function StartPracticing({ tests = [] }) {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const toast = useToast();

  const [startingTestId, setStartingTestId] = useState(null);

  const handleStartTest = requireAuth(
    async (testId, durationMinutes) => {
      if (startingTestId) {
        return;
      }

      setStartingTestId(testId);

      try {
        const attempt = await attemptService.startAttempt(
          testId,
          durationMinutes || 180
        );

        if (!attempt?.attemptId) {
          throw new Error(
            'The server did not return an attempt ID.'
          );
        }

        router.push(
          `/attempt/${attempt.attemptId}`
        );
      } catch (error) {
        console.error(
          'Failed to start test',
          error
        );

        toast.error(
          error?.message ||
            'Unable to start the test. Please try again.'
        );
      } finally {
        setStartingTestId(null);
      }
    }
  );

  if (!Array.isArray(tests) || tests.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <Rocket
              className="text-indigo-600 dark:text-indigo-400"
              size={24}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tests.map((test) => {
          const isStarting =
            startingTestId === test.id;

          return (
            <div
              key={test.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="mb-4">
                <span className="inline-flex max-w-full truncate rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {test.categoryName ||
                    'Mock Test'}
                </span>
              </div>

              <h3 className="mb-5 line-clamp-2 min-h-[3rem] font-bold leading-6 text-slate-900 dark:text-white">
                {test.title}
              </h3>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
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

              <button
                type="button"
                disabled={isStarting}
                onClick={() =>
                  handleStartTest(
                    test.id,
                    test.durationMinutes
                  )
                }
                className="mt-auto flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <Loader2
                      size={16}
                      className="mr-2 animate-spin"
                    />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Test
                    <ArrowRight
                      className="ml-1.5"
                      size={16}
                    />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}