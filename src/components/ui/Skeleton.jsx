import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60 ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-6 px-6 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0"
        >
          {Array.from({ length: cols }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={`h-4 ${
                columnIndex === 0 ? 'w-1/3' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}