import Link from 'next/link';
import * as Icons from 'lucide-react';

import StudentShell from '../../components/student/StudentShell';
import { catalogService } from '../../services/catalogService';
import { siteConfig } from '../../config/site';
import HomeFaq from '../../features/home/HomeFaq';

export const metadata = {
  title: siteConfig.formatTitle('Exam Categories'),
  description:
    'Browse exam categories and discover mock tests and test series for your target exam.',
  alternates: {
    canonical: '/categories',
  },
};

// Needs the API at request time, so don't try to prerender it during `next build`.
export const dynamic = 'force-dynamic';

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';

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
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-white">Home</Link>
          <Icons.ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page" className="font-medium text-slate-700 dark:text-slate-200">Categories</span>
        </nav>

        {/* Header */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-white to-brand-50 px-6 py-8 sm:px-10 sm:py-10 dark:border-slate-800 dark:bg-slate-900 dark:bg-none">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-brand-100 dark:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 hidden h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl dark:block" />

          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Exam categories
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base sm:leading-7">
              Pick an exam category to see its test series and start practicing.
            </p>
          </div>
        </section>

        {failed ? (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            We couldn&apos;t load categories right now. Please try again in a moment.
          </p>
        ) : categories.length === 0 ? (
          <div className="mx-auto mt-10 flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
              <Icons.Folder size={24} aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold text-slate-900 dark:text-white">No categories yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check back soon for new exam categories.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = Icons[cat.icon] || Icons.Folder;

              return (
                <li key={cat.id} className="flex">
                  <Link
                    href={`/test-series?category=${encodeURIComponent(cat.slug ?? '')}`}
                    className={`group flex w-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-600 ${focusRing} dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-indigo-400">
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </span>

                    <h2 className="mt-3 truncate text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h2>
                    {cat.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {cat.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-1 pt-4">
                      {cat.testCount != null ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {cat.testCount}+ tests
                        </span>
                      ) : (
                        <span />
                      )}
                      <Icons.ArrowRight
                        size={15}
                        aria-hidden="true"
                        className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-slate-500 dark:group-hover:text-indigo-400"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {!failed && (
          <div className="mt-8">
            <HomeFaq title="FAQs" subtitle="Helpful answers for finding the right exam category and practice." />
          </div>
        )}
      </div>
    </StudentShell>
  );
}