'use client';
import Link from 'next/link';
import { ArrowRight, Trophy, Rocket } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';

const stairs = [['Practice', 'h-10'], ['Analyze', 'h-16'], ['Improve', 'h-24'], ['Crack Your Exam', 'h-32']];

export default function JoinBanner() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-r from-[#f1efff] to-[#e4defd] dark:border-slate-800 dark:from-indigo-950/40 dark:to-purple-950/40">
      <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-2">
        <div>
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-brand-600">
            <Rocket size={12} /> Ready to Start?
          </span>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            Join 100K+ Aspirants<br />and Achieve Your Dream
          </h2>
          <p className="mt-3 max-w-md text-xs leading-5 text-slate-600">
            Get access to high-quality mock tests, previous year papers, detailed solutions and AI-powered insights.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Start Your Preparation <ArrowRight size={15} />
              </button>
            ) : (
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                Start Your Preparation <ArrowRight size={15} />
              </Link>
            )}
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-brand-600 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-white">
              View Pricing
            </Link>
          </div>
        </div>

        <div className="hidden items-end justify-end gap-1.5 lg:flex" aria-hidden="true">
          <Trophy size={44} className="mb-2 mr-2 self-start text-amber-400" />
          {stairs.map(([label, h]) => (
            <div key={label} className={`flex w-28 items-start justify-center rounded-t-lg bg-brand-600/90 pt-2 text-[11px] font-bold text-white ${h}`}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}