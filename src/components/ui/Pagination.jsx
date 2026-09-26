import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ meta, onPageChange }) {
  const pagination = meta?.pagination;
  if (!pagination) return null;

  const { current_page, total_pages, total_records, per_page } = pagination;
  if (!total_records) return null;

  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total_records);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span>–
        <span className="font-medium text-slate-700">{end}</span> of{' '}
        <span className="font-medium text-slate-700">{total_records}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={!pagination.has_previous}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-slate-600 px-2">
          Page {current_page} of {total_pages || 1}
        </span>
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={!pagination.has_next}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
