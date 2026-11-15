import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const TONE_ICON_CLASSES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

/**
 * KPI tile used across admin pages. Renders as a link when `href` is set.
 */
export function StatCard({ label, value, hint, icon: Icon, tone = 'indigo', loading = false, href }) {
  const body = (
    <div
      className={`group relative h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-5 ${
        href ? 'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-500/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-16" />
          ) : (
            <p className="mt-1.5 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value ?? '—'}
            </p>
          )}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONE_ICON_CLASSES[tone] || TONE_ICON_CLASSES.indigo}`}>
            <Icon size={19} />
          </span>
        )}
      </div>
      {(hint || href) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {hint ? <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{hint}</p> : <span />}
          {href && (
            <ArrowUpRight
              size={14}
              className="shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500 dark:text-slate-600"
            />
          )}
        </div>
      )}
    </div>
  );

  if (!href) return body;

  return (
    <Link href={href} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      {body}
    </Link>
  );
}
