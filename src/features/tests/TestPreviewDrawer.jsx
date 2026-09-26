'use client';

import React, { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { MathText } from '@/components/common/MathText';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { catalogApi } from '@/services/adminService';

function optionsList(optionsJson) {
  if (!optionsJson) return [];
  // PublicQuestionDto types optionsJson as a generic object; the backend may
  // serialize it either as an array of {id, text} or as an object map.
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

  const load = () => {
    if (notPublished) return;
    setLoading(true);
    setError(null);
    catalogApi
      .structure(testId)
      .then(setStructure)
      .catch((err) => setError(err?.message || 'Failed to load preview'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, testId, testStatus]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Preview as student"
      description="Rendered from the public catalog structure — correct answers are never included here."
      width="xl"
    >
      {notPublished && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This preview reads from the public catalog, which only serves <strong>published</strong> tests. This test is
          currently <strong>{testStatus?.toLowerCase()}</strong> — publish it first to preview it here, or use the
          section cards above to review questions and correct answers directly.
        </div>
      )}
      {!notPublished && loading && <TableSkeleton rows={4} cols={1} />}
      {!notPublished && !loading && error && <ErrorState message={error} onRetry={load} />}
      {!notPublished && !loading && !error && structure && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{structure.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {structure.durationMinutes} minutes · {structure.totalMarks} marks {structure.isFree && '· Free'}
            </p>
            {structure.instructions && (
              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                <MathText text={structure.instructions} className="text-sm text-slate-700" />
              </div>
            )}
          </div>

          {(structure.sections || []).map((section) => (
            <div key={section.sectionId}>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-slate-900">{section.title}</h4>
                <Badge tone="neutral">{(section.questions || []).length} questions</Badge>
              </div>
              <div className="space-y-4">
                {(section.questions || []).map((q, i) => {
                  const options = optionsList(q.optionsJson);
                  return (
                    <div key={q.questionId} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-semibold text-slate-400 shrink-0">Q{i + 1}.</span>
                        <MathText text={q.questionText} className="text-sm text-slate-900 font-medium" />
                      </div>
                      {options.length > 0 && (
                        <div className="ml-5 space-y-1.5 mt-2">
                          {options.map((opt, oi) => (
                            <div key={opt.id || oi} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="font-semibold text-slate-400 w-5 shrink-0">{String.fromCharCode(65 + oi)}</span>
                              <MathText text={opt.text} />
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="ml-5 mt-2 text-xs text-slate-400">
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
