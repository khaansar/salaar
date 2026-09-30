import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

// A dynamic icon component
const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};

// We will fetch categories from catalogService in the parent and pass as props
export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Browse by Category</h2>
        <Link href="/categories" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/test-series?category=${cat.slug}`}
            className="group flex min-h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${cat.bg || 'bg-indigo-50 dark:bg-indigo-500/10'} ${cat.color || 'text-indigo-600 dark:text-indigo-300'}`}>
              <DynamicIcon name={cat.icon || 'Folder'} size={20} strokeWidth={1.8} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</h3>
              <ArrowRight size={14} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
