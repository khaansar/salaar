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
      const testData = await mockTestsApi.get(id);
      const sectionData = (testData.sections || []).find((s) => s.id === sectionId);
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
    <div className="max-w-5xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: test?.title || '...', href: `/admin-dashboard/tests/${id}` },
          { label: 'Create Questions' },
        ]}
        title="Create Questions"
        subtitle={section ? `Add new questions to ${section.title}` : undefined}
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && section && (
        <BulkQuestionsForm testId={id} sectionId={sectionId} sectionTitle={section.title} />
      )}
    </div>
  );
}