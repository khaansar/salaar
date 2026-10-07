'use client';

import { BookOpen, BarChart2, Search, Lightbulb, Target, Trophy, ShieldCheck } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';

const values = [
  { name: 'Exam-Like Experience', desc: 'Practice with a real exam interface and time limits.', icon: BookOpen, tone: 'bg-brand-50 text-brand-600' },
  { name: 'AI-Powered Insights', desc: 'Get detailed analysis and personalized recommendations.', icon: BarChart2, tone: 'bg-emerald-50 text-emerald-600' },
  { name: 'Extensive Question Bank', desc: 'Mock tests, topic tests and previous year papers.', icon: Search, tone: 'bg-rose-50 text-rose-500' },
  { name: 'Detailed Solutions', desc: 'Step-by-step explanations for every question.', icon: Lightbulb, tone: 'bg-amber-50 text-amber-500' },
  { name: 'Track Your Progress', desc: 'Monitor your performance and focus on weak areas.', icon: Target, tone: 'bg-rose-50 text-rose-500' },
  { name: 'Designed by Experts', desc: 'High-quality content curated by subject experts.', icon: Trophy, tone: 'bg-rose-50 text-rose-500' },
];

export default function ValueStrip() {
  const { user } = useAppSelector((state) => state.auth);
  if (!!user) return null;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <ShieldCheck size={20} className="text-brand-600" /> Why Choose ClearIt?
      </h2>
      <p className="mt-1 text-xs text-slate-500">Everything you need to crack your exam, in one place.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v) => (
          <div key={v.name} className="flex items-start gap-3 rounded-xl bg-slate-50/70 p-4 dark:bg-slate-800/40">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${v.tone}`}>
              <v.icon size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{v.name}</h3>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
