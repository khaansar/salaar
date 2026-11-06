'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  MessageSquareText,
  CheckCircle2,
  Clock3,
  Search,
  RefreshCw,
  Eye,
  Check,
  X,
  LoaderCircle,
  User,
  Copy,
  CheckCheck,
  Layers,
  Globe,
  Home,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import {
  useGetAdminReviewsQuery,
  useGetAdminReviewStatsQuery,
  useModerateReviewMutation,
} from '@/store/adminApi';
import { homepageReviewService } from '@/services/homepageReviewService';
import { useToast } from '@/components/common/ToastProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination, zeroBasedMeta } from '@/components/ui/Pagination';
import { StatCard } from '@/components/admin/StatCard';
import { ADMIN_TABLE, IconAction, InlineAlert, SegmentedTabs } from '@/components/admin/AdminUi';

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
  PLATFORM: {
    label: 'Platform',
    icon: Globe,
    badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300',
  },
};

const FALLBACK_REVIEWS = [
  {
    reviewId: 101,
    userName: 'Pooja Hegde',
    userId: 'usr_8921f0',
    comment: 'The mock tests and analysis are top-notch. Truly helped boost my confidence for GATE CS!',
    targetType: 'SERIES',
    seriesName: 'GATE 2025 Full Length Tests',
    targetId: 's1',
    rating: 5,
    status: 'APPROVED',
    createdAt: '2026-10-14T10:30:00Z',
  },
  {
    reviewId: 102,
    userName: 'Rahul Sharma',
    userId: 'usr_3310b4',
    comment: 'Comprehensive question bank with detailed explanations. ClearIt is the best platform for exam prep.',
    targetType: 'SERIES',
    seriesName: 'Computer Science Mock Series',
    targetId: 's2',
    rating: 5,
    status: 'APPROVED',
    createdAt: '2026-10-13T14:20:00Z',
  },
  {
    reviewId: 103,
    userName: 'Sneha Patel',
    userId: 'usr_1092a7',
    comment: 'Very realistic exam interface and great sectional timing practice.',
    targetType: 'SERIES',
    seriesName: 'Operating Systems Practice Series',
    targetId: 's3',
    rating: 4,
    status: 'APPROVED',
    createdAt: '2026-10-12T09:15:00Z',
  },
  {
    reviewId: 104,
    userName: 'Arjun Mehta',
    userId: 'usr_6641e9',
    comment: 'High quality previous year questions and insightful performance analytics.',
    targetType: 'PLATFORM',
    seriesName: 'Platform Review',
    targetId: 'PLATFORM',
    rating: 5,
    status: 'APPROVED',
    createdAt: '2026-10-11T16:45:00Z',
  },
  {
    reviewId: 105,
    userName: 'Vikram Singh',
    userId: 'usr_4482c1',
    comment: 'Good test series, but would love to see more explanations for numerical questions.',
    targetType: 'SERIES',
    seriesName: 'GATE 2025 Full Length Tests',
    targetId: 's1',
    rating: 3,
    status: 'PENDING',
    createdAt: '2026-10-15T11:00:00Z',
  },
];

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
    <Badge
      className={
        STATUS_STYLES[status] ||
        'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }
    >
      {status || 'UNKNOWN'}
    </Badge>
  );
}

const HOMEPAGE_SELECT_BASE = 'h-8 rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-indigo-500';

function homepageSelectClass(approved, featured) {
  if (!approved) {
    return `${HOMEPAGE_SELECT_BASE} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500`;
  }
  return featured
    ? `${HOMEPAGE_SELECT_BASE} cursor-pointer border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300`
    : `${HOMEPAGE_SELECT_BASE} cursor-pointer border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800`;
}

function InfoTile({ label, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-slate-200 p-3 dark:border-slate-800 ${className}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">{children}</div>
    </div>
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

export default function ReviewModerationPage() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [targetType, setTargetType] = useState('');
  const [rating, setRating] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Homepage reviews state (set of review IDs active on homepage)
  const [homepageReviewIds, setHomepageReviewIds] = useState(() => new Set());

  // Drawer & modal states
  const [selectedReview, setSelectedReview] = useState(null);
  const [approvalModalReview, setApprovalModalReview] = useState(null);
  const [rejectionModalReview, setRejectionModalReview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Sync homepage review selections from storage/cookies
  useEffect(() => {
    const sync = () => {
      const list = homepageReviewService.getHomepageReviews();
      setHomepageReviewIds(new Set(list.map((r) => String(r.reviewId || r.id))));
    };

    sync();
    return homepageReviewService.subscribeHomepageReviews(sync);
  }, []);

  const handleToggleHomepage = (review, shouldBeOnHome) => {
    if (shouldBeOnHome && review.status !== 'APPROVED') {
      toast.error(`Review #${review.reviewId} must be approved before adding to the home page.`);
      return;
    }

    const updatedList = homepageReviewService.setReviewOnHomepage(review, shouldBeOnHome);
    setHomepageReviewIds(new Set(updatedList.map((r) => String(r.reviewId || r.id))));

    if (shouldBeOnHome) {
      toast.success(`Review #${review.reviewId} has been added to the home page.`);
    } else {
      toast.info(`Review #${review.reviewId} removed from the home page.`);
    }
  };

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

  // If backend returns data, use it; otherwise provide fallback reviews for local testing
  const filteredFallback = error
    ? FALLBACK_REVIEWS.filter((r) => {
        if (status && r.status !== status) return false;
        if (targetType && r.targetType !== targetType) return false;
        if (rating && String(r.rating) !== String(rating)) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            String(r.reviewId).includes(q) ||
            r.userName?.toLowerCase().includes(q) ||
            r.comment?.toLowerCase().includes(q) ||
            r.seriesName?.toLowerCase().includes(q)
          );
        }
        return true;
      })
    : [];

  const reviews = pageData?.content || filteredFallback;
  const totalPages = pageData?.totalPages ?? (error ? Math.max(1, Math.ceil(filteredFallback.length / PAGE_SIZE)) : 0);
  const totalElements = pageData?.totalElements ?? (error ? filteredFallback.length : 0);

  const displayStats = useMemo(() => {
    if (stats) return stats;
    if (error) {
      const total = FALLBACK_REVIEWS.length;
      const pending = FALLBACK_REVIEWS.filter((r) => r.status === 'PENDING').length;
      const approved = FALLBACK_REVIEWS.filter((r) => r.status === 'APPROVED').length;
      const rejected = FALLBACK_REVIEWS.filter((r) => r.status === 'REJECTED').length;
      const avg =
        FALLBACK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / (total || 1);
      return {
        totalReviews: total,
        pendingReviews: pending,
        approvedReviews: approved,
        rejectedReviews: rejected,
        averageRating: avg.toFixed(1),
      };
    }
    return null;
  }, [stats, error]);

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
      if (error) {
        const idx = FALLBACK_REVIEWS.findIndex((r) => r.reviewId === approvalModalReview.reviewId);
        if (idx !== -1) {
          FALLBACK_REVIEWS[idx].status = 'APPROVED';
        }
        toast.success(`Review #${approvalModalReview.reviewId} has been approved.`);
        if (selectedReview?.reviewId === approvalModalReview.reviewId) {
          setSelectedReview((prev) =>
            prev ? { ...prev, status: 'APPROVED', moderatedAt: new Date().toISOString() } : null
          );
        }
        setApprovalModalReview(null);
        return;
      }
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

      // If this review was featured on the homepage, automatically remove it
      if (homepageReviewIds.has(String(rejectionModalReview.reviewId))) {
        const updatedList = homepageReviewService.setReviewOnHomepage(rejectionModalReview, false);
        setHomepageReviewIds(new Set(updatedList.map((r) => String(r.reviewId || r.id))));
      }

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
      if (error) {
        const reasonTrimmed = rejectionReason.trim();
        const idx = FALLBACK_REVIEWS.findIndex((r) => r.reviewId === rejectionModalReview.reviewId);
        if (idx !== -1) {
          FALLBACK_REVIEWS[idx].status = 'REJECTED';
          FALLBACK_REVIEWS[idx].moderationReason = reasonTrimmed;
        }
        if (homepageReviewIds.has(String(rejectionModalReview.reviewId))) {
          const updatedList = homepageReviewService.setReviewOnHomepage(rejectionModalReview, false);
          setHomepageReviewIds(new Set(updatedList.map((r) => String(r.reviewId || r.id))));
        }
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
        return;
      }
      const msg =
        requestError?.data?.message ||
        requestError?.message ||
        'Could not reject the review. Please try again.';
      toast.error(msg);
    }
  };


  const statValue = (value) => (statsLoading && !displayStats ? '…' : value);
  const STATUS_TABS = [
    { value: '', label: 'All reviews' },
    { value: 'PENDING', label: 'Pending', count: Number(displayStats?.pendingReviews) > 0 ? displayStats.pendingReviews : null },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];
  const hasFilters = Boolean(targetType || rating || searchInput || search);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Review Moderation' }]}
        title="Review Moderation"
        subtitle="Moderate student feedback before it appears publicly on test series and mock tests."
        actions={
          <Button variant="outline" onClick={() => { refetch(); }}>
            <RefreshCw size={16} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total reviews" value={statValue(displayStats?.totalReviews)} hint="All submitted student reviews" icon={MessageSquareText} tone="violet" />
        <StatCard label="Pending" value={statValue(displayStats?.pendingReviews)} hint="Awaiting admin moderation" icon={Clock3} tone="amber" />
        <StatCard
          label="Approved"
          value={statValue(displayStats?.approvedReviews)}
          hint={homepageReviewIds.size > 0 ? `${homepageReviewIds.size} featured on homepage` : 'Visible to students'}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Average rating"
          value={statValue(`${Number(displayStats?.averageRating || 0).toFixed(1)} / 5`)}
          hint={`${displayStats?.rejectedReviews ?? 0} rejected reviews`}
          icon={Star}
          tone="rose"
        />
      </div>

      {error && (
        <InlineAlert tone="warning">
          API Gateway is unreachable. Displaying demo reviews so you can test moderation and homepage selection.
        </InlineAlert>
      )}

      <Card>
        {/* Status tabs + filters */}
        <div className="space-y-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <SegmentedTabs
            tabs={STATUS_TABS}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(0);
            }}
          />

          <form onSubmit={runSearch} className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input
                aria-label="Search reviews"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Reviewer, target, comment…"
                leftIcon={<Search size={16} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center">
              <div className="lg:w-44">
                <Select
                  aria-label="Filter by target type"
                  value={targetType}
                  onChange={(event) => {
                    setTargetType(event.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All types</option>
                  <option value="SERIES">Test series</option>
                  <option value="PLATFORM">Platform</option>
                </Select>
              </div>
              <div className="lg:w-36">
                <Select
                  aria-label="Filter by rating"
                  value={rating}
                  onChange={(event) => {
                    setRating(event.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">
                <Search size={15} className="mr-2" /> Search
              </Button>
              {hasFilters && (
                <Button type="button" variant="ghost" onClick={clearFilters}>
                  <X size={15} className="mr-1.5" /> Clear
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isFetching ? 'Updating results…' : (
              <>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalElements}</span> reviews found
              </>
            )}
          </p>
          {isFetching && <LoaderCircle size={16} className="animate-spin text-indigo-500" />}
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText size={22} />}
            title="No reviews found"
            description="Try another status or clear your filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className={`${ADMIN_TABLE.table} min-w-[980px]`}>
              <thead>
                <tr className={`${ADMIN_TABLE.headRow} border-t`}>
                  <th className={ADMIN_TABLE.th}>Review &amp; comment</th>
                  <th className={ADMIN_TABLE.th}>Target</th>
                  <th className={ADMIN_TABLE.th}>Rating</th>
                  <th className={ADMIN_TABLE.th}>Status</th>
                  <th className={ADMIN_TABLE.th}>Homepage</th>
                  <th className={ADMIN_TABLE.th}>Submitted</th>
                  <th className={`${ADMIN_TABLE.th} text-right`}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className={ADMIN_TABLE.body}>
                {reviews.map((review) => {
                  const approved = review.status === 'APPROVED';
                  const featured = homepageReviewIds.has(String(review.reviewId));

                  return (
                    <tr key={review.reviewId} className={`${ADMIN_TABLE.row} align-top`}>
                      <td className={`${ADMIN_TABLE.td} max-w-[360px]`}>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            #{review.reviewId}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <User size={12} className="shrink-0" />
                            <CopyableId id={review.userName} label="User ID" />
                          </div>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                          {review.comment ? (
                            `“${review.comment}”`
                          ) : (
                            <span className="italic text-slate-400 dark:text-slate-500">No written comment provided.</span>
                          )}
                        </p>
                      </td>

                      <td className={ADMIN_TABLE.td}>
                        <TargetBadge type={review.targetType} />
                        <div className="mt-1.5">
                          <CopyableId id={review.seriesName} label="Target ID" />
                        </div>
                      </td>

                      <td className={ADMIN_TABLE.td}>
                        <RatingStars rating={review.rating} />
                      </td>

                      <td className={ADMIN_TABLE.td}>
                        <StatusBadge status={review.status} />
                        {review.status === 'REJECTED' && review.moderationReason && (
                          <p className="mt-1 max-w-[160px] truncate text-[11px] text-rose-600 dark:text-rose-400" title={review.moderationReason}>
                            Reason: {review.moderationReason}
                          </p>
                        )}
                      </td>

                      <td className={`${ADMIN_TABLE.td} whitespace-nowrap`}>
                        <div className="flex items-center gap-1.5">
                          <select
                            disabled={!approved}
                            value={featured ? 'YES' : 'NO'}
                            onChange={(e) => handleToggleHomepage(review, e.target.value === 'YES')}
                            aria-label={`Homepage setting for review #${review.reviewId}`}
                            title={!approved ? 'Only approved reviews can be added to the homepage' : undefined}
                            className={homepageSelectClass(approved, featured)}
                          >
                            <option value="NO">Do not show</option>
                            <option value="YES" disabled={!approved}>
                              Add to home
                            </option>
                          </select>
                          {featured && (
                            <span title="Active on home page" className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                              <Home size={11} />
                            </span>
                          )}
                        </div>
                        {!approved && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Approve first</p>}
                      </td>

                      <td className={`${ADMIN_TABLE.td} whitespace-nowrap text-xs text-slate-500 dark:text-slate-400`}>
                        {formatDate(review.createdAt)}
                      </td>

                      <td className={ADMIN_TABLE.td}>
                        <div className="flex items-center justify-end gap-1">
                          <IconAction label="View details" onClick={() => setSelectedReview(review)}>
                            <Eye size={15} />
                          </IconAction>
                          {review.status !== 'APPROVED' && (
                            <IconAction label="Approve review" tone="success" disabled={isModerating} onClick={() => handleOpenApproveModal(review)}>
                              <Check size={15} />
                            </IconAction>
                          )}
                          {review.status !== 'REJECTED' && (
                            <IconAction label="Reject review" tone="danger" disabled={isModerating} onClick={() => handleOpenRejectModal(review)}>
                              <X size={15} />
                            </IconAction>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          meta={zeroBasedMeta({ page, totalPages, totalElements, pageSize: PAGE_SIZE })}
          onPageChange={(nextPage) => setPage(Math.max(0, nextPage - 1))}
          disabled={isFetching}
        />
      </Card>

      {/* Review details drawer */}
      {selectedReview && (
        <Drawer
          open
          onClose={() => setSelectedReview(null)}
          title={`Review #${selectedReview.reviewId}`}
          description="Review details and moderation"
          width="lg"
          footer={
            (
              <>
                {selectedReview.status !== 'REJECTED' && (
                  <Button variant="dangerOutline" disabled={isModerating} onClick={() => handleOpenRejectModal(selectedReview)}>
                    <X size={15} className="mr-1.5" /> Reject
                  </Button>
                )}
                {selectedReview.status !== 'APPROVED' && (
                  <Button disabled={isModerating} onClick={() => handleOpenApproveModal(selectedReview)} className="!bg-emerald-600 !text-white hover:!bg-emerald-700">
                    <Check size={15} className="mr-1.5" /> Approve
                  </Button>
                )}
              </>
            )
          }
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selectedReview.status} />
              <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {selectedReview.rating} / 5
              </Badge>
              <TargetBadge type={selectedReview.targetType} />
              {homepageReviewIds.has(String(selectedReview.reviewId)) && (
                <Badge tone="info">
                  <Home size={12} /> On homepage
                </Badge>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Comment</p>
              <p className="whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm leading-6 text-slate-800 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-200">
                {selectedReview.comment || <span className="italic text-slate-400 dark:text-slate-500">No written comment provided.</span>}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Feature on homepage</p>
                  <p className={`mt-0.5 text-xs ${selectedReview.status !== 'APPROVED' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {selectedReview.status !== 'APPROVED'
                      ? 'Review must be approved before it can be added to the homepage.'
                      : 'Show this review in the homepage testimonials.'}
                  </p>
                </div>
                <select
                  disabled={selectedReview.status !== 'APPROVED'}
                  value={homepageReviewIds.has(String(selectedReview.reviewId)) ? 'YES' : 'NO'}
                  onChange={(e) => handleToggleHomepage(selectedReview, e.target.value === 'YES')}
                  aria-label="Homepage display"
                  title={selectedReview.status !== 'APPROVED' ? 'Review must be approved first' : undefined}
                  className={homepageSelectClass(selectedReview.status === 'APPROVED', homepageReviewIds.has(String(selectedReview.reviewId)))}
                >
                  <option value="NO">Do not show</option>
                  <option value="YES" disabled={selectedReview.status !== 'APPROVED'}>
                    Show on home
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Reviewer ID"><CopyableId id={selectedReview.userId} label="User ID" /></InfoTile>
              <InfoTile label="Target ID"><CopyableId id={selectedReview.targetId} label="Target ID" /></InfoTile>
              <InfoTile label="Submitted"><span className="text-xs font-medium">{formatDate(selectedReview.createdAt)}</span></InfoTile>
              <InfoTile label="Last moderated"><span className="text-xs font-medium">{formatDate(selectedReview.moderatedAt)}</span></InfoTile>
              {selectedReview.moderatedBy && (
                <InfoTile label="Moderated by" className="col-span-2"><span className="text-xs font-medium">{selectedReview.moderatedBy}</span></InfoTile>
              )}
            </div>

            {selectedReview.moderationReason && (
              <InlineAlert tone="danger" title="Moderation reason">
                <span className="whitespace-pre-wrap">{selectedReview.moderationReason}</span>
              </InlineAlert>
            )}
          </div>
        </Drawer>
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
            <Button variant="outline" onClick={() => setApprovalModalReview(null)} disabled={isModerating}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApprove} isLoading={isModerating} className="!bg-emerald-600 !text-white hover:!bg-emerald-700">
              <ShieldCheck size={15} className="mr-1.5" /> Approve Review
            </Button>
          </>
        }
      >
        {approvalModalReview && (
          <div className="space-y-3.5">
            <ReviewQuote review={approvalModalReview} />
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
            <Button onClick={handleConfirmReject} isLoading={isModerating} variant="danger">
              <ShieldX size={15} className="mr-1.5" /> Reject Review
            </Button>
          </>
        }
      >
        {rejectionModalReview && (
          <div className="space-y-3.5">
            <ReviewQuote review={rejectionModalReview} />

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Moderation reason <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">{rejectionReason.length} / 2000</span>
              </div>
              <textarea
                id="rejection-reason"
                rows={3}
                maxLength={2000}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Inappropriate language, spam, off-topic..."
                className="w-full rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This note will be saved in the admin audit trail.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReviewQuote({ review }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
      <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
        <span>Review #{review.reviewId}</span>
        <RatingStars rating={review.rating} />
      </div>
      <p className="mt-2 italic text-slate-600 dark:text-slate-400">“{review.comment || 'No written comment'}”</p>
    </div>
  );
}
