import { ChevronLeft, ChevronRight, Clock, HelpCircle } from 'lucide-react';
import StartTestButton from '../catalog/StartTestButton';

function AccessBadge({ isFree }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${isFree ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30'}`}>
      {isFree ? 'Free' : 'Paid'}
    </span>
  );
}

function TestCard({ test }) {
  const title = test.title || 'Untitled Test';
  const seriesName = test.type || test.categoryName || 'Practice Test';
  const minutes = test.durationMinutes || 0;
  // Falls back to totalMarks as before when the API has no explicit question count
  const questionCount = test.totalQuestions ?? test.questionCount ?? (test.totalMarks ? Math.floor(test.totalMarks) : 0);
  const isFree = test.free === true;
  const hasAttempted = test.hasAttempted === true ||
    Number(test.attemptCount ?? test.totalAttempts ?? 0) > 0 || undefined;

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{seriesName}</p>
        <AccessBadge isFree={isFree} />
      </div>

      <h3 className="mt-2 line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-slate-900 dark:text-white">{title}</h3>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        <li className="flex items-center gap-1.5"><HelpCircle size={14} className="text-slate-400" />{questionCount} questions</li>
        <li className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" />{minutes} min</li>
      </ul>

      <div className="mt-auto pt-5">
        <StartTestButton
          testId={test.id || test.testId}
          testSlug={test.slug}
          seriesId={test.seriesId || test.parentSeriesId}
          isFree={isFree}
          variant="outline"
          hasAccessCode={Boolean(test.hasAccessCode || test.accessCode)}
          hasAttempted={hasAttempted}
        />
      </div>
    </article>
  );
}

export default function TestExplorer({
  tests = [],
  isFetching,
  hasError = false,
  page,
  pages,
  onPage,
  onReset,
}) {
  const nums = Array.from({ length: pages || 1 }, (_, index) => index + 1)
    .filter((number) => Math.abs(number - page) <= 2 || number === 1 || number === pages);

  const pageBtn = 'flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Explore tests</h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Use the filters to find tests for your exam.</p>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-5 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-6 h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Unable to load tests</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Something went wrong. Please try again.</p>
          <button type="button" onClick={onReset} className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Reset filters</button>
        </div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No tests match your filters</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different search or category.</p>
          <button type="button" onClick={onReset} className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => <TestCard key={test.id || test.testId} test={test} />)}
        </div>
      )}

      {pages > 1 && !isFetching && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1.5">
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)} className={`${pageBtn} border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800`}>
            <ChevronLeft size={16} />
          </button>
          {nums.map((number) => (
            <button
              key={number}
              type="button"
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onPage(number)}
              className={`${pageBtn} ${number === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {number}
            </button>
          ))}
          <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => onPage(page + 1)} className={`${pageBtn} border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800`}>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  );
}