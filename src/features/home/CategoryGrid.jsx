import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

// Category icons come from the API by name (e.g. "Landmark"), so resolve them dynamically.
const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

export default function CategoryGrid({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section
      aria-labelledby="popular-exams-heading"
      className="w-full"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="popular-exams-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Popular exams
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Choose your exam and start preparing today.
          </p>
        </div>
        <Link
          href="/categories"
          className={`inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
        >
          View all exams <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <li key={cat.id} className="flex">
            <Link
              href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
              className={`group flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-colors hover:border-brand-600 ${focusRing} dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
                <DynamicIcon name={cat.icon || 'Folder'} size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>

              <h3 className="mt-3 truncate text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {cat.description || 'Mock tests and previous year papers'}
              </p>

              <div className="mt-auto flex items-center justify-between gap-1 pt-3">
                {cat.testCount != null ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {cat.testCount}+ tests
                  </span>
                ) : (
                  <span />
                )}
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-slate-500 dark:group-hover:text-indigo-400"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}