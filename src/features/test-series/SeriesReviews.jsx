'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  PenLine,
  Loader2,
} from 'lucide-react';

import { useAppSelector } from '../../hooks/useAppSelector';
import { useToast } from '../../components/common/ToastProvider';
import { Avatar } from '../../components/ui/Avatar';
import { reviewService } from '../../services/reviewService';
import { useMyEntitlements } from '../catalog/useMyEntitlements';
import { hasActiveEntitlementForSeries } from '../catalog/entitlementUtils';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function SeriesReviews({ seriesId, slug, seriesTitle, isFree = false }) {
  const { user } = useAppSelector((state) => state.auth);
  const toast = useToast();

  const { entitlements, isLoading: entitlementsLoading } = useMyEntitlements({
    enabled: Boolean(user),
  });

  const canWriteReview =
    Boolean(user) &&
    !entitlementsLoading &&
    hasActiveEntitlementForSeries(entitlements, { seriesId, slug, isFree });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const targetId = seriesId || slug;
      const fallback = slug && slug !== targetId ? slug : seriesId;
      const data = await reviewService.getReviews(targetId, fallback);
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [seriesId, slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!canWriteReview) {
      setSubmitError('You must purchase this test series before leaving a review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a star rating (1 to 5).');
      return;
    }

    setSubmitting(true);
    try {
      const targetId = seriesId || slug;
      await reviewService.submitReview({
        targetId,
        targetType: 'SERIES',
        rating,
        comment,
      });

      setSubmitSuccess(true);
      setRating(0);
      setHoverRating(0);
      setComment('');
      toast.success(
        'Review submitted successfully! It will appear once approved by moderation.'
      );
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        'Failed to submit review. Please try again.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute average rating and count
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
          totalReviews
        ).toFixed(1)
      : null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Header with Title and Summary */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
              <Star size={18} className="fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Reviews
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified feedback from students who practiced with this test series.
              </p>
            </div>
          </div>
        </div>

        {/* Average Rating Badge */}
        {totalReviews > 0 ? (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
            <div className="text-right">
              <div className="flex items-center gap-1 text-base font-extrabold text-slate-900 dark:text-white">
                <span>{averageRating}</span>
                <span className="text-xs font-normal text-slate-400">/ 5</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="flex gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={15}
                  className={
                    s <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 dark:text-slate-700'
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 italic">
            No ratings yet
          </div>
        )}
      </div>

      {/* Box for Posting Review */}
      {canWriteReview && (
        <div className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 p-5 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-2 mb-3">
            <PenLine size={16} className="text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Write a Review
            </h3>
          </div>

          {submitSuccess && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold">Review submitted!</p>
                <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                  Your review has been submitted and will be visible publicly once verified by our moderation team.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle size={15} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Star Rating Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled =
                      (hoverRating || rating) >= starValue;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => {
                          setRating(starValue);
                          setSubmitSuccess(false);
                          setSubmitError('');
                        }}
                        onMouseEnter={() => setHoverRating(starValue)}
                        className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        aria-label={`Rate ${starValue} out of 5 stars`}
                      >
                        <Star
                          size={24}
                          className={
                            isFilled
                              ? 'fill-amber-400 text-amber-400 transition-colors'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-300 transition-colors'
                          }
                        />
                      </button>
                    );
                  })}
                </div>
                {(hoverRating || rating) > 0 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div>
              <label
                htmlFor="review-comment"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Your Feedback
              </label>
              <textarea
                id="review-comment"
                rows={3}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setSubmitSuccess(false);
                }}
                placeholder={`Share your experience with ${seriesTitle || 'this test series'} (e.g. question quality, difficulty level, explanations)...`}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Post Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recent Reviews ({totalReviews})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-100 p-4 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="mt-3 h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : totalReviews > 0 ? (
          <div className="space-y-3.5">
            {reviews.map((rev) => {
              const reviewRating = Number(rev.rating) || 5;
              const dateText = formatDate(rev.createdAt);

              return (
                <div
                  key={rev.id || `${rev.authorName}-${rev.createdAt}`}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors dark:border-slate-800/80 dark:bg-slate-800/30"
                >
                  {/* Top Bar: Author, Date, and Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={rev.authorName}
                        avatarUrl={rev.authorAvatar}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {rev.authorName || 'Student'}
                        </p>
                        {dateText && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {dateText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex gap-0.5 text-amber-400 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={
                            s <= reviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Comment */}
                  {rev.comment && (
                    <p className="mt-2.5 text-xs leading-5 text-slate-600 dark:text-slate-300 break-words">
                      {rev.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
            <MessageSquare
              size={28}
              className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
            />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No reviews yet for this test series
            </p>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              Be the first to share your experience and help other students prepare better!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
