'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Library, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useGetSeriesListQuery, useDeleteSeriesMutation, useGetCategoriesListQuery } from '@/store/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { TEST_STATUS_OPTIONS, STATUS_BADGE_STYLES } from '@/constants/enums';

const PAGE_SIZE = 10;

export default function SeriesListPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: catData } = useGetCategoriesListQuery({ limit: 100 });
  const categories = Array.isArray(catData) ? catData : [];
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search);



  const params = useMemo(
    () => ({ search: debouncedSearch, status, categoryId, page, limit: PAGE_SIZE }),
    [debouncedSearch, status, categoryId, page]
  );

  const { data, isLoading: loading, error, refetch } = useGetSeriesListQuery(params);
  const items = Array.isArray(data) ? data : [];
  const meta = null;
  const [deleteSeries] = useDeleteSeriesMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSeries(deleteTarget.id).unwrap();
      toast.success('Test series deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete test series');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Test Series' }]} title="Test Series" subtitle="Manage the series that group your mock tests together." actions={<Button onClick={() => router.push('/admin-dashboard/series/new')}><Plus size={16} className="mr-2" />New series</Button>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex-1 min-w-[220px]">
            <Input placeholder="Search series..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
          </div>
          <div className="w-44">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} placeholder="All statuses">
              {TEST_STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Select>
          </div>
          <div className="w-56">
            <Select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} placeholder="All categories">
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </Select>
          </div>
        </div>
        <DataTable
          rowKey="id"
          rows={items}
          loading={loading}
          error={error}
          onRetry={refetch}
          onRowClick={(row) => router.push(`/admin-dashboard/series/${row.id}`)}
          emptyIcon={<Library size={22} />}
          emptyTitle="No test series found"
          emptyDescription="Try adjusting your filters, or create a new series."
          emptyActionLabel="New series"
          onEmptyAction={() => router.push('/admin-dashboard/series/new')}
          columns={[
            { key: 'title', header: 'Series', render: (row) => (<div><p className="font-medium text-slate-900">{row.title}</p><p className="text-xs text-slate-500 mt-0.5">{row.categoryName}</p></div>) },
            { key: 'status', header: 'Status', render: (row) => (<Badge className={STATUS_BADGE_STYLES[row.status]}>{row.status}</Badge>) },
            { key: 'basePrice', header: 'Base price', render: (row) => (row.basePrice ? ` ${row.basePrice}` : 'Free') },
            { key: 'updatedAt', header: 'Updated', render: (row) => (row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '') },
            {
              key: 'actions',
              header: '',
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => router.push(`/admin-dashboard/series/${row.id}/edit`)} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"><Pencil size={14} /> Edit</button>
                  <button onClick={() => setDeleteTarget(row)} className="inline-flex items-center gap-1 text-sm font-medium text-rose-500 hover:text-rose-700"><Trash2 size={14} /></button>
                </div>
              ),
            },
          ]}
        />
        {!loading && !error && items.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
      </Card>
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} title="Delete test series?" description={`This will permanently delete "${deleteTarget?.title}" and cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
