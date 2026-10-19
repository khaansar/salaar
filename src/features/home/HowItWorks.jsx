'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  PlayCircle,
  BarChart3,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const steps = [
  {
    step: '01',
    phase: 'EXPLORE',
    href: '/categories',
    icon: Compass,
    title: 'Choose your exam',
    text: 'Pick from a wide range of competitive exams.',
    accent: {
      pill: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      iconBg: 'bg-blue-100/70 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
      borderHover: 'hover:border-blue-400 dark:hover:border-blue-500/50',
    },
    renderPreview: () => (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            <CheckCircle2 size={10} /> SSC CGL
          </span>
          <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Banking PO
          </span>
          <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            GATE
          </span>
        </div>
        <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
          50+ Curated Exam Patterns
        </p>
      </div>
    ),
  },
  {
    step: '02',
    phase: 'PRACTICE',
    href: '/tests',
    icon: PlayCircle,
    title: 'Take mock tests',
    text: 'Practice on the real exam interface with real-pattern questions.',
    accent: {
      pill: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      iconBg: 'bg-purple-100/70 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
      borderHover: 'hover:border-purple-400 dark:hover:border-purple-500/50',
    },
    renderPreview: () => (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[10px] dark:border-zinc-800 dark:bg-zinc-900">
          <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-zinc-200">
            <Clock size={10} className="text-purple-500" /> 01:45:00
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            38/100 Qs
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
          <span className="h-1.5 flex-1 rounded-full bg-emerald-500" />
          <span className="h-1.5 flex-1 rounded-full bg-amber-400" />
          <span className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
          <span className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    ),
  },
  {
    step: '03',
    phase: 'DIAGNOSE',
    href: '/analytics',
    icon: BarChart3,
    title: 'Analyze performance',
    text: 'See detailed analysis and find your weak areas.',
    accent: {
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-100/70 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-500/50',
    },
    renderPreview: () => (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-slate-900 dark:text-white">
            Accuracy: 88.5%
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Top 4% Rank
          </span>
        </div>
        <div className="rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[10px] text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Focus:</span> Speed Math (-2m)
        </div>
      </div>
    ),
  },
  {
    step: '04',
    phase: 'MASTER',
    href: '/my-learning',
    icon: Trophy,
    title: 'Improve and repeat',
    text: 'Focus on weak topics and keep raising your score.',
    accent: {
      pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      iconBg: 'bg-amber-100/70 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-500/50',
    },
    renderPreview: () => (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={11} /> +32 Marks
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-500">
            <Flame size={11} /> 12-Day Streak
          </span>
        </div>
        <div className="rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Target Status: <span className="text-indigo-600 dark:text-indigo-400">Ready for Exam</span>
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-[#121316] relative overflow-hidden"
    >
      {/* Header with Eyebrow and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 mb-2">
            <Sparkles size={11} />
            <span>Preparation Framework</span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            How it works
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Start preparing in four steps. Turn daily practice into measurable exam rank.
          </p>
        </div>

        <Link
          href="/tests"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer transition-colors shrink-0"
        >
          <span>Start Free Mock Test</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Visual Timeline Pipeline (Desktop) */}
      <div className="hidden lg:grid grid-cols-4 gap-4 mt-6 mb-1">
        {steps.map((item, i) => {
          const isActive = activeStep === i;
          return (
            <div
              key={item.step}
              onClick={() => setActiveStep(i)}
              className="flex items-center gap-2 text-xs cursor-pointer group"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`font-semibold truncate transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 group-hover:text-slate-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                }`}
              >
                {item.title}
              </span>
              {i < steps.length - 1 && (
                <ArrowRight
                  size={12}
                  className="ml-auto text-slate-300 dark:text-zinc-700 shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 4 Process Milestone Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeStep === i;

          return (
            <Link
              key={item.step}
              href={item.href}
              onMouseEnter={() => setActiveStep(i)}
              className={`relative rounded-xl border p-4.5 sm:p-5 flex flex-col justify-between transition-all duration-300 group cursor-pointer ${
                isActive
                  ? 'border-indigo-500/80 bg-slate-50/90 dark:border-zinc-700 dark:bg-[#18191d] shadow-sm -translate-y-1'
                  : 'border-slate-200/70 bg-slate-50/50 dark:border-zinc-800/80 dark:bg-[#18191d]/70 hover:shadow-md hover:-translate-y-0.5'
              } ${item.accent.borderHover}`}
            >
              {/* Giant Watermark Step Number */}
              <span className="absolute top-2.5 right-3 font-mono font-black text-4xl sm:text-5xl text-slate-200/70 dark:text-zinc-800/60 select-none pointer-events-none transition-all duration-300 group-hover:scale-105 group-hover:text-indigo-500/20">
                {item.step}
              </span>

              <div>
                {/* Step Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${item.accent.pill}`}
                  >
                    STEP {item.step} • {item.phase}
                  </span>
                </div>

                {/* Floating Icon */}
                <div
                  className={`mt-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 shadow-xs dark:border-white/5 transition-transform duration-300 group-hover:scale-105 ${item.accent.iconBg}`}
                >
                  <Icon size={20} />
                </div>

                {/* Title & Description */}
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[32px]">
                  {item.text}
                </p>
              </div>

              {/* Inset Micro-UI Preview Widget */}
              <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-zinc-800/70">
                <div className="rounded-lg border border-slate-200/60 bg-white/90 p-2.5 shadow-xs dark:border-zinc-800/60 dark:bg-[#121316]">
                  {item.renderPreview()}
                </div>

                {/* Footer action hint */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400 transition-colors">
                  <span>Explore step</span>
                  <ArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}