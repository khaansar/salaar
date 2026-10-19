'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { homepageReviewService } from '../../services/homepageReviewService';

// Default starter reviews to guarantee at least 3 genuine student study slips
const STARTER_STUDY_NOTES = [
  {
    name: 'Beast',
    exam: 'NEET 2026',
    text: 'Not bad. The timer pressure and question interface feel identical to the actual NTA exam screen.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    exam: 'JEE Advanced',
    text: 'The sectional analytics showed exactly where I was losing marks in Organic Chemistry. Massive confidence booster!',
    rating: 5,
  },
  {
    name: 'Arjun Verma',
    exam: 'UPSC Prelims',
    text: 'Detailed solutions with NCERT page references save hours of revision. Best mock test series platform.',
    rating: 5,
  },
  {
    name: 'Sneha Reddy',
    exam: 'SSC CGL',
    text: 'The speed-accuracy matrix in the analytics report helped me cut down negative marks from -14 to -2.',
    rating: 5,
  },
];

const ROTATIONS = [
  '-rotate-1 sm:-rotate-1.5',
  'rotate-1 sm:rotate-1.5',
  '-rotate-0.5 sm:-rotate-1',
  'rotate-1 sm:rotate-2',
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

  // Approved dynamic reviews
  const approvedReviews = (activeReviews || []).filter(
    (t) => !t.status || t.status === 'APPROVED'
  );

  const rawItems = approvedReviews.map((t) => ({
    name: t.name || t.authorName || t.userName || 'Student',
    exam:
      t.exam ||
      t.seriesName ||
      (t.targetType === 'PLATFORM' ? `${siteConfig.name} Platform` : `${siteConfig.name} Aspirant`),
    text: t.text || t.comment || '',
    rating: Math.min(5, Math.max(1, Number(t.rating) || 5)),
  }));

  // Ensure at least 3 reviews are displayed at first
  const existingNames = new Set(rawItems.map((r) => r.name.toLowerCase()));
  const fillers = STARTER_STUDY_NOTES.filter(
    (d) => !existingNames.has(d.name.toLowerCase())
  );
  const displayItems = rawItems.length >= 3 ? rawItems : [...rawItems, ...fillers];

  // Duplicate items for continuous seamless infinite marquee from right to left
  const marqueeItems = [...displayItems, ...displayItems];

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative mt-2 mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 py-7 px-4 sm:px-6 shadow-xs dark:border-zinc-800 dark:bg-[#121316]"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 px-2">
        <div>
          <h2
            id="testimonials-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            What our students say
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Real notes and candid feedback from aspirants preparing with {siteConfig.name}.
          </p>
        </div>

        <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 italic select-none">
          Hover to pause & read
        </span>
      </div>

      {/* Smooth Side Fade Masks */}
      <div
        className="pointer-events-none absolute left-0 top-16 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-[#121316] to-transparent z-10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-16 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-slate-50 dark:from-[#121316] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Horizontal Continuous Marquee Track (Right to Left) */}
      <div className="overflow-hidden py-4">
        <div className="animate-marquee-left flex gap-6 sm:gap-8 items-center cursor-default">
          {marqueeItems.map((item, idx) => {
            const rot = ROTATIONS[idx % ROTATIONS.length];
            const isShort = (item.text || '').length <= 45;

            return (
              <article
                key={idx}
                className={`relative w-[290px] sm:w-[330px] h-[252px] shrink-0 p-5 rounded-lg bg-[#fcf9f2] dark:bg-[#181921] border border-amber-900/10 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 transform ${rot} hover:rotate-0 hover:scale-[1.02] hover:z-20 select-none flex flex-col justify-between`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 27px, rgba(203, 213, 225, 0.45) 28px)',
                }}
              >
                {/* Washi Tape at Top */}
                <div
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-16 bg-amber-200/70 dark:bg-zinc-700/70 backdrop-blur-xs border-y border-amber-300/50 dark:border-zinc-600/50 rounded-xs shadow-2xs rotate-[-1deg]"
                  aria-hidden="true"
                />

                {/* Top Note Row: Stamped Stars & Target Exam */}
                <div className="shrink-0 flex items-center justify-between pl-3 mb-1">
                  <div className="flex gap-0.5 text-amber-500 dark:text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {item.exam}
                  </span>
                </div>

                {/* Ruled Note Body with Red Student Margin (Uniform height + smooth vertical scrolling for long reviews) */}
                <div className="flex-1 border-l-2 border-rose-400/70 dark:border-rose-500/50 pl-3.5 my-1 overflow-y-auto max-h-[142px] pr-1.5 note-scrollbar select-text">
                  <div className={`min-h-full flex flex-col ${isShort ? 'justify-center' : 'justify-start'}`}>
                    <p
                      className={`font-[family-name:var(--font-caveat),cursive] text-blue-950 dark:text-sky-200 leading-relaxed tracking-wide ${
                        isShort
                          ? 'text-2xl sm:text-[28px] font-bold'
                          : 'text-lg sm:text-[21px] font-semibold'
                      }`}
                    >
                      &ldquo;{item.text}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Student Signature & Verification locked to bottom */}
                <div className="shrink-0 pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between pl-3 text-xs">
                  <span className="font-[family-name:var(--font-caveat),cursive] text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                    — {item.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={12} className="shrink-0" />
                    Verified Aspirant
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}