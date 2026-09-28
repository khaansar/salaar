'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { SeriesForm } from '@/features/test-series/SeriesForm';
import { categoriesApi, seriesApi } from '@/services/adminService';

export default function EditSeriesPage({ params }) {
  const { id } = use(params);
  const [series, setSeries] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [seriesData, categoriesData] = await Promise.all([seriesApi.get(id), categoriesApi.list()]);
      setSeries(seriesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err?.message || 'Failed to load test series');
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
          { label: 'Test Series', href: '/admin-dashboard/series' },
          { label: series?.title || '...', href: `/admin-dashboard/series/${id}` },
          { label: 'Edit' },
        ]}
        title="Edit Test Series"
        subtitle={series?.title}
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && series && <SeriesForm series={series} categories={categories} />}
    </div>
  );
}