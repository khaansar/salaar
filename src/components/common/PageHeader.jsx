import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * @param {{label: string, href?: string}[]} breadcrumbs
 */
export function PageHeader({ breadcrumbs, title, subtitle, actions }) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" />}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="max-w-[16rem] truncate font-medium text-slate-700 dark:text-slate-300">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
