'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, FolderTree, Languages } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { CategoryFormModal } from '@/features/categories/CategoryFormModal';
import { categoriesApi } from '@/services/adminService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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

  const openCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Categories' }]}
        title="Categories"
        subtitle="Group test series by exam, subject, or program."
        actions={
          <Button onClick={openCreate}>
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
          onEmptyAction={openCreate}
          columns={[
            {
              key: 'name',
              header: 'Category',
              render: (row) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  {row.description && <p className="text-xs text-slate-500 mt-0.5 max-w-md truncate">{row.description}</p>}
                </div>
              ),
            },
            { key: 'id', header: 'ID', render: (row) => <code className="text-xs text-slate-500">{row.id}</code> },
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
                    openEdit(row);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <Pencil size={14} /> Edit
                </button>
              ),
            },
          ]}
        />
      </Card>

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSaved={load}
      />
    </div>
  );
}
