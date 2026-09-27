'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { MockTestForm } from '@/features/test-series/MockTestForm';
import { seriesApi } from '@/services/adminService';

export default function NewMockTestPage({ params }) {
  // Next.js 16: route params are async.
  const { id } = use(params);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    seriesApi
      .get(id)
      .then(setSeries)
      .catch((err) => setError(err?.message || 'Failed to load test series'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Test Series', href: '/admin-dashboard/series' },
          { label: series?.title || '...', href: `/admin-dashboard/series/${id}` },
          { label: 'Create Mock Test' },
        ]}
        title="Create Mock Test"
        subtitle="Set up a new mock test with sections and questions."
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && series && (
        <MockTestForm seriesId={id} seriesTitle={series.title} categoryName={series.categoryName} />
      )}
    </div>
  );
}