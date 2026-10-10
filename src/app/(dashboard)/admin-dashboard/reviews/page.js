'use client';

import { useMemo, useState } from 'react';
import {
  Star,
  MessageSquareText,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Filter,
  LoaderCircle,
} from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useGetAdminReviewStatsQuery,
  useModerateReviewMutation,
} from '@/store/adminApi';

const PAGE_SIZE = 20;

const STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] || 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{status || 'UNKNOWN'}</span>;
}

function StatCard({ label, value, description, icon: Icon, tone }) {
  const tones = {
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value ?? '—'}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={19} /></span>
      </div>
    </div>
  );
}

export default function ReviewModerationPage() {
  const [status, setStatus] = useState('PENDING');
  const [targetType, setTargetType] = useState('');
  const [rating, setRating] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionError, setActionError] = useState('');

  const queryArgs = useMemo(() => ({
    status: status || undefined,
    targetType: targetType || undefined,
    rating: rating || undefined,
    search: search || undefined,
    page,
    size: PAGE_SIZE,
  }), [status, targetType, rating, search, page]);

  const { data: pageData, isLoading, isFetching, error, refetch } = useGetAdminReviewsQuery(queryArgs);
  const { data: stats, isLoading: statsLoading } = useGetAdminReviewStatsQuery();
  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();

  const reviews = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;
  const totalElements = pageData?.totalElements || 0;

  const runSearch = (event) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setTargetType('');
    setRating('');
    setSearchInput('');
    setSearch('');
    setPage(0);
  };

  const handleModeration = async (review, nextStatus) => {
    setActionError('');
    let moderationReason;

    if (nextStatus === 'REJECTED') {
      moderationReason = window.prompt('Optional rejection reason (visible to admins only):', '') || '';
    }

    const confirmed = window.confirm(`Are you sure you want to ${nextStatus.toLowerCase()} review #${review.reviewId}?`);
    if (!confirmed) return;

    try {
      await moderateReview({ reviewId: review.reviewId, status: nextStatus, moderationReason }).unwrap();
      if (selectedReview?.reviewId === review.reviewId) setSelectedReview(null);
    } catch (requestError) {
      setActionError(requestError?.data?.message || requestError?.message || 'Could not update the review. Please try again.');
    }
  };

  const paginationStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const paginationEnd = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Moderation</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review student feedback before it appears publicly.</p>
        </div>
        <button type="button" onClick={() => { refetch(); }} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total reviews" value={statsLoading ? '…' : stats?.totalReviews} description="All non-deleted reviews" icon={MessageSquareText} tone="violet" />
        <StatCard label="Pending" value={statsLoading ? '…' : stats?.pendingReviews} description="Awaiting moderation" icon={Clock3} tone="amber" />
        <StatCard label="Approved" value={statsLoading ? '…' : stats?.approvedReviews} description="Visible to students" icon={CheckCircle2} tone="green" />
        <StatCard label="Average rating" value={statsLoading ? '…' : `${Number(stats?.averageRating || 0).toFixed(1)} / 5`} description={`${stats?.rejectedReviews ?? 0} rejected reviews`} icon={Star} tone="rose" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: '', label: 'All reviews' },
          ].map((tab) => (
            <button key={tab.value || 'ALL'} type="button" onClick={() => { setStatus(tab.value); setPage(0); }} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${status === tab.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              {tab.label}
              {tab.value === 'PENDING' && Number(stats?.pendingReviews) > 0 && <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${status === tab.value ? 'bg-white/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{stats.pendingReviews}</span>}
            </button>
          ))}
        </div>

        <form onSubmit={runSearch} className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_180px_150px_auto_auto]">
          <label className="relative block">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">Search</span>
            <Search size={15} className="absolute left-3 top-[2.35rem] -translate-y-1/2 text-slate-400" />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Reviewer ID, target, comment..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-500/10" />
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">Target type</span>
            <select value={targetType} onChange={(event) => { setTargetType(event.target.value); setPage(0); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
              <option value="">All types</option><option value="TEST">Test</option><option value="SERIES">Test series</option><option value="PLATFORM">Platform</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">Rating</span>
            <select value={rating} onChange={(event) => { setRating(event.target.value); setPage(0); }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950">
              <option value="">All ratings</option><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option>
            </select>
          </label>
          <button type="submit" className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"><Filter size={14} /> Search</button>
          <button type="button" onClick={clearFilters} className="mt-auto h-10 rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Clear</button>
        </form>
      </div>

      {actionError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{actionError}</div>}
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">Could not load reviews. Check the Community Service and API Gateway logs, then retry.</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold">Review queue</h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{isFetching ? 'Updating results…' : `${totalElements} reviews found`}</p>
          </div>
          {isFetching && <LoaderCircle size={16} className="animate-spin text-indigo-500" />}
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3 p-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <MessageSquareText size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold">No reviews found</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try another status or clear your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr><th className="px-4 py-3">Review</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((review) => (
                  <tr key={review.reviewId} className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="max-w-[350px] px-4 py-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Review #{review.reviewId} · User {review.userId || 'Unknown'}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{review.comment || 'No written comment provided.'}</p>
                    </td>
                    <td className="px-4 py-3"><p className="text-xs font-medium">{review.targetType || '—'}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{review.targetId || '—'}</p></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs font-semibold"><Star size={13} className="fill-amber-400 text-amber-400" />{review.rating} / 5</span></td>
                    <td className="px-4 py-3"><StatusBadge status={review.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => setSelectedReview(review)} title="View details" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Eye size={15} /></button>
                        {review.status !== 'APPROVED' && <button type="button" disabled={isModerating} onClick={() => handleModeration(review, 'APPROVED')} title="Approve" className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-emerald-500/10"><Check size={15} /></button>}
                        {review.status !== 'REJECTED' && <button type="button" disabled={isModerating} onClick={() => handleModeration(review, 'REJECTED')} title="Reject" className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-500/10"><X size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Showing {paginationStart}–{paginationEnd} of {totalElements}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 0 || isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs disabled:opacity-40 dark:border-slate-700"><ChevronLeft size={14} /> Previous</button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages - 1 || isFetching} onClick={() => setPage((current) => current + 1)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs disabled:opacity-40 dark:border-slate-700">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {selectedReview && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Close review details" onClick={() => setSelectedReview(null)} className="absolute inset-0 bg-slate-950/40" />
          <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Review details</p><h2 className="mt-1 text-lg font-semibold">Review #{selectedReview.reviewId}</h2></div>
              <button type="button" onClick={() => setSelectedReview(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={17} /></button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status={selectedReview.status} /><span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><Star size={13} className="fill-amber-400 text-amber-400" />{selectedReview.rating} / 5</span></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Comment</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{selectedReview.comment || 'No written comment provided.'}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500 dark:text-slate-400">Reviewer ID</p><p className="mt-1 break-all text-xs font-medium">{selectedReview.userId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500 dark:text-slate-400">Target</p><p className="mt-1 text-xs font-medium">{selectedReview.targetType} · {selectedReview.targetId}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500 dark:text-slate-400">Submitted</p><p className="mt-1 text-xs font-medium">{formatDate(selectedReview.createdAt)}</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-[10px] text-slate-500 dark:text-slate-400">Last moderated</p><p className="mt-1 text-xs font-medium">{formatDate(selectedReview.moderatedAt)}</p></div>
              </div>
              {selectedReview.moderationReason && <div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Moderation reason</p><p className="mt-2 whitespace-pre-wrap text-sm">{selectedReview.moderationReason}</p></div>}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
              {selectedReview.status !== 'REJECTED' && <button type="button" disabled={isModerating} onClick={() => handleModeration(selectedReview, 'REJECTED')} className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"><X size={14} /> Reject</button>}
              {selectedReview.status !== 'APPROVED' && <button type="button" disabled={isModerating} onClick={() => handleModeration(selectedReview, 'APPROVED')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><Check size={14} /> Approve</button>}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
