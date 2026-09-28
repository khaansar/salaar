'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { SectionForm } from '@/features/tests/SectionForm';
import { mockTestsApi } from '@/services/adminService';

export default function NewSectionPage({ params }) {
  // Next.js 16: route params are async.
  const { id } = use(params);
  const [test, setTest] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [testData, blueprintData] = await Promise.all([mockTestsApi.get(id), mockTestsApi.answerKey(id)]);
      setTest(testData);
      setBlueprint(blueprintData);
    } catch (err) {
      setError(err?.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: test?.title || '...', href: `/admin-dashboard/tests/${id}` },
          { label: 'Create Section' },
        ]}
        title="Create Section"
        subtitle="Add a new section to organize questions within this mock test."
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && test && (
        <SectionForm testId={id} testTitle={test.title} existingSections={blueprint?.sections || []} />
      )}
    </div>
  );
}