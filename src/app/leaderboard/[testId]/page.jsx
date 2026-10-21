'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Award, ChevronLeft, ChevronRight, Crown, Medal, RefreshCw, Sparkles, Trophy, Users } from 'lucide-react';
import StudentShell from '../../../components/student/StudentShell';
import { Avatar } from '../../../components/ui/Avatar';
import { useGetTestLeaderboardQuery } from '../../../store/leaderboardApi';

const PAGE_SIZE = 25;

const formatScore = (score, maxScore) => {
  const value = Number(score);
  const max = Number(maxScore);
  return Number.isFinite(value) ? `${value.toFixed(2).replace(/\.00$/, '')}${Number.isFinite(max) && max > 0 ? ` / ${max.toFixed(2).replace(/\.00$/, '')}` : ''}` : '—';
};

const formatDuration = (seconds) => {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';
  const minutes = Math.floor(value / 60);
  const remainingSeconds = Math.round(value % 60);
  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function TestLeaderboardPage() {
  const params = useParams();
  const slug = params?.testId;
  const [page, setPage] = useState(1);
  const { data: leaderboard, isLoading, isFetching, error, refetch } = useGetTestLeaderboardQuery({ slug, page, pageSize: PAGE_SIZE }, { skip: !slug });
  const entries = useMemo(() => Array.isArray(leaderboard?.entries) ? leaderboard.entries : [], [leaderboard]);
  const totalParticipants = Number(leaderboard?.totalParticipants ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalParticipants / PAGE_SIZE));
  const podiumOrder = useMemo(() => {
    const podium = entries.filter((entry) => entry.rank <= 3);
    return [2, 1, 3].map((rank) => podium.find((entry) => entry.rank === rank)).filter(Boolean);
  }, [entries]);

  return (
    <StudentShell>
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <Link href="/tests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"><ChevronLeft size={16} />Browse tests</Link>
        <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200"><Trophy size={14} /> Rankings</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">The leaderboard</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">See how learners performed on this test.</p><p className="mt-3 text-[11px] font-mono text-slate-400">Test: {leaderboard?.testSlug || slug}</p></div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-64"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Users size={17} className="text-cyan-300" /><div className="mt-2 text-2xl font-black">{totalParticipants.toLocaleString()}</div><div className="text-xs text-slate-400">Participants</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Sparkles size={17} className="text-amber-300" /><div className="mt-2 text-2xl font-black">{page}/{totalPages}</div><div className="text-xs text-slate-400">Leaderboard page</div></div></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Standings</h2><p className="mt-1 text-xs text-slate-500">Higher score ranks first; equal scores are broken by shorter completion time.</p></div><button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"><RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />Refresh</button></div>
          {isLoading ? <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div> : error ? <div className="p-10 text-center"><Award size={28} className="mx-auto text-rose-500" /><h3 className="mt-3 font-bold text-slate-900 dark:text-white">Couldn&apos;t load the standings</h3><p className="mt-1 text-sm text-slate-500">Please try again in a moment.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Try again</button></div> : entries.length === 0 ? <div className="p-12 text-center"><Trophy size={32} className="mx-auto text-amber-500" /><h3 className="mt-3 font-bold text-slate-900 dark:text-white">No entries yet</h3><p className="mt-1 text-sm text-slate-500">Completed test reports will appear here when they are ready.</p></div> : <>
            {page === 1 && podiumOrder.length > 0 && <div className="grid grid-cols-3 gap-2 px-4 pb-5 pt-6 sm:gap-4 sm:px-8">{podiumOrder.map((entry) => <div key={`${entry.rank}-${entry.userName}`} className={`relative flex min-w-0 flex-col items-center rounded-2xl border p-3 text-center sm:p-5 ${entry.rank === 1 ? 'border-amber-300 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-500/5 sm:-translate-y-2' : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40'}`}><div className={`flex h-10 w-10 items-center justify-center rounded-full ${entry.rank === 1 ? 'bg-amber-400 text-amber-950' : entry.rank === 2 ? 'bg-slate-300 text-slate-800' : 'bg-orange-300 text-orange-950'}`}>{entry.rank === 1 ? <Crown size={18} /> : <Medal size={18} />}</div><div className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">Rank #{entry.rank}</div><div className="mt-1 w-full truncate text-sm font-bold text-slate-900 dark:text-white">{entry.userName || 'Learner'}</div><div className="mt-2 text-lg font-black text-indigo-600 dark:text-indigo-400">{formatScore(entry.score, entry.maxScore)}</div><div className="mt-1 text-[11px] text-slate-500">{formatDuration(entry.timeTakenSeconds)}</div></div>)}</div>}
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60"><tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Accuracy</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Attempt date</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{entries.map((entry) => <tr key={`${entry.rank}-${entry.userName}`} className={`transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 ${entry.rank <= 3 ? 'bg-amber-50/30 dark:bg-amber-500/[0.025]' : ''}`}><td className="px-5 py-4"><span className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2 py-1 text-xs font-black ${entry.rank === 1 ? 'bg-amber-100 text-amber-800' : entry.rank === 2 ? 'bg-slate-200 text-slate-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>#{entry.rank}</span></td><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={entry.userName} avatarUrl={entry.avatarUrl} size="sm" /><div className="font-semibold text-slate-900 dark:text-white">{entry.userName || 'Learner'}</div></div></td><td className="px-5 py-4 font-bold tabular-nums text-slate-900 dark:text-white">{formatScore(entry.score, entry.maxScore)}</td><td className="px-5 py-4 font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{Number(entry.accuracy)}%</td><td className="px-5 py-4 tabular-nums text-slate-600 dark:text-slate-300">{formatDuration(entry.timeTakenSeconds)}</td><td className="px-5 py-4 text-slate-500">{formatDate(entry.firstAttemptAt)}</td></tr>)}</tbody></table></div>
          </>}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 dark:border-slate-800"><p className="text-xs text-slate-500">Showing {entries.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, totalParticipants)} of {totalParticipants}</p><div className="flex items-center gap-2"><button type="button" aria-label="Previous page" disabled={page <= 1 || isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"><ChevronLeft size={16} /></button><button type="button" aria-label="Next page" disabled={page >= totalPages || isFetching} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"><ChevronRight size={16} /></button></div></div>
        </section>
        <div><Link href="/tests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"><ChevronLeft size={16} />Browse tests</Link></div>
      </div>
    </StudentShell>
  );
}
