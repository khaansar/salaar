import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Clock, HelpCircle } from 'lucide-react';

import StudentShell from '../../../components/student/StudentShell';
import StartTestButton from '../../../features/catalog/StartTestButton';
import { testService } from '../../../services/testService';
import { formatDuration } from '../../../utils/format';

async function loadTest(slug) {
  try {
    return await testService.getMockTestStructureBySlug(slug);
  } catch (error) {
    if (error?.status === 404 || /: 404/.test(error?.message || '')) {
      return null;
    }

    throw error;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const test = await loadTest(slug).catch(() => null);

  return {
    title: test?.title ? `${test.title} | TestHub` : 'Mock Test | TestHub',
  };
}

export default async function MockTestPage({ params }) {
  const { slug } = await params;
  const test = await loadTest(slug);

  if (!test) {
    notFound();
  }

  const sections = Array.isArray(test.sections) ? test.sections : [];

  const totalQuestions = sections.reduce(
    (sum, section) => sum + (section.questions?.length || 0),
    0
  );

  const duration = formatDuration(test.durationMinutes);

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl pb-12">
        <Link
          href="/test-series"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={16} />
          All test series
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {test.title || 'Mock Test'}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            {duration && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                <Clock size={15} />
                {duration}
              </span>
            )}

            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
              <HelpCircle size={15} />
              {totalQuestions} questions
            </span>

            {test.totalMarks != null && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
                <Award size={15} />
                {test.totalMarks} marks
              </span>
            )}
          </div>

          {sections.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sections
              </h2>

              <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {sections.map((section) => (
                  <li
                    key={section.sectionId || section.title}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate font-medium text-slate-900 dark:text-white">
                      {section.title}
                    </span>

                    <span className="shrink-0 text-slate-500 dark:text-slate-400">
                      {section.questions?.length || 0} questions
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <StartTestButton
              testId={slug}
              durationMinutes={test.durationMinutes}
            />
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
