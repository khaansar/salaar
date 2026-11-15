import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Builds the `meta` shape this component expects from a zero-based page
 * response (`page`, `totalPages`, `totalElements`, `pageSize`).
 */
export function zeroBasedMeta({ page, totalPages, totalElements, pageSize }) {
  const pages = Math.max(Number(totalPages) || 0, 0);

  return {
    pagination: {
      current_page: page + 1,
      total_pages: pages,
      total_records: Number(totalElements) || 0,
      per_page: pageSize,
      has_previous: page > 0,
      has_next: page + 1 < pages,
    },
  };
}

const NAV_BUTTON =
  'inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-indigo-300';

export function Pagination({ meta, onPageChange, disabled = false }) {
  const pagination = meta?.pagination;
  if (!pagination) return null;

  const { current_page, total_pages, total_records, per_page } = pagination;
  if (!total_records) return null;

  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total_records);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{start}</span>–
        <span className="font-semibold text-slate-700 dark:text-slate-200">{end}</span> of{' '}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{Number(total_records).toLocaleString()}</span>
      </p>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={!pagination.has_previous || disabled}
          className={NAV_BUTTON}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="px-2 text-xs text-slate-500 dark:text-slate-400">
          Page <span className="font-semibold text-slate-700 dark:text-slate-200">{current_page}</span> of {total_pages || 1}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={!pagination.has_next || disabled}
          className={NAV_BUTTON}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
