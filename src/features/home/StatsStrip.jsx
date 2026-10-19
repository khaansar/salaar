import { Users, FileText, ThumbsUp, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '100K+', label: 'Students Trust Us' },
  { icon: FileText, value: '5K+', label: 'Mock Tests' },
  { icon: ThumbsUp, value: '95%', label: 'Recommend Us' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', fill: true },
];

export default function StatsStrip() {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white py-4 px-4 sm:px-6 shadow-xs dark:border-zinc-800 dark:bg-[#121316]">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
        {stats.map((s, idx) => (
          <div key={s.label} className={`flex items-center justify-center gap-3 ${idx > 0 ? 'pt-3 md:pt-0' : ''}`}>
            <s.icon size={26} className={s.fill ? 'fill-amber-400 text-amber-400' : 'text-brand-600'} />
            <div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}