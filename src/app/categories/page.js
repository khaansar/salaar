import Link from 'next/link';
import * as Icons from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';
import { catalogService } from '../../services/catalogService';
import { siteConfig } from '../../config/site';

export const metadata = {
  title: siteConfig.formatTitle('Categories'),
  description: 'Browse mock tests by exam category.',
};

// Needs the API at request time, so don't try to prerender it during `next build`.
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  let categories = [];
  let failed = false;

  try {
    const data = await catalogService.getCategories();
    categories = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to load categories:', error);
    failed = true;
  }

  return (
    <StudentShell>
      <div className="pb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          Categories
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Pick an exam category to see its test series.
        </p>

        {failed ? (
          <p className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            We couldn&apos;t load categories right now. Please try again in a moment.
          </p>
        ) : categories.length === 0 ? (
          <p className="mt-10 text-slate-500 dark:text-slate-400">
            No categories yet.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = Icons[cat.icon] || Icons.Folder;

              return (
                <Link
                  key={cat.id}
                  href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
                  className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                      cat.bg || 'bg-slate-50 dark:bg-slate-800'
                    } ${cat.color || 'text-slate-600 dark:text-slate-400'}`}
                  >
                    <Icon size={24} />
                  </div>

                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h2>

                  {cat.testCount != null && (
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {cat.testCount}+ tests
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
}