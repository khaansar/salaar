'use client';
import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SeriesForm } from '@/features/test-series/SeriesForm';
import { categoriesApi } from '@/services/adminService';

export default function NewSeriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Test Series', href: '/admin-dashboard/series' },
          { label: 'Create Series' },
        ]}
        title="Create Test Series"
        subtitle="Set up a new series to group mock tests together."
      />
      <SeriesForm categories={categories} />
    </div>
  );
}