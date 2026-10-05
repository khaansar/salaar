'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

function formatDuration(minutes) {
  if (!minutes) return '-';
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} hr${h === 1 ? '' : 's'}`;
  }
  return `${minutes} min`;
}

export default function SeriesTestsTable({ tests = [] }) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? tests : tests.slice(0, 5);

  if (tests.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="font-semibold text-slate-900 dark:text-white">No published tests yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          This series exists, but there are no published mock tests available right now.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
              <th className="py-2.5 pr-3 font-medium">#</th>
              <th className="py-2.5 pr-3 font-medium">Test Name</th>
              <th className="py-2.5 pr-3 font-medium">Marks</th>
              <th className="py-2.5 pr-3 font-medium">Duration</th>
              <th className="py-2.5 pr-3 font-medium">Access</th>
              <th className="py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.testId} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="py-3 pr-3 text-slate-500">{i + 1}</td>
                <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">{t.title}</td>
                <td className="py-3 pr-3 text-slate-600">{t.totalMarks ?? 0}</td>
                <td className="py-3 pr-3 text-slate-600">{formatDuration(t.durationMinutes)}</td>
                <td className="py-3 pr-3">
                  <span className={`rounded px-2 py-1 text-[10px] font-semibold ${t.isFree ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t.isFree ? 'Free' : 'Included'}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Link href={`/tests/${t.slug}`} className="inline-block rounded-md border border-brand-600 px-3 py-1.5 text-[11px] font-semibold text-brand-600 hover:bg-brand-50">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tests.length > 5 && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setShowAll((v) => !v)} className="inline-flex items-center gap-1.5 rounded-md border border-brand-600 px-4 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50">
            {showAll ? 'Show Fewer' : `View All ${tests.length} Tests`}
            <ChevronDown size={13} className={showAll ? 'rotate-180' : ''} />
          </button>
        </div>
      )}
    </>
  );
}