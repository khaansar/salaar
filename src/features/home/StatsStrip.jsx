import { Users, FileText, ThumbsUp, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '100K+', label: 'Students Trust Us' },
  { icon: FileText, value: '5K+', label: 'Mock Tests' },
  { icon: ThumbsUp, value: '95%', label: 'Recommend Us' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', fill: true },
];

export default function StatsStrip() {
  return (
    <section className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-5 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center justify-center gap-3">
          <s.icon size={30} className={s.fill ? 'fill-amber-400 text-amber-400' : 'text-brand-600'} />
          <div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[11px] text-slate-500">{s.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}