import { CheckCircle, BarChart2, BookOpen, Zap } from 'lucide-react';

export default function ValueStrip() {
  const values = [
    { name: 'Real exam experience', icon: CheckCircle, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/10' },
    { name: 'Detailed performance analysis', icon: BarChart2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
    { name: 'Step-by-step solutions', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
    { name: 'Curated by experts', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/10' },
  ];

  return (
    <div className="flex flex-wrap justify-center lg:justify-between gap-4 mb-16 px-4">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className={`flex items-center justify-center ${v.color}`}>
            <v.icon size={20} className="fill-current/20" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm whitespace-nowrap">{v.name}</span>
        </div>
      ))}
    </div>
  );
}
