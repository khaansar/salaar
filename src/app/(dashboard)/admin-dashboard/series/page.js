'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Library, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconAction } from '@/components/admin/AdminUi';
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

  const hasFilters = Boolean(search || status || categoryId);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Test Series' }]} title="Test Series" subtitle="Manage the series that group your mock tests together." actions={<Button onClick={() => router.push('/admin-dashboard/series/new')}><Plus size={16} className="mr-2" />New series</Button>} />
      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <Input placeholder="Search series..." aria-label="Search series" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
            <div className="lg:w-44">
              <Select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} placeholder="All statuses">
                {TEST_STATUS_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </Select>
            </div>
            <div className="lg:w-56">
              <Select aria-label="Filter by category" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} placeholder="All categories">
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </Select>
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="self-start lg:self-center" onClick={() => { setSearch(''); setStatus(''); setCategoryId(''); setPage(1); }}>
              <X size={14} className="mr-1.5" /> Clear
            </Button>
          )}
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
            {
              key: 'title',
              header: 'Series',
              render: (row) => (
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{row.title}</p>
                  {row.categoryName && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{row.categoryName}</p>}
                </div>
              ),
            },
            { key: 'status', header: 'Status', render: (row) => (<Badge className={STATUS_BADGE_STYLES[row.status]}>{row.status}</Badge>) },
            {
              key: 'basePrice',
              header: 'Base price',
              render: (row) => (row.basePrice
                ? <span className="font-medium text-slate-900 dark:text-white">₹{row.basePrice}</span>
                : <Badge tone="success">Free</Badge>),
            },
            { key: 'updatedAt', header: 'Updated', className: 'whitespace-nowrap text-xs text-slate-500 dark:text-slate-400', render: (row) => (row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '') },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <IconAction label={`Edit ${row.title}`} onClick={() => router.push(`/admin-dashboard/series/${row.id}/edit`)}><Pencil size={15} /></IconAction>
                  <IconAction label={`Delete ${row.title}`} tone="danger" onClick={() => setDeleteTarget(row)}><Trash2 size={15} /></IconAction>
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
