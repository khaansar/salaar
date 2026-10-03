'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector } from '../../hooks/useAppSelector';
import { ArrowRight, Bot, TrendingUp, BarChart2, Lightbulb, Monitor, Sparkles, FileText, Trophy } from 'lucide-react';

function FloatCard({ icon: Icon, tone, title, text, className }) {
  return (
    <div className={`absolute hidden w-48 items-start gap-2.5 rounded-xl border border-white bg-white/90 p-3 shadow-lg shadow-indigo-500/10 backdrop-blur md:flex ${className}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs font-bold text-slate-900">{title}</p>
        <p className="text-[11px] leading-4 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

const trust = [
  { icon: Monitor, label: 'Real Exam Interface' },
  { icon: Sparkles, label: 'AI-Powered Analysis' },
  { icon: FileText, label: 'Previous Year Papers' },
  { icon: Lightbulb, label: 'Detailed Solutions' },
];

export default function HeroSection() {
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;
  const name = user?.firstName || 'there';

  if (isAuthenticated) {
    return (
      <section className="mb-6 -mt-4 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 text-slate-900 dark:text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">{name}</span>!
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-[#f6f4ff] to-[#ebe7ff] dark:border-white/5 dark:from-slate-900 dark:via-indigo-950/40 dark:to-purple-950/40">
      <div className="grid items-center gap-6 px-6 py-10 sm:px-10 lg:grid-cols-12 lg:py-12">
        <div className="lg:col-span-6">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-[11px] font-semibold text-brand-600">
            <Trophy size={12} /> Your Competitive Exam Partner
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Practice Smarter.
            <span className="block text-brand-600">Crack Your Exam.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Full-length mock tests, previous year papers, AI-powered insights and personalized practice to help you achieve your dream.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/tests" className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">
              Start a Mock Test <ArrowRight size={16} />
            </Link>
            <Link href="/test-series" className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-600 hover:text-brand-600">
              Explore Test Series
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <Icon size={14} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-72 sm:h-[26rem] lg:col-span-6">
          <div className="absolute inset-0 md:inset-x-12">
            <Image src="/images/home/hero-student.svg" alt="Student studying at laptop" fill priority unoptimized className="object-contain" />
          </div>
          <FloatCard icon={Bot} tone="bg-brand-600 text-white" title="AI Mentor" text="Get personalized study suggestions" className="left-0 top-2" />
          <FloatCard icon={TrendingUp} tone="bg-emerald-500 text-white" title="Improve Your Rank" text="Practice smarter" className="right-0 top-0" />
          <FloatCard icon={BarChart2} tone="bg-blue-500 text-white" title="Weak Topic Analysis" text="Identify weak areas" className="left-0 top-36" />
          <FloatCard icon={Lightbulb} tone="bg-amber-100 text-amber-500" title="Detailed Solutions" text="Step-by-step explanations" className="right-2 top-32" />
        </div>
      </div>
    </section>
  );
}