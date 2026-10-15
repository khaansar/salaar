'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ChevronRight, LoaderCircle, RefreshCw } from 'lucide-react';
import StudentShell from '../../components/student/StudentShell';
import apiClient, { apiClientRaw } from '../../lib/apiClient';

const PAGE_SIZE = 50;

/* ------------------------------------------------------------------ */
/*  Data helpers (UNCHANGED)                                           */
/* ------------------------------------------------------------------ */

function getAttemptId(attempt) {
  return attempt?.attemptId || attempt?.id || '';
}

function getAttemptName(attempt) {
  return attempt?.testName || attempt?.testTitle || attempt?.test?.title || 'Untitled test';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getInitialRemainingSeconds(attempt) {
  const value = attempt?.remainingSeconds;
  if (value === null || value === undefined || value === '') return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : null;
}

function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return [Math.floor(safeSeconds / 3600), Math.floor((safeSeconds % 3600) / 60), safeSeconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
}

function unwrapPayload(response) {
  let value = response;
  for (let i = 0; i < 3 && value && !Array.isArray(value); i += 1) {
    if (Array.isArray(value.content) || Array.isArray(value.items)) return value;
    if (value.data !== undefined) value = value.data;
    else break;
  }
  return value;
}

function readList(response) {
  const payload = unwrapPayload(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function readTotalPages(response, fallback = 1) {
  const candidates = [response?.meta?.pagination?.total_pages, response?.meta?.total_pages, response?.totalPages, response?.data?.totalPages, response?.data?.data?.totalPages, response?.data?.meta?.pagination?.total_pages];
  const value = candidates.find((candidate) => Number.isFinite(Number(candidate)) && Number(candidate) >= 0);
  return value === undefined ? fallback : Math.max(1, Number(value));
}

function getSeriesId(series) {
  return String(series?.id || series?.seriesId || series?.productReferenceId || '');
}

function getSeriesTitle(series) {
  return series?.title || series?.name || series?.seriesName || 'Untitled test series';
}

function isFreeSeries(series) {
  const price = series?.basePrice ?? series?.price ?? series?.priceAmount;
  return series?.isFree === true || series?.free === true || (price !== null && price !== undefined && price !== '' && Number(price) <= 0);
}

function hasActiveSeriesEntitlement(entitlements, series) {
  const id = getSeriesId(series);
  if (!id) return false;
  const now = Date.now();
  return entitlements.some((entitlement) => {
    if (String(entitlement?.status || '').toUpperCase() !== 'ACTIVE') return false;
    if (String(entitlement?.productType || '').toUpperCase() !== 'TEST_SERIES') return false;
    if (String(entitlement?.productReferenceId || '') !== id) return false;
    if (entitlement?.expiresAt) {
      const expiry = Date.parse(entitlement.expiresAt);
      if (Number.isFinite(expiry) && expiry <= now) return false;
    }
    return true;
  });
}

function getSeriesHref(series) {
  return `/test-series/${encodeURIComponent(series?.slug || getSeriesId(series))}`;
}

/* ------------------------------------------------------------------ */
/*  Shared UI                                                          */
/* ------------------------------------------------------------------ */

const PANEL = 'rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900';
const FOCUS = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
const BTN_PRIMARY = `inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 ${FOCUS}`;
const BTN_SECONDARY = `inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${FOCUS}`;

function Panel({ title, description, action, children }) {
  return (
    <section className={PANEL}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className={`${PANEL} px-5 py-4`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/5">
        <p className="text-sm text-rose-700 dark:text-rose-300">{message}</p>
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-700 hover:underline dark:text-rose-300"><RefreshCw size={14} />Try again</button>
      </div>
    </div>
  );
}

function AccessBadge({ isFree }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${isFree ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' : 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30'}`}>
      {isFree ? 'Free' : 'Unlocked'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Series row                                                         */
/* ------------------------------------------------------------------ */

function SeriesRow({ series }) {
  const isFree = series.accessType === 'FREE';
  const title = getSeriesTitle(series);
  const category = series.categoryName || series.category?.name || series.category?.title || 'Test series';
  const description = series.description || series.shortDescription || series.subtitle || (isFree ? 'Build exam readiness with focused practice.' : 'Your access is ready. Keep building confidence with focused practice.');
  const rawTestCount = series.testCount ?? series.totalTests ?? series.testsCount ?? series.numberOfTests ?? series.mockTestCount;
  const testCount = rawTestCount !== null && rawTestCount !== undefined && rawTestCount !== '' && Number.isFinite(Number(rawTestCount)) ? Number(rawTestCount) : null;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          <AccessBadge isFree={isFree} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          {category}
          {testCount !== null && <><span className="mx-1.5" aria-hidden="true">·</span>{testCount} {testCount === 1 ? 'test' : 'tests'}<span className="mx-1.5" aria-hidden="true">·</span>Full-length &amp; topic-wise</>}
          <span className="mx-1.5" aria-hidden="true">·</span>{isFree ? 'Free access' : 'Full access'}
        </p>
      </div>
      <Link href={getSeriesHref(series)} className={`${BTN_SECONDARY} w-full shrink-0 sm:w-auto`}>
        Open series <ArrowRight size={14} />
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  In-progress attempt item                                           */
/* ------------------------------------------------------------------ */

function AttemptItem({ attempt, remainingSeconds }) {
  const attemptId = getAttemptId(attempt);
  const progress = Math.max(0, Math.min(100, Number(attempt.progressPercentage) || 0));
  const hasCountdown = typeof remainingSeconds === 'number';
  const isExpired = hasCountdown && remainingSeconds <= 0;

  return (
    <li className="px-5 py-4">
      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">{getAttemptName(attempt)}</h3>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Started {formatDate(attempt.startedAt)}</p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-indigo-600 transition-[width] dark:bg-indigo-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">{progress}% answered</span>
        <span className={`font-mono tabular-nums ${isExpired ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {hasCountdown ? (isExpired ? 'Time is up' : `${formatCountdown(remainingSeconds)} left`) : 'No timer'}
        </span>
      </div>

      <Link href={`/attempt/${encodeURIComponent(attemptId)}`} className={`${BTN_PRIMARY} mt-3 w-full`}>Resume test</Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MyLearningPage() {
  const [history, setHistory] = useState([]);
  const [inProgressAttempts, setInProgressAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeLoading, setActiveLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [activeError, setActiveError] = useState('');
  const [testSeries, setTestSeries] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [seriesError, setSeriesError] = useState('');
  const [countdowns, setCountdowns] = useState({});

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await apiClient.get(`/attempts-api/history?page=1&perPage=${PAGE_SIZE}`);
      setHistory(Array.isArray(response) ? response : []);
    } catch (error) {
      setHistoryError(error?.message || 'Unable to load your attempt history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadTestSeries = useCallback(async () => {
    setSeriesLoading(true);
    setSeriesError('');
    try {
      const [firstSeriesResponse, firstEntitlementsResponse] = await Promise.all([
        apiClientRaw.get('/tests-api/public/series?page=1&limit=50'),
        apiClientRaw.get('/payments-api/entitlements?page=0&size=100'),
      ]);
      const series = [...readList(firstSeriesResponse)];
      const entitlements = [...readList(firstEntitlementsResponse)];
      const totalSeriesPages = readTotalPages(firstSeriesResponse, 1);
      const totalEntitlementPages = readTotalPages(firstEntitlementsResponse, 1);
      const remainingRequests = [];
      for (let page = 2; page <= totalSeriesPages; page += 1) remainingRequests.push(apiClientRaw.get(`/tests-api/public/series?page=${page}&limit=50`).then((response) => ({ type: 'series', response })));
      for (let page = 1; page < totalEntitlementPages; page += 1) remainingRequests.push(apiClientRaw.get(`/payments-api/entitlements?page=${page}&size=100`).then((response) => ({ type: 'entitlements', response })));
      const remainingResponses = await Promise.all(remainingRequests);
      remainingResponses.forEach(({ type, response }) => { if (type === 'series') series.push(...readList(response)); else entitlements.push(...readList(response)); });
      const uniqueSeries = new Map();
      series.forEach((item) => { const id = getSeriesId(item); if (id) uniqueSeries.set(id, { ...(uniqueSeries.get(id) || {}), ...item }); });
      const visibleSeries = [...uniqueSeries.values()].filter((item) => isFreeSeries(item) || hasActiveSeriesEntitlement(entitlements, item)).map((item) => ({ ...item, accessType: isFreeSeries(item) ? 'FREE' : 'UNLOCKED' })).sort((a, b) => getSeriesTitle(a).localeCompare(getSeriesTitle(b)));
      setTestSeries(visibleSeries);
    } catch (error) {
      setSeriesError(error?.message || 'Unable to load your test series. Please try again.');
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  const loadInProgressAttempts = useCallback(async () => {
    setActiveLoading(true);
    setActiveError('');
    try {
      const response = await apiClient.get('/attempts-api/attempts/in-progress/all');
      const attempts = Array.isArray(response) ? response : response?.items || [];
      const validAttempts = attempts.filter((attempt) => getAttemptId(attempt));
      setInProgressAttempts(validAttempts);
      setCountdowns((previous) => {
        const next = {};
        validAttempts.forEach((attempt) => {
          const id = getAttemptId(attempt);
          const serverSeconds = getInitialRemainingSeconds(attempt);
          next[id] = previous[id] === undefined ? serverSeconds : serverSeconds === null ? previous[id] : Math.min(previous[id], serverSeconds);
        });
        return next;
      });
    } catch (error) {
      setActiveError(error?.message || 'Unable to check for in-progress tests. Please try again.');
    } finally {
      setActiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadInProgressAttempts();
    loadTestSeries();
  }, [loadHistory, loadInProgressAttempts, loadTestSeries]);

  useEffect(() => {
    if (inProgressAttempts.length === 0) return undefined;
    const timer = setInterval(() => {
      setCountdowns((previous) => {
        let changed = false;
        const next = { ...previous };
        inProgressAttempts.forEach((attempt) => {
          const id = getAttemptId(attempt);
          if (typeof next[id] === 'number' && next[id] > 0) {
            next[id] -= 1;
            changed = true;
          }
        });
        return changed ? next : previous;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inProgressAttempts]);

  const [seriesFilter, setSeriesFilter] = useState('ALL');

  const completedCount = history.filter((attempt) => attempt.status === 'SUBMITTED').length;
  const inProgressCount = inProgressAttempts.length;
  const freeCount = testSeries.filter((item) => item.accessType === 'FREE').length;
  const unlockedCount = testSeries.length - freeCount;
  const filteredSeries = seriesFilter === 'ALL' ? testSeries : testSeries.filter((item) => item.accessType === seriesFilter);
  const filterTabs = [
    { key: 'ALL', label: 'All', count: testSeries.length },
    { key: 'FREE', label: 'Free', count: freeCount },
    { key: 'UNLOCKED', label: 'Unlocked', count: unlockedCount },
  ];

  return (
    <StudentShell>
      <div className="mx-auto max-w-7xl space-y-6 pb-10">
        {/* Page header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">My Learning</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your active tests and every test series you can access.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/tests" className={BTN_SECONDARY}>Explore mock tests</Link>
            <Link href="/test-series" className={BTN_PRIMARY}>Browse test series</Link>
          </div>
        </header>

        {/* Summary */}
        <section aria-label="Learning summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Attempts loaded" value={historyLoading ? '—' : history.length} />
          <Stat label="Completed attempts" value={historyLoading ? '—' : completedCount} />
          <Stat label="Tests in progress" value={activeLoading ? '—' : inProgressCount} />
          <Stat label="Test series" value={seriesLoading ? '—' : testSeries.length} />
        </section>
        {historyError && <div className={PANEL}><ErrorState message={historyError} onRetry={loadHistory} /></div>}

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          {/* Left: sidebar */}
          <aside className="order-1 min-w-0 space-y-6">
            <Panel
              title="Pick up where you left off"
              description="Your unfinished tests"
              action={!activeLoading && inProgressAttempts.length > 0 ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">{inProgressAttempts.length} active</span> : null}
            >
              {activeLoading ? (
                <div className="flex items-center gap-2.5 px-5 py-6 text-sm text-slate-500 dark:text-slate-400" aria-busy="true"><LoaderCircle size={16} className="animate-spin" />Checking for unfinished tests…</div>
              ) : activeError ? (
                <ErrorState message={activeError} onRetry={loadInProgressAttempts} />
              ) : inProgressAttempts.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle2 size={22} className="mx-auto text-emerald-500" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">You&apos;re all caught up</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">There are no tests in progress.</p>
                  <Link href="/tests" className={`${BTN_PRIMARY} mt-4`}>Find a test</Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {inProgressAttempts.map((attempt) => <AttemptItem key={getAttemptId(attempt)} attempt={attempt} remainingSeconds={countdowns[getAttemptId(attempt)]} />)}
                </ul>
              )}
            </Panel>

            <Panel title="Explore more practice">
              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                {[
                  { href: '/tests', title: 'Mock tests', description: 'Practice for your target exam and sharpen your timing.' },
                  { href: '/test-series', title: 'Test series', description: 'Follow a structured plan with tests grouped by exam.' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={`group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${FOCUS}`}>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </aside>

          {/* Right: test series */}
          <div className="order-2 min-w-0">
            <Panel title="Your test series" description="Free series and your purchases">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
                <div role="tablist" aria-label="Filter test series" className="flex gap-5">
                  {filterTabs.map((tab) => {
                    const active = seriesFilter === tab.key;
                    return (
                      <button key={tab.key} type="button" role="tab" aria-selected={active} onClick={() => setSeriesFilter(tab.key)} className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors ${active ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        {tab.label}
                        {!seriesLoading && !seriesError && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tab.count}</span>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={loadTestSeries} disabled={seriesLoading} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-indigo-400">
                  <RefreshCw size={13} className={seriesLoading ? 'animate-spin' : ''} />Refresh
                </button>
              </div>

              {seriesLoading ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800" aria-busy="true">
                  {[0, 1, 2].map((item) => (
                    <li key={item} className="animate-pulse px-5 py-4">
                      <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2.5 h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800/70" />
                      <div className="mt-3 h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-800/70" />
                    </li>
                  ))}
                </ul>
              ) : seriesError ? (
                <ErrorState message={seriesError} onRetry={loadTestSeries} />
              ) : testSeries.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No test series yet</h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">You don&apos;t have any free or unlocked test series. Browse the catalog to find one that fits your preparation plan.</p>
                  <Link href="/test-series" className={`${BTN_PRIMARY} mt-4`}>Browse test series</Link>
                </div>
              ) : filteredSeries.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No {seriesFilter === 'FREE' ? 'free' : 'unlocked'} series yet.</p>
                  <button type="button" onClick={() => setSeriesFilter('ALL')} className="mt-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">Show all series</button>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredSeries.map((series) => <SeriesRow key={getSeriesId(series)} series={series} />)}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}