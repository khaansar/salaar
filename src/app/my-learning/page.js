'use client';



import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';

import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, Layers3, LoaderCircle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';

import apiClient, { apiClientRaw } from '../../lib/apiClient';



const PAGE_SIZE = 50;



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
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function getStatusLabel(status) {

  return ({ IN_PROGRESS: 'In progress', SUBMITTED: 'Completed', EXPIRED: 'Expired' })[status] || status || 'Unknown';

}



function getStatusClass(status) {

  return ({ IN_PROGRESS: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300', SUBMITTED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', EXPIRED: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300' })[status] || 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';

}



function StatusBadge({ status }) {

  const dotClass = ({ IN_PROGRESS: 'bg-blue-500', SUBMITTED: 'bg-emerald-500', EXPIRED: 'bg-rose-500' })[status] || 'bg-slate-400';

  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(status)}`}><span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />{getStatusLabel(status)}</span>;

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
  const identifier = series?.slug || getSeriesId(series);
  return `/test-series/${encodeURIComponent(identifier)}`;
}

function SectionHeading({ icon: Icon, title, description, action }) {

  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-start gap-3"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400"><Icon size={19} /></div><div><h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p></div></div>{action}</div>;

}



function DiscoveryCard({ href, icon: Icon, title, description, accent }) {

  return <Link href={href} className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/10"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}><Icon size={22} /></div><div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">{description}</p><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400">Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span></div></Link>;

}



function ErrorState({ message, onRetry }) {

  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5"><p className="text-sm text-rose-700 dark:text-rose-300">{message}</p><button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:underline dark:text-rose-300"><RefreshCw size={14} />Try again</button></div>;

}



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
          next[id] = previous[id] === undefined
            ? serverSeconds
            : serverSeconds === null
              ? previous[id]
              : Math.min(previous[id], serverSeconds);
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





  const completedCount = history.filter((attempt) => attempt.status === 'SUBMITTED').length;

  const inProgressCount = inProgressAttempts.length;

  const featuredAttempt = inProgressAttempts[0] || null;



  return (

    <StudentShell>

      <div className="mx-auto max-w-7xl space-y-8 pb-10">

        <section className="relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/70 to-indigo-100/80 px-5 py-7 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/50 sm:px-8 sm:py-9">

          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-5rem] right-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">

            <div className="max-w-2xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300"><BookOpen size={14} /> YOUR PREPARATION SPACE</div><h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">My Learning</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Your learning hub for active tests and the test series you can access. Pick up where you left off or jump into your next practice session.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/tests" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">Explore mock tests <ArrowRight size={16} /></Link><Link href="/test-series" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">Browse test series</Link></div></div>

            <div className="hidden md:flex md:h-32 md:w-32 md:items-center md:justify-center md:rounded-3xl md:border md:border-white/80 md:bg-white/70 md:shadow-sm dark:md:border-slate-700 dark:md:bg-slate-900/70"><div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-600/20"><BookOpen size={36} strokeWidth={1.7} /></div></div>

          </div>

        </section>



        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><Layers3 size={21} /></div><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Attempts loaded</p><p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{historyLoading ? '—' : history.length}</p></div></div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={21} /></div><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed attempts</p><p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{historyLoading ? '—' : completedCount}</p></div></div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><Clock3 size={21} /></div><div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tests in progress</p><p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{activeLoading ? '—' : inProgressCount}</p></div></div>

        </section>



        <section>

          <SectionHeading icon={Clock3} title="Pick up where you left off" description="Your unfinished tests appear here when available." action={!activeLoading && inProgressAttempts.length > 0 ? <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">{inProgressAttempts.length} active</span> : null} />

          {activeLoading ? <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"><LoaderCircle size={18} className="animate-spin" />Checking for unfinished tests...</div> : activeError ? <ErrorState message={activeError} onRetry={loadInProgressAttempts} /> : !featuredAttempt ? <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-6"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={25} /></div><div className="flex-1"><h3 className="font-bold text-slate-900 dark:text-white">You&apos;re all caught up</h3><p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">There are no tests in progress. Start a new test whenever you&apos;re ready.</p></div><Link href="/tests" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Find a test <ArrowRight size={15} /></Link></div> : <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">{inProgressAttempts.map((attempt) => {
            const attemptId = getAttemptId(attempt);
            const progress = Math.max(0, Math.min(100, Number(attempt.progressPercentage) || 0));
            const remainingSeconds = countdowns[attemptId];
            const hasCountdown = typeof remainingSeconds === 'number';
            const isExpired = hasCountdown && remainingSeconds <= 0;
            return (
              <article key={attemptId} className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-500/40 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><FileText size={22} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2"><StatusBadge status="IN_PROGRESS" /></div>
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 dark:text-white sm:text-base">{getAttemptName(attempt)}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Started {formatDate(attempt.startedAt)}</p>
                  </div>
                </div>
                <div className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 ${isExpired ? 'border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/5' : 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5'}`}>
                  <div className="flex items-center gap-2">
                    <Clock3 size={17} className={isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} />
                    <div>
                      <p className={`text-xs font-semibold ${isExpired ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300'}`}>{isExpired ? 'Time is up' : 'Time remaining'}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{hasCountdown ? (isExpired ? 'Your attempt may have expired.' : 'Countdown updates automatically') : 'Timer unavailable'}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-lg font-extrabold tabular-nums tracking-tight ${isExpired ? 'text-rose-700 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>{hasCountdown ? formatCountdown(remainingSeconds) : '—'}</span>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="text-slate-500 dark:text-slate-400">Answered-question progress</span><span className="font-semibold text-slate-700 dark:text-slate-200">{progress}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-600 transition-[width]" style={{ width: `${progress}%` }} /></div>
                </div>
                <Link href={`/attempt/${encodeURIComponent(attemptId)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Resume test <ArrowRight size={16} /></Link>
              </article>
            );
          })}</div>}

        </section>



        <section>
          <SectionHeading icon={Layers3} title="Your Test Series" description="All the test series you can access, including free series and your purchases." action={<button type="button" onClick={loadTestSeries} disabled={seriesLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"><RefreshCw size={13} className={seriesLoading ? 'animate-spin' : ''} />Refresh</button>} />
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-500/15 bg-brand-500/[0.04] px-4 py-3 dark:border-brand-400/15 dark:bg-brand-400/[0.04]"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><ShieldCheck size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your access, all in one place</p><p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Paid series appear here when your entitlement is active. Free series are included automatically.</p></div>{!seriesLoading && !seriesError && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{testSeries.length} {testSeries.length === 1 ? 'series' : 'series'}</span>}</div>
          {seriesLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" /></div><div className="mt-5 h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-3 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" /><div className="mt-7 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>)}</div> : seriesError ? <ErrorState message={seriesError} onRetry={loadTestSeries} /> : testSeries.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900/70"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><Sparkles size={23} /></div><h3 className="mt-4 font-bold text-slate-900 dark:text-white">Your next series is waiting</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">You don&apos;t have any free or unlocked test series yet. Browse the catalog to find a series that fits your preparation plan.</p><div className="mt-5"><Link href="/test-series" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Browse test series <ArrowRight size={15} /></Link></div></div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{testSeries.map((series) => { const id = getSeriesId(series); const isFree = series.accessType === 'FREE'; const title = getSeriesTitle(series); const category = series.categoryName || series.category?.name || 'Test series'; return <article key={id} className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/10"><div className={`h-1.5 w-full ${isFree ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-brand-500 to-indigo-500'}`} /><div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isFree ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}><Layers3 size={22} /></div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide ${isFree ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-brand-500/20 bg-brand-500/10 text-brand-700 dark:text-brand-300'}`}>{isFree ? <><Sparkles size={12} />FREE</> : <><ShieldCheck size={12} />UNLOCKED</>}</span></div><p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{category}</p><h3 className="mt-1.5 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{isFree ? 'Free to access. Start practicing whenever you are ready.' : 'You have access to this series. Continue your preparation at your own pace.'}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><div><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Access</p><p className={`mt-0.5 text-sm font-bold ${isFree ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>{isFree ? 'Free forever' : 'Included in your access'}</p></div><Link href={getSeriesHref(series)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700">Open series <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></Link></div></div></article>; })}</div>}
        </section>

        <section>

          <SectionHeading icon={Layers3} title="Explore more practice" description="Choose how you want to prepare next." />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><DiscoveryCard href="/tests" icon={FileText} title="Mock tests" description="Practice with mock tests for your target exam and sharpen your timing." accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" /><DiscoveryCard href="/test-series" icon={Layers3} title="Test series" description="Follow a structured preparation plan with tests grouped by exam." accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" /></div>

        </section>

      </div>

    </StudentShell>

  );

}