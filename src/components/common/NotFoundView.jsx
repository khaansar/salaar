import Link from 'next/link';
import { ArrowRight, Compass, Home } from 'lucide-react';

export default function NotFoundView({ suggestions = [] }) {
  const items = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="mx-auto max-w-3xl py-12 text-center sm:py-20">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Compass size={30} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        Error 404
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        We couldn&apos;t find that page
      </h1>

      <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
        The link may be broken or the page may have moved.
        Head back home or pick something to practise below.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <Home size={16} />
          Back to home
        </Link>

        <Link
          href="/test-series"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Browse test series
          <ArrowRight size={16} />
        </Link>
      </div>

      {items.length > 0 && (
        <div className="mt-14 text-left">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Popular right now
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </p>

                  {item.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
