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
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-300 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}