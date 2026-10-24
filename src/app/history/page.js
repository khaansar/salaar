'use client';

import { useEffect, useMemo, useState } from 'react';
import StudentShell from '../../components/student/StudentShell';
import apiClient from '../../lib/apiClient';
import Link from 'next/link';
import { Trophy, BookOpenCheck, CheckCircle2, Clock, XCircle, CircleAlert, Play, FileBarChart } from 'lucide-react';

/* Shared tokens, same light/dark pairs as the attempt review page */
const T = {
  surface: 'bg-white dark:bg-slate-900',
  border: 'border-slate-200 dark:border-slate-800',
  borderStrong: 'border-slate-300 dark:border-slate-700',
  text: 'text-slate-900 dark:text-slate-50',
  body: 'text-slate-700 dark:text-slate-300',
  muted: 'text-slate-500 dark:text-slate-400',
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900',
};

const BTN = `inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${T.focus}`;
const BTN_PRIMARY = `${BTN} bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:text-slate-950 dark:hover:bg-indigo-400`;
const BTN_NEUTRAL = `${BTN} border ${T.borderStrong} ${T.body} hover:bg-slate-100 dark:hover:bg-slate-800`;
const BTN_INDIGO = `${BTN} bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25`;
const BTN_EMERALD = `${BTN} bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25`;

const GRID =
  'md:grid md:grid-cols-[11rem_minmax(0,1fr)_9rem_auto] md:items-center md:gap-6 lg:grid-cols-[12rem_minmax(0,1.5fr)_minmax(0,1fr)_9rem_auto] xl:gap-10';

function Badge({ tone, icon: Icon, children }) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    red: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
    gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      <Icon size={13} aria-hidden />
      {children}
    </span>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className={`animate-pulse space-y-3 px-5 py-4 ${GRID}`}>
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </li>
      ))}
    </ul>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [testSlugs, setTestSlugs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/attempts-api/history?page=1&perPage=50');
        const attempts = Array.isArray(res) ? res : [];
        setHistory(attempts);

        const testIds = [
          ...new Set(attempts.map((attempt) => attempt.testId).filter(Boolean)),
        ];

        const resolvedSlugs = await Promise.all(
          testIds.map(async (testId) => {
            try {
              const test = await apiClient.get(
                `/tests-api/catalog/mock-tests/${encodeURIComponent(testId)}/structure`
              );
              const slug = test?.slug || test?.testSlug;
              return slug ? [testId, slug] : null;
            } catch {
              return null;
            }
          })
        );

        setTestSlugs(Object.fromEntries(resolvedSlugs.filter(Boolean)));
      } catch (err) {
        setError(err.message || 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge tone="green" icon={CheckCircle2}>Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge tone="blue" icon={Clock}>In Progress</Badge>;
      case 'EXPIRED':
        return <Badge tone="red" icon={XCircle}>Expired</Badge>;
      default:
        return <Badge tone="gray" icon={CircleAlert}>{status}</Badge>;
    }
  };

  const counts = useMemo(() => {
    const c = { ALL: history.length, SUBMITTED: 0, IN_PROGRESS: 0, EXPIRED: 0 };
    history.forEach((a) => {
      const k = String(a.status || '').toUpperCase();
      if (k in c) c[k] += 1;
    });
    return c;
  }, [history]);

  const visible = useMemo(
    () => (filter === 'ALL' ? history : history.filter((a) => String(a.status || '').toUpperCase() === filter)),
    [history, filter]
  );

  const TABS = [
    ['ALL', 'All'],
    ['SUBMITTED', 'Completed'],
    ['IN_PROGRESS', 'In progress'],
    ['EXPIRED', 'Expired'],
  ];

  return (
    <StudentShell>
      {/* Wide container with moderate side gutters: ~1536px cap, 24px on phones up to 56px on large screens */}
      <div className="mx-auto w-full max-w-[1536px] px-6 py-6 sm:px-8 lg:px-10 2xl:px-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${T.text}`}>Attempt History</h1>
            {!isLoading && !error && history.length > 0 && (
              <p className={`mt-1 text-sm ${T.muted}`}>
                {history.length} {history.length === 1 ? 'attempt' : 'attempts'} in total
              </p>
            )}
          </div>
          {!isLoading && !error && history.length > 0 && (
            <div
              className={`inline-flex flex-wrap gap-1 rounded-xl border p-1 ${T.border} ${T.surface}`}
              role="group"
              aria-label="Filter attempts by status"
            >
              {TABS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${T.focus} ${
                    filter === key
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-slate-950'
                      : `${T.body} hover:bg-slate-100 dark:hover:bg-slate-800`
                  }`}
                >
                  {label}
                  <span className="tabular-nums opacity-80">{counts[key]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className={`overflow-hidden rounded-2xl border ${T.border} ${T.surface}`} role="status">
            <span className="sr-only">Loading history...</span>
            <SkeletonRows />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${T.border} ${T.surface}`}>
            <h3 className={`mb-2 text-lg font-semibold ${T.text}`}>No attempts yet</h3>
            <p className={`mx-auto mb-6 max-w-md text-sm leading-6 ${T.muted}`}>
              You haven&apos;t taken any tests yet. Start a mock test to see your history here.
            </p>
            <Link href="/tests" className={`${BTN_PRIMARY} px-4 py-2`}>
              Browse Mock Tests
            </Link>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border ${T.border} ${T.surface}`}>
            <div
              className={`hidden border-b bg-slate-50 px-5 py-3 text-sm font-semibold dark:bg-slate-950/50 ${T.border} ${T.muted} ${GRID}`}
              aria-hidden
            >
              <span>Date</span>
              <span>Mock Test</span>
              <span className="hidden lg:block lg:order-3">Category</span>
              <span className="lg:order-4">Status</span>
              <span className="text-right lg:order-5">Action</span>
            </div>

            {visible.length === 0 && (
              <p className={`px-5 py-10 text-center text-sm ${T.muted}`}>No attempts with this status.</p>
            )}
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {visible.map((attempt) => {
                const attemptId = attempt.attemptId || attempt.id;
                const testSlug =
                  attempt.testSlug ||
                  attempt.slug ||
                  attempt.test?.slug ||
                  testSlugs[attempt.testId];

                const status = String(attempt.status || '').toUpperCase();
                const isInProgress = status === 'IN_PROGRESS';
                const isCompleted = status === 'SUBMITTED' || status === 'EXPIRED';

                return (
                  <li
                    key={attemptId}
                    className={`px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${GRID}`}
                  >
                    {/* Mobile: status sits beside the date; desktop: its own column */}
                    <div className="flex items-center justify-between gap-3 md:contents">
                      <p className={`text-sm tabular-nums ${T.body}`}>
                        <span className="sr-only">Date: </span>
                        {formatDate(attempt.startedAt || attempt.createdAt)}
                      </p>
                      <div className="md:order-3 lg:order-4">{getStatusBadge(attempt.status)}</div>
                    </div>

                    <div className="mt-2 min-w-0 md:order-2 md:mt-0">
                      <p className={`truncate text-base font-semibold ${T.text}`}>
                        {attempt.testName || 'Unknown Test'}
                      </p>
                      <p className={`truncate text-sm lg:hidden ${T.muted}`}>
                        {attempt.categoryName || 'Unknown Category'}
                      </p>
                    </div>

                    <p className={`hidden truncate text-sm lg:order-3 lg:block ${T.body}`}>
                      {attempt.categoryName || 'Unknown Category'}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 md:order-4 md:mt-0 md:justify-end lg:order-5">
                      {testSlug && !isInProgress && (
                        <Link href={`/leaderboard/${encodeURIComponent(testSlug)}`} className={BTN_INDIGO}>
                          <Trophy size={14} aria-hidden />
                          Ranks
                        </Link>
                      )}

                      {isInProgress ? (
                        <Link href={`/attempt/${encodeURIComponent(attemptId)}`} className={BTN_PRIMARY}>
                          <Play size={14} aria-hidden />
                          Resume
                        </Link>
                      ) : (
                        <>
                          <Link href={`/attempt/${encodeURIComponent(attemptId)}/result`} className={BTN_NEUTRAL}>
                            <FileBarChart size={14} aria-hidden />
                            View Result
                          </Link>

                          {isCompleted && (
                            <Link href={`/attempt/${encodeURIComponent(attemptId)}/review`} className={BTN_EMERALD}>
                              <BookOpenCheck size={14} aria-hidden />
                              Review answers
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </StudentShell>
  );
}