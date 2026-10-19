'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Bot, Clock, Monitor, Sparkles, FileText, Lightbulb } from 'lucide-react';

const features = [
  { icon: Monitor, title: 'Real exam interface', text: 'Same layout, palette and timer as the actual test.' },
  { icon: FileText, title: 'Previous year papers', text: 'Solve past papers under exam conditions.' },
  { icon: Lightbulb, title: 'Detailed solutions', text: 'Step-by-step explanations for every question.' },
  { icon: Sparkles, title: 'AI-powered analysis', text: 'See exactly which topics are costing you marks.' },
];

// Question palette states, as used in real computer-based exams.
const palette = [
  'a', 'a', 'a', 'n', 'a', 'm', 'c',
  'u', 'u', 'u', 'u', 'u', 'u', 'u',
  'u', 'u', 'u', 'u', 'u', 'u',
];

const paletteStyle = {
  a: 'bg-emerald-500 text-white',
  n: 'bg-rose-500 text-white',
  m: 'bg-violet-500 text-white rounded-full',
  c: 'bg-brand-600 text-white ring-2 ring-brand-600/30 ring-offset-1 dark:ring-offset-slate-900',
  u: 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const legend = [
  { key: 'a', label: 'Answered' },
  { key: 'n', label: 'Not answered' },
  { key: 'm', label: 'Marked' },
  { key: 'u', label: 'Not visited' },
];

const options = ['30 km/h', '36 km/h', '40 km/h', '54 km/h'];

function formatTime(total) {
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function ExamPreview() {
  const [seconds, setSeconds] = useState(6138);
  const [selected, setSelected] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div
        role="group"
        aria-label="Exam interface preview"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-indigo-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30"
      >
        {/* Exam title bar */}
        <div className="flex items-center justify-between bg-brand-600 px-4 py-2.5 text-white">
          <p className="text-sm font-semibold">Mock Test 01 · Quantitative Aptitude</p>
          <p className="flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-sm font-semibold tabular-nums">
            <Clock size={14} aria-hidden="true" />
            <span aria-label="Time left">{formatTime(seconds)}</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-[1fr_12rem]">
          {/* Question */}
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Question 7 of 20 · +1 / −0.25</p>
            <p className="mt-2 text-[15px] font-medium leading-6 text-slate-900 dark:text-white">
              A train 150 m long passes a pole in 15 seconds. What is its speed in km/h?
            </p>
            <ul className="mt-4 space-y-2">
              {options.map((opt, i) => {
                const active = selected === i;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => setSelected(i)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                        active
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-white'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          active ? 'border-brand-600' : 'border-slate-300 dark:border-slate-500'
                        }`}
                      >
                        {active && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                      </span>
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Question palette */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 sm:border-l sm:border-t-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Question palette</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-5">
              {palette.map((state, i) => (
                <span
                  key={i}
                  className={`flex h-7 items-center justify-center rounded-md text-[11px] font-semibold ${paletteStyle[state]}`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-1">
              {legend.map(({ key, label }) => (
                <li key={key} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className={`h-3 w-3 rounded-sm ${paletteStyle[key]}`} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div aria-hidden="true" className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">
            Mark for review
          </span>
          <span className="rounded-md bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white">Save &amp; next</span>
        </div>
      </div>

      {/* AI insight: the one element that sits outside the exam window */}
      <div className="mt-3 flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg shadow-indigo-900/10 dark:border-white/10 dark:bg-slate-900 lg:absolute lg:-bottom-8 lg:-left-10 lg:mt-0 lg:w-72">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Bot size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">Time &amp; Work needs practice</p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            3 of 8 correct in your last test. Try 10 more questions.
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="img" aria-label="3 of 8 correct">
            <div className="h-full w-[37.5%] rounded-full bg-amber-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <section className="relative mb-12 overflow-hidden">
      <div className="grid items-center gap-10 py-4 sm:py-6 lg:grid-cols-12 lg:gap-8 lg:py-8">
        {/* Copy */}
        <div className="lg:col-span-5">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Practice on the real exam interface.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
            Full-length mock tests, previous year papers and step-by-step solutions, with AI analysis that shows which topics to fix next.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tests"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              Start a mock test
            </Link>
            <Link
              href="/test-series"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-brand-600 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-transparent dark:text-slate-100"
            >
              Explore test series
            </Link>
          </div>

          <ul className="mt-9 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-800">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Live exam preview */}
        <div className="lg:col-span-7 lg:pl-10">
          <ExamPreview />
        </div>
      </div>
    </section>
  );
}