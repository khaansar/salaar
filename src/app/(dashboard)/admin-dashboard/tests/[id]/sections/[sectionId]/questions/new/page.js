'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { BulkQuestionsForm } from '@/features/tests/BulkQuestionsForm';
import { mockTestsApi } from '@/services/adminService';

export default function NewSectionQuestionsPage({ params }) {
  const { id, sectionId } = use(params);
  const [test, setTest] = useState(null);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Same sources as the test builder: sections come from the blueprint,
      // keyed by `sectionId`.
      const [testData, blueprintData] = await Promise.all([mockTestsApi.get(id), mockTestsApi.answerKey(id)]);
      const sectionData = (blueprintData?.sections || []).find((s) => String(s.sectionId) === String(sectionId));
      if (!sectionData) throw new Error('Section not found');
      setTest(testData);
      setSection(sectionData);
    } catch (err) {
      setError(err?.message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  }, [id, sectionId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: test?.title || '...', href: `/admin-dashboard/tests/${id}` },
          { label: section?.title || 'Section' },
          { label: 'Create questions' },
        ]}
        title="Create questions"
        subtitle={section ? `Write new questions for “${section.title}”. They are saved to your question bank and added to this section.` : undefined}
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && section && (
        <BulkQuestionsForm testId={id} sectionId={sectionId} sectionTitle={section.title} />
      )}
    </div>
  );
}
