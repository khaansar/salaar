'use client';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

// A real sequence, so the steps are numbered and rise left to right.
const steps = [
  { label: 'Practice', height: 'h-14' },
  { label: 'Analyze', height: 'h-24' },
  { label: 'Improve', height: 'h-32' },
  { label: 'Crack your exam', height: 'h-40' },
];

const ctaClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600';

export default function JoinBanner() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl bg-brand-600 dark:bg-gradient-to-br dark:from-[#181920] dark:to-[#121316] dark:border dark:border-slate-800">
      <div className="grid items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-12 lg:py-12">
        {/* Copy */}
        <div className="lg:col-span-6">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Join 100K+ aspirants and start preparing today.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            Get full-length mock tests, previous year papers, detailed solutions and AI-powered insights in one place.
          </p>

          <div className="mt-7">
            {user ? (
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={ctaClass}>
                Start your preparation <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <Link href="/signup" className={ctaClass}>
                Start your preparation <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Progress steps */}
        <ol className="flex items-end gap-2 lg:col-span-6 lg:pl-8" aria-label="Your preparation path">
          {steps.map(({ label, height }, i) => {
            const last = i === steps.length - 1;
            return (
              <li key={label} className="flex min-w-0 flex-1 flex-col items-center">
                {last && <Trophy size={32} className="mb-2 text-amber-300" aria-hidden="true" />}
                <div
                  className={`flex w-full flex-col justify-between rounded-t-xl p-3 ${height} ${
                    last ? 'bg-white text-brand-700' : 'bg-white/15 text-white'
                  }`}
                >
                  <span className={`text-xs font-semibold tabular-nums ${last ? 'text-brand-600' : 'text-white/60'}`}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold leading-4 sm:text-sm">{label}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}