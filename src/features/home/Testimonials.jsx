'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Star } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { homepageReviewService } from '../../services/homepageReviewService';

// Default fallback testimonials (shown when no reviews are designated for homepage)
const defaultItems = [
  { name: 'Rohit Sharma', exam: 'SSC CGL 2024', grad: 'from-orange-400 to-rose-500', text: 'The mock tests are very close to the actual exam. The detailed solutions really help in understanding the concepts.', rating: 5 },
  { name: 'Priya Verma', exam: 'Banking Aspirant', grad: 'from-pink-400 to-purple-500', text: 'The analytics helped me identify my weak areas and improve my score significantly. Highly recommended!', rating: 5 },
  { name: 'Amit Kumar', exam: 'Railway RRB 2024', grad: 'from-sky-400 to-indigo-500', text: 'Best platform for competitive exam preparation. The previous year papers and test series are excellent.', rating: 5 },
];

const GRADIENTS = [
  'from-orange-400 to-rose-500',
  'from-pink-400 to-purple-500',
  'from-sky-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
];

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

  // When admin designates reviews for the homepage, display only approved reviews in place of the default hardcoded items
  const approvedReviews = (activeReviews || []).filter(
    (t) => !t.status || t.status === 'APPROVED'
  );

  const displayItems = approvedReviews.length > 0
    ? approvedReviews.map((t, i) => ({
        name: t.name || t.authorName || t.userName || 'Student',
        exam: t.exam || t.seriesName || (t.targetType === 'PLATFORM' ? `${siteConfig.name} Platform` : `${siteConfig.name} Student`),
        grad: GRADIENTS[i % GRADIENTS.length],
        text: t.text || t.comment || '',
        rating: Number(t.rating) || 5,
      }))
    : defaultItems;

  const ref = useRef(null);
  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <MessageSquare size={20} className="text-brand-600" /> What Our Students Say
          </h2>
          <p className="mt-1 text-xs text-slate-500">Join thousands of aspirants who are achieving their goals with {siteConfig.name}.</p>
        </div>
        <div className="flex gap-2">
          {[[-1, ChevronLeft, 'Previous'], [1, ChevronRight, 'Next']].map(([d, Icon, label]) => (
            <button key={label} type="button" aria-label={label} onClick={() => scroll(d)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-600">
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        className={`flex snap-x gap-3 overflow-x-auto ${
          displayItems.length === 1
            ? 'lg:grid lg:grid-cols-1 max-w-lg'
            : displayItems.length === 2
            ? 'lg:grid lg:grid-cols-2 max-w-3xl'
            : 'lg:grid lg:grid-cols-3'
        } lg:overflow-visible`}
      >
        {displayItems.map((t, idx) => {
          const initials = (t.name || 'Student')
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'ST';

          return (
            <figure
              key={`${t.name}-${idx}`}
              className="flex min-w-[85%] snap-center flex-col justify-between rounded-xl border border-slate-200 p-4 sm:min-w-[60%] lg:min-w-0 dark:border-slate-800"
            >
              <blockquote className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.grad} text-xs font-bold text-white`}
                  >
                    {initials}
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {t.exam}
                    </span>
                  </span>
                </span>
                <span className="flex gap-0.5 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-current" />
                  ))}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}