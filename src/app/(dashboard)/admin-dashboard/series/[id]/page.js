'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SeriesFormModal } from '@/features/test-series/SeriesFormModal';
import { CreateMockTestModal } from '@/features/test-series/CreateMockTestModal';
import { categoriesApi, seriesApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { STATUS_BADGE_STYLES } from '@/constants/enums';

export default function SeriesDetailPage({ params }) {
  // Next.js 16: route params are async.
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [series, setSeries] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await seriesApi.get(id);
      setSeries(data);
    } catch (err) {
      setError(err?.message || 'Failed to load test series');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    categoriesApi.list().then(setCategories).catch(() => {});
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await seriesApi.remove(id);
      toast.success('Test series deleted');
      router.push('/admin-dashboard/series');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete test series');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <TableSkeleton rows={3} cols={1} />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="max-w-5xl mx-auto">
        <ErrorState message={error || 'Test series not found'} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin-dashboard' },
          { label: 'Test Series', href: '/admin-dashboard/series' },
          { label: series.title },
        ]}
        title={series.title}
        subtitle={series.categoryName}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
            <Button
              variant="dangerOutline"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <Badge className={`mt-2 ${STATUS_BADGE_STYLES[series.status]}`}>{series.status}</Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Base price</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {series.basePrice ? `₹${series.basePrice}` : 'Free'}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mock tests</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{series.mockTests?.length || 0}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Mock tests</h2>
            <p className="text-sm text-slate-500 mt-0.5">Build out sections and questions for each test.</p>
          </div>
          <Button onClick={() => setCreateTestOpen(true)}>
            <Plus size={16} className="mr-2" />
            New mock test
          </Button>
        </CardHeader>
        {(series.mockTests || []).length === 0 ? (
          <EmptyState
            icon={<FileText size={22} />}
            title="No mock tests yet"
            description="Create your first mock test to start building sections and questions."
            actionLabel="New mock test"
            onAction={() => setCreateTestOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {series.mockTests.map((test) => (
              <button
                key={test.testId}
                onClick={() => router.push(`/admin-dashboard/tests/${test.testId}`)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{test.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {test.durationMinutes} min · {test.totalMarks ?? 0} marks {test.isFree && '· Free'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_BADGE_STYLES[test.status]}>{test.status}</Badge>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <SeriesFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        series={series}
        categories={categories}
        onSaved={load}
      />

      <CreateMockTestModal
        open={createTestOpen}
        onClose={() => setCreateTestOpen(false)}
        seriesId={id}
        onCreated={(created) => router.push(`/admin-dashboard/tests/${created.id}`)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete test series?"
        description={`This will permanently delete "${series.title}" and all of its mock tests. This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
