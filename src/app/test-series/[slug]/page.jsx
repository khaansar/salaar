import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  Layers3,
  Play,
} from 'lucide-react';

import StudentShell from '../../../components/student/StudentShell';
import { testService } from '../../../services/testService';

function formatPrice(value) {
  if (!value || Number(value) === 0) {
    return 'Free';
  }

  return `₹${Number(value).toLocaleString('en-IN')}`;
}

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

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  try {
    const series =
      await testService.getSeriesBySlug(slug);

    return {
      title: `${series.title} | TestHub`,
      description: `Practice mock tests from ${series.title}.`,
    };
  } catch {
    return {
      title: 'Test Series | TestHub',
    };
  }
}

export default async function TestSeriesPage({
  params,
}) {
  const { slug } = await params;

  let series;

  try {
    series =
      await testService.getSeriesBySlug(slug);
  } catch (error) {
    if (error?.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!series) {
    notFound();
  }

  const mockTests = Array.isArray(
    series.mockTests
  )
    ? series.mockTests
    : [];

  return (
    <StudentShell>
      <div className="pb-12">
        <Link
          href="/test-series"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={16} />
          All test series
        </Link>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-8 dark:from-indigo-950/40 dark:via-slate-950 dark:to-violet-950/30 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {series.categoryName ||
                  'Test Series'}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {series.title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-800">
                  <FileText size={15} />
                  {mockTests.length} tests
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-800">
                  <Layers3 size={15} />
                  {formatPrice(series.basePrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800">
            {mockTests.length === 0 ? (
              <div className="px-6 py-16 text-center sm:px-8">
                <p className="font-semibold text-slate-900 dark:text-white">
                  No published tests yet
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  This series exists, but there
                  are no published mock tests
                  available right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockTests.map((test) => (
                  <div
                    key={test.testId}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {test.title}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {test.durationMinutes !=
                          null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={14} />
                            {formatDuration(
                              test.durationMinutes
                            )}
                          </span>
                        )}

                        <span>
                          {test.totalMarks ??
                            0}{' '}
                          marks
                        </span>

                        {test.isFree && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Free
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/tests/${test.slug}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                    >
                      <Play size={15} />
                      View test
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </StudentShell>
  );
}