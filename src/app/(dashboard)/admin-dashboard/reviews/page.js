'use client';

import { useMemo, useState } from 'react';
import {
  Star,
  MessageSquareText,
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Filter,
  LoaderCircle,
  User,
  Copy,
  CheckCheck,
  Layers,
  FileText,
  Globe,
  AlertCircle,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useGetAdminReviewStatsQuery,
  useModerateReviewMutation,
} from '@/store/adminApi';
import { useToast } from '@/components/common/ToastProvider';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const PAGE_SIZE = 20;

const STATUS_STYLES = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
};

const TARGET_CONFIG = {
  SERIES: {
    label: 'Test Series',
    icon: Layers,
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300',
  },
  TEST: {
    label: 'Mock Test',
    icon: FileText,
    badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
  },
  PLATFORM: {
    label: 'Platform',
    icon: Globe,
    badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300',
  },
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLES[status] ||
        'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {status || 'UNKNOWN'}
    </span>
  );
}

function TargetBadge({ type }) {
  const config = TARGET_CONFIG[type] || {
    label: type || 'General',
    icon: Layers,
    badge: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${config.badge}`}>
      <Icon size={12} className="shrink-0" />
      {config.label}
    </span>
  );
}

function CopyableId({ id, label }) {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label || 'ID'}: ${id}`}
      className="group inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
    >
      <span className="truncate max-w-[120px]">{id || '—'}</span>
      {copied ? (
        <CheckCheck size={11} className="text-emerald-500 shrink-0" />
      ) : (
        <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}

function RatingStars({ rating, size = 13 }) {
  const num = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= num
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-200 dark:text-slate-700'
          }
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {rating}
      </span>
    </div>
  );
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
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value ?? '—'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
    </div>
  );
}

export default function ReviewModerationPage() {
  const toast = useToast();
  const [status, setStatus] = useState('PENDING');
  const [targetType, setTargetType] = useState('');
  const [rating, setRating] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Drawer & modal states
  const [selectedReview, setSelectedReview] = useState(null);
  const [approvalModalReview, setApprovalModalReview] = useState(null);
  const [rejectionModalReview, setRejectionModalReview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryArgs = useMemo(
    () => ({
      status: status || undefined,
      targetType: targetType || undefined,
      rating: rating || undefined,
      search: search || undefined,
      page,
      size: PAGE_SIZE,
    }),
    [status, targetType, rating, search, page]
  );

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

  const handleOpenApproveModal = (review) => {
    setApprovalModalReview(review);
  };

  const handleConfirmApprove = async () => {
    if (!approvalModalReview) return;
    try {
      await moderateReview({
        reviewId: approvalModalReview.reviewId,
        status: 'APPROVED',
      }).unwrap();

      toast.success(`Review #${approvalModalReview.reviewId} has been approved.`);

      if (selectedReview?.reviewId === approvalModalReview.reviewId) {
        setSelectedReview((prev) =>
          prev ? { ...prev, status: 'APPROVED', moderatedAt: new Date().toISOString() } : null
        );
      }
      setApprovalModalReview(null);
    } catch (requestError) {
      const msg =
        requestError?.data?.message ||
        requestError?.message ||
        'Could not approve the review. Please try again.';
      toast.error(msg);
    }
  };

  const handleOpenRejectModal = (review) => {
    setRejectionModalReview(review);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalReview) return;
    try {
      const reasonTrimmed = rejectionReason.trim();
      await moderateReview({
        reviewId: rejectionModalReview.reviewId,
        status: 'REJECTED',
        moderationReason: reasonTrimmed || undefined,
      }).unwrap();

      toast.success(`Review #${rejectionModalReview.reviewId} has been rejected.`);

      if (selectedReview?.reviewId === rejectionModalReview.reviewId) {
        setSelectedReview((prev) =>
          prev
            ? {
                ...prev,
                status: 'REJECTED',
                moderationReason: reasonTrimmed,
                moderatedAt: new Date().toISOString(),
              }
            : null
        );
      }
      setRejectionModalReview(null);
      setRejectionReason('');
    } catch (requestError) {
      const msg =
        requestError?.data?.message ||
        requestError?.message ||
        'Could not reject the review. Please try again.';
      toast.error(msg);
    }
  };

  const paginationStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const paginationEnd = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Review Moderation</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Moderate student feedback before it appears publicly on test series and mock tests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            refetch();
          }}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total reviews"
          value={statsLoading ? '…' : stats?.totalReviews}
          description="All submitted student reviews"
          icon={MessageSquareText}
          tone="violet"
        />
        <StatCard
          label="Pending"
          value={statsLoading ? '…' : stats?.pendingReviews}
          description="Awaiting admin moderation"
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Approved"
          value={statsLoading ? '…' : stats?.approvedReviews}
          description="Visible to students"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Average rating"
          value={statsLoading ? '…' : `${Number(stats?.averageRating || 0).toFixed(1)} / 5`}
          description={`${stats?.rejectedReviews ?? 0} rejected reviews`}
          icon={Star}
          tone="rose"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {[
            { value: '', label: 'All reviews' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.value || 'ALL'}
              type="button"
              onClick={() => {
                setStatus(tab.value);
                setPage(0);
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                status === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.value === 'PENDING' && Number(stats?.pendingReviews) > 0 && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                    status === tab.value
                      ? 'bg-white/20'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                  }`}
                >
                  {stats.pendingReviews}
                </span>
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={runSearch}
          className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_180px_150px_auto_auto]"
        >
          <label className="relative block">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Search
            </span>
            <Search size={15} className="absolute left-3 top-[2.35rem] -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Reviewer ID, target, comment..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-500/10"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Target type
            </span>
            <select
              value={targetType}
              onChange={(event) => {
                setTargetType(event.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All types</option>
              <option value="SERIES">Test series</option>
              <option value="TEST">Mock test</option>
              <option value="PLATFORM">Platform</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Rating
            </span>
            <select
              value={rating}
              onChange={(event) => {
                setRating(event.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Filter size={14} /> Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-auto h-10 rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>Could not load reviews. Check the Community Service and API Gateway, then retry.</span>
        </div>
      )}

      {/* Main Reviews Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold">Review queue</h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {isFetching ? 'Updating results…' : `${totalElements} reviews found`}
            </p>
          </div>
          {isFetching && <LoaderCircle size={16} className="animate-spin text-indigo-500" />}
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <MessageSquareText size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold">No reviews found</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try another status or clear your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Review & Comment</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map((review) => (
                  <tr
                    key={review.reviewId}
                    className="align-top hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    <td className="max-w-[360px] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          #{review.reviewId}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <User size={12} className="shrink-0" />
                          <CopyableId id={review.userId} label="User ID" />
                        </div>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                        {review.comment ? (
                          `“${review.comment}”`
                        ) : (
                          <span className="italic text-slate-400 dark:text-slate-500">
                            No written comment provided.
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <TargetBadge type={review.targetType} />
                      </div>
                      <div className="mt-1.5">
                        <CopyableId id={review.targetId} label="Target ID" />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <RatingStars rating={review.rating} />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={review.status} />
                      {review.status === 'REJECTED' && review.moderationReason && (
                        <p className="mt-1 max-w-[160px] truncate text-[10px] text-rose-600 dark:text-rose-400" title={review.moderationReason}>
                          Reason: {review.moderationReason}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(review.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          title="View details"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        >
                          <Eye size={15} />
                        </button>
                        {review.status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={isModerating}
                            onClick={() => handleOpenApproveModal(review)}
                            title="Approve review"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-emerald-500/10"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={isModerating}
                            onClick={() => handleOpenRejectModal(review)}
                            title="Reject review"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-500/10"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Showing {paginationStart}–{paginationEnd} of {totalElements}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 0 || isFetching}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1 || isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Review Details Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close review details"
            onClick={() => setSelectedReview(null)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Review details
                </p>
                <h2 className="mt-1 text-lg font-semibold">Review #{selectedReview.reviewId}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedReview.status} />
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {selectedReview.rating} / 5
                </span>
                <TargetBadge type={selectedReview.targetType} />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Comment
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-800/40">
                  {selectedReview.comment || (
                    <span className="italic text-slate-400">No written comment provided.</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Reviewer ID</p>
                  <p className="mt-1">
                    <CopyableId id={selectedReview.userId} label="User ID" />
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Target ID</p>
                  <p className="mt-1">
                    <CopyableId id={selectedReview.targetId} label="Target ID" />
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Submitted</p>
                  <p className="mt-1 text-xs font-medium">{formatDate(selectedReview.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Last Moderated</p>
                  <p className="mt-1 text-xs font-medium">{formatDate(selectedReview.moderatedAt)}</p>
                </div>
              </div>

              {selectedReview.moderatedBy && (
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Moderated By</p>
                  <p className="mt-1 text-xs font-medium">{selectedReview.moderatedBy}</p>
                </div>
              )}

              {selectedReview.moderationReason && (
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3.5 dark:border-rose-500/20 dark:bg-rose-500/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                    Moderation reason
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-5 text-rose-900 dark:text-rose-200">
                    {selectedReview.moderationReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
              {selectedReview.status !== 'REJECTED' && (
                <button
                  type="button"
                  disabled={isModerating}
                  onClick={() => handleOpenRejectModal(selectedReview)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
                >
                  <X size={14} /> Reject
                </button>
              )}
              {selectedReview.status !== 'APPROVED' && (
                <button
                  type="button"
                  disabled={isModerating}
                  onClick={() => handleOpenApproveModal(selectedReview)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={14} /> Approve
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Confirmation Modal: Approve Review */}
      <Modal
        open={Boolean(approvalModalReview)}
        onClose={() => setApprovalModalReview(null)}
        title="Approve Review"
        description="Make this review publicly visible to students."
        width="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setApprovalModalReview(null)}
              disabled={isModerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              isLoading={isModerating}
              className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
            >
              <ShieldCheck size={15} className="mr-1.5" /> Approve Review
            </Button>
          </>
        }
      >
        {approvalModalReview && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                <span>Review #{approvalModalReview.reviewId}</span>
                <RatingStars rating={approvalModalReview.rating} />
              </div>
              <p className="mt-2 text-slate-600 italic dark:text-slate-400">
                “{approvalModalReview.comment || 'No written comment'}”
              </p>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Are you sure you want to approve this review? It will appear immediately in the public review section for students.
            </p>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal: Reject Review */}
      <Modal
        open={Boolean(rejectionModalReview)}
        onClose={() => {
          setRejectionModalReview(null);
          setRejectionReason('');
        }}
        title="Reject Review"
        description="Hide this review from public display."
        width="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionModalReview(null);
                setRejectionReason('');
              }}
              disabled={isModerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              isLoading={isModerating}
              variant="danger"
            >
              <ShieldX size={15} className="mr-1.5" /> Reject Review
            </Button>
          </>
        }
      >
        {rejectionModalReview && (
          <div className="space-y-3.5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
                <span>Review #{rejectionModalReview.reviewId}</span>
                <RatingStars rating={rejectionModalReview.rating} />
              </div>
              <p className="mt-2 text-slate-600 italic dark:text-slate-400">
                “{rejectionModalReview.comment || 'No written comment'}”
              </p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="rejection-reason"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Moderation reason <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {rejectionReason.length} / 2000
                </span>
              </div>
              <textarea
                id="rejection-reason"
                rows={3}
                maxLength={2000}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inappropriate language, spam, off-topic..."
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-rose-500/10"
              />
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                This note will be saved in the admin audit trail.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
