import React from 'react';
import { TableSkeleton } from './Skeleton';
import { EmptyState, ErrorState } from './EmptyState';

/**
 * @param {object[]} columns - [{ key, header, render(row), className, headerClassName }]
 * @param {object[]} rows
 * @param {string} rowKey - field name to use as React key
 */
export function DataTable({
  columns,
  rows,
  rowKey = 'id',
  loading,
  error,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  emptyIcon,
  onRowClick,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {!loading && !error && rows.length > 0 && (
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 align-middle text-slate-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {loading && <TableSkeleton cols={columns.length} />}

      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      )}
    </div>
  );
}
