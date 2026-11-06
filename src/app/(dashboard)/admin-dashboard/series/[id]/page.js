'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, FileText, ArrowRight, Activity, IndianRupee, Clock, ListChecks } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/admin/StatCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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

  const breadcrumbs = [
    { label: 'Admin', href: '/admin-dashboard' },
    { label: 'Test Series', href: '/admin-dashboard/series' },
    { label: series?.title || 'Series' },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)}
        </div>
        <Card><TableSkeleton rows={4} cols={3} /></Card>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader breadcrumbs={breadcrumbs} title="Test series" />
        <Card>
          <ErrorState message={error || 'Test series not found'} onRetry={load} />
        </Card>
      </div>
    );
  }

  const mockTests = series.mockTests || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={series.title}
        subtitle={series.categoryName}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(`/admin-dashboard/series/${id}/edit`)}>
              <Pencil size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="dangerOutline" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Status"
          value={<Badge className={`align-middle ${STATUS_BADGE_STYLES[series.status] || ''}`}>{series.status}</Badge>}
          icon={Activity}
          tone="slate"
          hint="Publishing state of the series"
        />
        <StatCard
          label="Base price"
          value={series.basePrice ? `₹${series.basePrice}` : 'Free'}
          icon={IndianRupee}
          tone="emerald"
          hint="Price students pay for the series"
        />
        <StatCard
          label="Mock tests"
          value={mockTests.length}
          icon={FileText}
          tone="indigo"
          hint="Tests in this series"
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Mock tests</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Build out sections and questions for each test.</p>
          </div>
          <Button onClick={() => router.push(`/admin-dashboard/series/${id}/tests/new`)}>
            <Plus size={16} className="mr-2" />
            New mock test
          </Button>
        </div>

        {mockTests.length === 0 ? (
          <EmptyState
            icon={<FileText size={22} />}
            title="No mock tests yet"
            description="Create your first mock test to start building sections and questions."
            actionLabel="New mock test"
            onAction={() => router.push(`/admin-dashboard/series/${id}/tests/new`)}
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockTests.map((test, index) => (
              <li key={test.testId}>
                <button
                  type="button"
                  onClick={() => router.push(`/admin-dashboard/tests/${test.testId}`)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{test.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {test.durationMinutes} min</span>
                      <span className="inline-flex items-center gap-1"><ListChecks size={12} /> {test.totalMarks ?? 0} marks</span>
                      {test.isFree && <Badge tone="success">Free</Badge>}
                    </div>
                  </div>
                  <Badge className={STATUS_BADGE_STYLES[test.status]}>{test.status}</Badge>
                  <ArrowRight size={16} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

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
