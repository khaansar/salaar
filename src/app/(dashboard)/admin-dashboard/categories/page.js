'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, FolderTree, Languages } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { categoriesApi } from '@/services/adminService';
import { colorForKey } from '@/lib/colorHash';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto">
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
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-semibold text-sm ${color.bg} ${color.text}`}
                    >
                      {row.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{row.name}</p>
                      {row.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md truncate">{row.description}</p>
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
                  {(row.requiredLanguages || []).length === 0 && <span className="text-xs text-slate-400">—</span>}
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
              header: '',
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin-dashboard/categories/${row.id}/edit`);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Pencil size={14} /> Edit
                </button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}