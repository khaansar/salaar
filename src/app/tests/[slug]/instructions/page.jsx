import Link from 'next/link';
import { cookies } from 'next/headers';
import { fetchWithCache } from '@/lib/cache';
import InstructionsClient from './InstructionsClient';
import { siteConfig } from '@/config/site';

export const metadata = {
  title: siteConfig.formatTitle('Test Instructions'),
};

/* ---------- small presentational helpers ---------- */

const ICONS = {
  clock: 'M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  cursor: 'M5 3l14 7-6 2-2 6L5 3z',
  save: 'M5 13l4 4L19 7',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  alert: 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function Fact({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon name={icon} />
      </span>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-base font-bold text-slate-900 leading-tight">{value}</div>
      </div>
    </div>
  );
}

function RuleCard({ icon, title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="space-y-2.5 text-[15px] leading-relaxed text-slate-700">{children}</ul>
    </section>
  );
}

function Rule({ children, key_ = false }) {
  return (
    <li className="flex gap-3">
      <span
        className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${key_ ? 'bg-amber-500' : 'bg-slate-300'}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}

function Progress({ stage }) {
  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex gap-1.5" aria-hidden="true">
        {[1, 2].map((n) => (
          <span key={n} className={`h-1.5 w-14 rounded-full ${n <= stage ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        ))}
      </div>
      <span className="text-sm text-slate-600">
        Step {stage} of 2 · <span className="font-semibold text-slate-900">{stage === 1 ? 'This test' : 'Platform rules'}</span>
      </span>
    </div>
  );
}

const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600';
const btnSecondary =
  'inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400';

/* ---------- page ---------- */

export default async function InstructionsPage({ params, searchParams }) {
  const { slug } = await params;
  const { step } = (await searchParams) || {};

  let testDetails = null;
  let hasError = false;

  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(slug);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ACCESS_TOKEN')?.value;

    const endpoint = isUuid
      ? `/tests-api/catalog/mock-tests/${slug}/structure`
      : `/tests-api/catalog/mock-tests/slug/${slug}/structure`;

    const res = await fetchWithCache(
      endpoint,
      {
        revalidate: 0, // No cache for authenticated user requests
        headers: token ? { Cookie: `ACCESS_TOKEN=${token}` } : {},
      }
    );

    testDetails = res;
  } catch (error) {
    console.error('Failed to load test structure for instructions on server:', error.message);
    hasError = true;
  }

  if (hasError || !testDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Icon name="alert" className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-bold text-slate-900 mb-2">We couldn&apos;t load this test</h1>
          <p className="text-sm text-slate-600">
            Check that the link is correct, then reload the page. If it keeps failing, contact support.
          </p>
        </div>
      </div>
    );
  }

  const durationMinutes = testDetails.durationMinutes || 180;
  const totalQuestions = testDetails.sections?.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0) || 0;
  const sectionCount = testDetails.sections?.length || 0;

  // Two stages only when the test has its own instructions; otherwise a single stage
  const hasTwoStages = Boolean(testDetails.instructions);
  const stage = hasTwoStages && step === '2' ? 2 : 1;
  const showTestInstructions = hasTwoStages && stage === 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <h1 className="text-base font-bold text-slate-900">General Instructions</h1>
          {hasTwoStages && <Progress stage={stage} />}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-8">
        {/* Test hero */}
        <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {testDetails.title || 'Mock Test'}
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-slate-100">
            <Fact icon="clock" label="Duration" value={formatDuration(durationMinutes)} />
            <Fact icon="list" label="Total questions" value={totalQuestions} />
            {sectionCount > 0 && <Fact icon="layers" label="Sections" value={sectionCount} />}
          </div>
        </section>

        {/* Stage 1: test-specific instructions */}
        {showTestInstructions && (
          <section className="rounded-2xl border border-indigo-200 bg-white overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <h3 className="text-lg font-bold text-slate-900">Read these instructions for this test</h3>
              <p className="text-sm text-slate-600 mt-0.5">They apply only to this test and may differ from other tests.</p>
            </div>
            <div className="px-6 py-6 whitespace-pre-wrap text-base leading-7 text-slate-800 max-w-[70ch]">
              {testDetails.instructions}
            </div>
          </section>
        )}

        {/* Stage 2 (or the only stage): platform rules */}
        {!showTestInstructions && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Icon name="expand" />
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-900">Stay in fullscreen</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-amber-900">
                  Leaving the fullscreen window may submit your test automatically. Don&apos;t press F5 or refresh the
                  page during the exam.
                </p>
              </div>
            </div>

            <RuleCard icon="clock" title="Timing">
              <Rule>The clock runs on our server. The countdown in the top right shows the time you have left.</Rule>
              <Rule>When the timer reaches zero, your test ends by itself. You don&apos;t need to submit it.</Rule>
            </RuleCard>

            <RuleCard icon="compass" title="Moving around">
              <Rule>The test has several sections. Switch between them using the top navigation bar.</Rule>
            </RuleCard>

            <RuleCard icon="cursor" title="Answering questions" className="md:col-span-2">
              <Rule>To choose an answer, click one of the options.</Rule>
              <Rule>To change your answer, click a different option.</Rule>
              <Rule>To remove your answer, click the chosen option again or use <em>Clear Response</em>.</Rule>
              <Rule key_>
                Your answer is only saved when you click <strong className="text-slate-900">Save &amp; Next</strong>.
              </Rule>
            </RuleCard>
          </div>
        )}
      </main>

      {/* Sticky action bar */}
      <footer className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4">
          {showTestInstructions ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500 hidden sm:block">Next: platform rules before you start.</p>
              <Link href="?step=2" className={`${btnPrimary} w-full sm:w-auto`}>
                Continue to platform rules
              </Link>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
              {hasTwoStages && (
                <Link href="?step=1" className={btnSecondary}>
                  Back
                </Link>
              )}
              <div className="flex-1">
                <InstructionsClient
                  testId={testDetails?.id || testDetails?.testId}
                  durationMinutes={durationMinutes}
                  disabled={false}
                />
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}