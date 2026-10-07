'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Star } from 'lucide-react';

// TODO: replace with real testimonials when available
const items = [
  { name: 'Rohit Sharma', exam: 'SSC CGL 2024', grad: 'from-orange-400 to-rose-500', text: 'The mock tests are very close to the actual exam. The detailed solutions really help in understanding the concepts.' },
  { name: 'Priya Verma', exam: 'Banking Aspirant', grad: 'from-pink-400 to-purple-500', text: 'The analytics helped me identify my weak areas and improve my score significantly. Highly recommended!' },
  { name: 'Amit Kumar', exam: 'Railway RRB 2024', grad: 'from-sky-400 to-indigo-500', text: 'Best platform for competitive exam preparation. The previous year papers and test series are excellent.' },
];

export default function Testimonials({ testimonials = [] }) {
  const displayItems = testimonials?.length > 0 
    ? testimonials.map((t, i) => ({
        name: t.authorName || 'Anonymous',
        exam: 'ClearIt Student', 
        grad: ['from-orange-400 to-rose-500', 'from-pink-400 to-purple-500', 'from-sky-400 to-indigo-500'][i % 3],
        text: t.comment,
        rating: t.rating || 5
      }))
    : items;

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
          <p className="mt-1 text-xs text-slate-500">Join aspirants building confidence and achieving their goals with ClearIt.</p>
        </div>
        <div className="flex gap-2">
          {[[-1, ChevronLeft, 'Previous'], [1, ChevronRight, 'Next']].map(([d, Icon, label]) => (
            <button key={label} type="button" aria-label={label} onClick={() => scroll(d)} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-600">
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div ref={ref} className="flex snap-x gap-3 overflow-x-auto lg:grid lg:grid-cols-3 lg:overflow-visible">
        {displayItems.map((t, idx) => (
          <figure key={`${t.name}-${idx}`} className="flex min-w-[85%] snap-center flex-col justify-between rounded-xl border border-slate-200 p-4 sm:min-w-[60%] lg:min-w-0 dark:border-slate-800">
            <blockquote className="text-xs leading-5 text-slate-600">&ldquo;{t.text}&rdquo;</blockquote>
            <figcaption className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.grad} text-xs font-bold text-white`}>
                  {t.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                </span>
                <span>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">{t.name}</span>
                  <span className="block text-[11px] text-slate-500">{t.exam}</span>
                </span>
              </span>
              <span className="flex gap-0.5 text-amber-400">
                {[...Array(t.rating || 5)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
