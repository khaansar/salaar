'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { homepageReviewService } from '../../services/homepageReviewService';

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

export default function Testimonials({ testimonials = [] }) {
  const [activeReviews, setActiveReviews] = useState(() => {
    return Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : [];
  });

  useEffect(() => {
    const sync = () => {
      const stored = homepageReviewService.getHomepageReviews();
      if (stored && stored.length > 0) {
        setActiveReviews(stored);
      } else if (Array.isArray(testimonials) && testimonials.length > 0) {
        setActiveReviews(testimonials);
      } else {
        setActiveReviews([]);
      }
    };

    sync();
    return homepageReviewService.subscribeHomepageReviews(sync);
  }, [testimonials]);

  const ref = useRef(null);
  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  // Only approved reviews are shown on the homepage
  const approvedReviews = (activeReviews || []).filter(
    (t) => !t.status || t.status === 'APPROVED'
  );

  const displayItems = approvedReviews.map((t) => ({
    name: t.name || t.authorName || t.userName || 'Student',
    exam:
      t.exam ||
      t.seriesName ||
      (t.targetType === 'PLATFORM' ? `${siteConfig.name} Platform` : `${siteConfig.name} Student`),
    text: t.text || t.comment || '',
    rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
  }));

  if (displayItems.length === 0) return null;

  const layout =
    displayItems.length === 1
      ? 'lg:grid lg:max-w-lg lg:grid-cols-1'
      : displayItems.length === 2
      ? 'lg:grid lg:max-w-3xl lg:grid-cols-2'
      : 'lg:grid lg:grid-cols-3';

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id="testimonials-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            What our students say
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Aspirants are reaching their goals with {siteConfig.name}.
          </p>
        </div>
        {/* Scroll controls only matter while the list scrolls sideways (below lg) */}
        <div className="flex gap-2 lg:hidden">
          {[[-1, ChevronLeft, 'Previous reviews'], [1, ChevronRight, 'Next reviews']].map(([d, Icon, label]) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => scroll(d)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-600 hover:text-brand-600 ${focusRing} dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white`}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={ref}
        className={`flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible lg:pb-0 ${layout}`}
      >
        {displayItems.map((t, idx) => {
          const initials =
            t.name
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase() || 'ST';

          return (
            <li key={`${t.name}-${idx}`} className="flex min-w-[85%] snap-center sm:min-w-[60%] lg:min-w-0">
              <figure className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex gap-0.5 text-amber-400" role="img" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-current" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="mb-4 mt-3 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                <figcaption className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600 dark:bg-slate-800 dark:text-indigo-300"
                  >
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{t.name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t.exam}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}