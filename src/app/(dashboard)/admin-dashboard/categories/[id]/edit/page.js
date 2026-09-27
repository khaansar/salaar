'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/EmptyState';
import { CategoryForm } from '@/features/categories/CategoryForm';
import { categoriesApi } from '@/services/adminService';

export default function EditCategoryPage({ params }) {
  // Next.js 16: route params are async.
  const { id } = use(params);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // There is no `GET /admin/categories/{id}` in the API, so we load the
  // full list and find the matching entry — consistent with how the
  // categories list page already works.
  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    categoriesApi
      .list()
      .then((list) => {
        const found = (list || []).find((c) => c.id === id);
        if (!found) throw new Error('Category not found');
        setCategory(found);
      })
      .catch((err) => setError(err?.message || 'Failed to load category'))
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
          { label: 'Exam Categories', href: '/admin-dashboard/categories' },
          { label: 'Edit Category' },
        ]}
        title="Edit Exam Category"
        subtitle={category?.name}
      />
      {loading && <TableSkeleton rows={4} cols={1} />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && category && <CategoryForm category={category} />}
    </div>
  );
}