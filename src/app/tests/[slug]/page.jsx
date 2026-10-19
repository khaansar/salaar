import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, Clock, HelpCircle } from 'lucide-react';

import StudentShell from '../../../components/student/StudentShell';
import StartTestButton from '../../../features/catalog/StartTestButton';
import { testService } from '../../../services/testService';
import { formatDuration } from '../../../utils/format';
import { siteConfig } from '../../../config/site';

async function loadTest(slug) {
  try {
    return await testService.getMockTestStructureBySlug(slug);
  } catch (error) {
    if (error?.status === 404 || /: 404/.test(error?.message || '')) return null;
    throw error;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const test = await loadTest(slug).catch(() => null);

  if (!test) {
    return {
      title: siteConfig.formatTitle('Mock Test'),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = test.title || 'Mock Test';
  const description =
    test.description ||
    `Practice ${title} and prepare with exam-style questions.`;

  return {
    title: siteConfig.formatTitle(title),
    description,
    alternates: {
      canonical: `/tests/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      ...(siteConfig.url
        ? {
            url: new URL(
              `/tests/${encodeURIComponent(slug)}`,
              `${siteConfig.url}/`
            ).toString(),
          }
        : {}),
      siteName: siteConfig.name || 'Salaar',
    },
  };
}

export default async function MockTestPage({ params }) {
  const { slug } = await params;
  const test = await loadTest(slug);
  if (!test) notFound();

  const sections = Array.isArray(test.sections) ? test.sections : [];
  const totalQuestions = sections.reduce((sum, section) => sum + (section.questions?.length || 0), 0);
  const duration = formatDuration(test.durationMinutes);
  const testId = test.testId || test.id || slug;
  const seriesId = test.seriesId || test.parentSeriesId || null;

  return (
    <StudentShell>
      <div className="mx-auto max-w-3xl pb-12">
        <Link href="/test-series" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
          <ArrowLeft size={16} />All test series
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{test.title || 'Mock Test'}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            {duration && <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"><Clock size={15} />{duration}</span>}
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"><HelpCircle size={15} />{totalQuestions} questions</span>
            {test.totalMarks != null && <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"><Award size={15} />{test.totalMarks} marks</span>}
          </div>

          {sections.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sections</h2>
              <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {sections.map((section) => (
                  <li key={section.sectionId || section.title} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-slate-900 dark:text-white">{section.title}</span>
                    <span className="shrink-0 text-slate-500 dark:text-slate-400">{section.questions?.length || 0} questions</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <StartTestButton
              testId={testId}
              testSlug={test.slug || slug}
              seriesId={seriesId}
              isFree={test.isFree === true}
              hasAccessCode={Boolean(test.hasAccessCode || test.accessCode)}
              hasAttempted={test.hasAttempted === true || Number(test.attemptCount ?? test.totalAttempts ?? 0) > 0 || undefined}
            />
            {test.isFree === false && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Paid test access is checked against your active test or test-series entitlement.</p>}
          </div>
        </section>
      </div>
    </StudentShell>
  );
}
