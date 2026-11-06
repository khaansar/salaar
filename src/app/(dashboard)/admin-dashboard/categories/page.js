'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, FolderTree, Languages } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { IconAction } from '@/components/admin/AdminUi';
import { useGetCategoriesListQuery } from '@/store/adminApi';
import { colorForKey } from '@/lib/colorHash';

export default function CategoriesPage() {
  const router = useRouter();
  const { data, isLoading: loading, error, refetch: load } = useGetCategoriesListQuery();
  const categories = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Categories' }]}
        title="Categories"
        subtitle="Group test series by exam, subject, or program."
        actions={
          <Button onClick={() => router.push('/admin-dashboard/categories/new')}>
            <Plus size={16} className="mr-2" />
            New category
          </Button>
        }
      />

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">All categories</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {loading ? 'Loading…' : `${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`}
            </p>
          </div>
        </div>
        <DataTable
          rowKey="id"
          rows={categories}
          loading={loading}
          error={error}
          onRetry={load}
          emptyIcon={<FolderTree size={22} />}
          emptyTitle="No categories yet"
          emptyDescription="Create your first category to start organizing test series."
          emptyActionLabel="New category"
          onEmptyAction={() => router.push('/admin-dashboard/categories/new')}
          columns={[
            {
              key: 'name',
              header: 'Category',
              render: (row) => {
                const color = colorForKey(row.id);
                return (
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${color.bg} ${color.text}`}
                    >
                      {row.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{row.name}</p>
                      {row.description && (
                        <p className="mt-0.5 max-w-md truncate text-xs text-slate-500 dark:text-slate-400">{row.description}</p>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              key: 'requiredLanguages',
              header: 'Languages',
              render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                  {(row.requiredLanguages || []).length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                  )}
                  {(row.requiredLanguages || []).map((l) => (
                    <Badge key={l} tone="info" className="uppercase">
                      <Languages size={11} /> {l}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <div className="flex items-center justify-end">
                  <IconAction
                    label={`Edit ${row.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin-dashboard/categories/${row.id}/edit`);
                    }}
                  >
                    <Pencil size={15} />
                  </IconAction>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
