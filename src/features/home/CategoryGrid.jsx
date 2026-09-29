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
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse by Category</h2>
        <Link href="/categories" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/test-series?category=${cat.slug}`}
            className="group flex flex-col items-center justify-center pt-6 pb-4 px-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all text-center h-full"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${cat.bg || 'bg-slate-50 dark:bg-slate-800'} ${cat.color || 'text-slate-600 dark:text-slate-400'}`}>
              <DynamicIcon name={cat.icon || 'Folder'} size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm leading-tight flex-1 flex items-center">{cat.name}</h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-auto">
              {cat.testCount}+ Tests <span className="text-slate-300 dark:text-slate-600 font-bold">&gt;</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
