import { Users, FileText, ThumbsUp, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '100K+', label: 'Students Trust Us' },
  { icon: FileText, value: '5K+', label: 'Mock Tests' },
  { icon: ThumbsUp, value: '95%', label: 'Recommend Us' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', fill: true },
];

export default function StatsStrip() {
  return (
    <section className="mb-10 sm:mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <s.icon size={28} className={s.fill ? 'fill-amber-400 text-amber-400' : 'text-brand-600'} />
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}