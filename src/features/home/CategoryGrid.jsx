import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import * as Icons from 'lucide-react';

const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Flame size={20} className="fill-orange-500 text-orange-500" /> Popular Exams
          </h2>
          <p className="mt-1 text-xs text-slate-500">Choose from a wide range of exams and start your preparation today.</p>
        </div>
        <Link href="/categories" className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
          View All Exams <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/test-series?category=${cat.slug}`}
            className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${cat.bg || 'bg-brand-50'} ${cat.color || 'text-brand-600'}`}>
              <DynamicIcon name={cat.icon || 'Folder'} size={28} strokeWidth={1.8} />
            </div>
            <h3 className="mt-3 truncate text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{cat.description || 'Mock Tests & PYQs'}</p>
            {cat.testCount != null && (
              <span className="mt-3 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {cat.testCount}+ Tests
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}