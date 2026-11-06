'use client';
import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { InlineAlert } from '@/components/admin/AdminUi';
import { Badge } from '@/components/ui/Badge';
import { MathText } from '@/components/common/MathText';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { catalogApi } from '@/services/adminService';

function optionsList(optionsJson) {
  if (!optionsJson) return [];
  if (Array.isArray(optionsJson)) return optionsJson;
  if (typeof optionsJson === 'object') {
    return Object.entries(optionsJson).map(([id, text]) => ({ id, text: typeof text === 'string' ? text : JSON.stringify(text) }));
  }
  return [];
}

export function TestPreviewDrawer({ open, onClose, testId, testStatus }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notPublished = testStatus && testStatus !== 'PUBLISHED';

  useEffect(() => {
    if (!open || notPublished) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    catalogApi
      .structure(testId)
      .then((data) => {
        if (!cancelled) setStructure(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load preview');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, testId, notPublished]);

  return (
    <Drawer open={open} onClose={onClose} title="Preview as student" description="Rendered from the public catalog structure   correct answers are never included here." width="xl">
      {notPublished && (
        <InlineAlert tone="warning" title="Preview unavailable">
          This preview reads from the public catalog, which only serves <strong>published</strong> tests. This test is currently <strong>{testStatus?.toLowerCase()}</strong>.
        </InlineAlert>
      )}
      {!notPublished && loading && <TableSkeleton rows={4} cols={1} />}
      {!notPublished && !loading && error && <ErrorState message={error} onRetry={() => { /* Triggered by reopening drawer or external reload */ }} />}
      {!notPublished && !loading && !error && structure && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{structure.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {structure.durationMinutes} minutes   {structure.totalMarks} marks {structure.isFree && '  Free'}
            </p>
            {structure.instructions && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                <MathText text={structure.instructions} className="text-sm text-slate-700 dark:text-slate-300" />
              </div>
            )}
          </div>
          {(structure.sections || []).map((section) => (
            <div key={section.sectionId}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-slate-900 dark:text-white">{section.title}</h4>
                <Badge tone="neutral">{(section.questions || []).length} questions</Badge>
              </div>
              <div className="space-y-4">
                {(section.questions || []).map((q, i) => {
                  const options = optionsList(q.optionsJson);
                  return (
                    <div key={q.questionId} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">Q{i + 1}.</span>
                        <MathText text={q.questionText} className="text-sm font-medium text-slate-900 dark:text-white" />
                      </div>
                      {options.length > 0 && (
                        <div className="ml-5 space-y-1.5 mt-2">
                          {options.map((opt, oi) => (
                            <div key={opt.id || oi} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <span className="w-5 shrink-0 font-semibold text-slate-400 dark:text-slate-500">{String.fromCharCode(65 + oi)}</span>
                              <MathText text={opt.text} />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="ml-5 mt-2 text-xs text-slate-400 dark:text-slate-500">
                        +{q.positiveMarks} {q.negativeMarks ? `/ -${q.negativeMarks}` : ''} marks
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}