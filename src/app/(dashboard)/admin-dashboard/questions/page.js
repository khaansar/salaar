'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Eye, Pencil, Trash2, Lock, HelpCircle, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Checkbox } from '@/components/ui/Checkbox';
import { IconAction } from '@/components/admin/AdminUi';
import { QuestionPreviewDrawer } from '@/features/questions/QuestionPreviewDrawer';
import { useGetQuestionsListQuery, useDeleteQuestionMutation } from '@/store/adminApi';
import { questionsApi } from '@/services/adminService';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS, QUESTION_TYPE_BADGE_STYLES, DIFFICULTY_BADGE_STYLES } from '@/constants/enums';

const PAGE_SIZE = 15;

function QuestionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  // Supports deep-links from the topbar search box, e.g. /admin-dashboard/questions?search=...
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [lockStatus, setLockStatus] = useState('');
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [previewId, setPreviewId] = useState(null);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({
      search: debouncedSearch,
      type,
      difficulty,
      isLocked: lockStatus === 'locked' ? true : lockStatus === 'unlocked' ? false : undefined,
      unused: unusedOnly ? true : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, type, difficulty, lockStatus, unusedOnly, page]
  );

  const { data, isLoading: loading, error, refetch } = useGetQuestionsListQuery(params);
  const items = Array.isArray(data) ? data : [];
  const meta = null;
  const [deleteQuestion] = useDeleteQuestionMutation();

  useEffect(() => {
    if (!previewId) {
      setPreviewQuestion(null);
      return;
    }
    let cancelled = false;
    questionsApi
      .get(previewId)
      .then((q) => {
        if (!cancelled) setPreviewQuestion(q);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err?.message || 'Failed to load question');
      });
    return () => {
      cancelled = true;
    };
  }, [previewId, toast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuestion(deleteTarget.id).unwrap();
      toast.success('Question deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || type || difficulty || lockStatus || unusedOnly);

  const clearFilters = () => {
    setSearch('');
    setType('');
    setDifficulty('');
    setLockStatus('');
    setUnusedOnly(false);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Question Bank' }]} title="Question Bank" subtitle="Author and manage reusable questions across all your tests." actions={<Button onClick={() => router.push('/admin-dashboard/questions/new')}><Plus size={16} className="mr-2" />New question</Button>} />
      <Card>
        <div className="space-y-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <Input placeholder="Search questions..." aria-label="Search questions" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
              <div className="lg:w-44">
                <Select aria-label="Filter by type" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} placeholder="All types">
                  {QUESTION_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </Select>
              </div>
              <div className="lg:w-40">
                <Select aria-label="Filter by difficulty" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} placeholder="All difficulty">
                  {DIFFICULTY_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </Select>
              </div>
              <div className="lg:w-44">
                <Select aria-label="Filter by lock status" value={lockStatus} onChange={(e) => { setLockStatus(e.target.value); setPage(1); }} placeholder="Locked & unlocked">
                  <option value="locked">Locked only</option>
                  <option value="unlocked">Unlocked only</option>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Checkbox id="questions-unused-only" label="Show unused questions only" checked={unusedOnly} onChange={(e) => { setUnusedOnly(e.target.checked); setPage(1); }} />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={14} className="mr-1.5" /> Clear filters
              </Button>
            )}
          </div>
        </div>
        <DataTable
          rowKey="id"
          rows={items}
          loading={loading}
          error={error}
          onRetry={refetch}
          emptyIcon={<HelpCircle size={22} />}
          emptyTitle="No questions found"
          emptyDescription="Try adjusting your filters, or create a new question."
          emptyActionLabel="New question"
          onEmptyAction={() => router.push('/admin-dashboard/questions/new')}
          columns={[
            {
              key: 'shortText',
              header: 'Question',
              className: 'max-w-md',
              render: (row) => (
                <div className="flex min-w-0 items-center gap-2">
                  {row.isLocked && (
                    <span title="Locked" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                      <Lock size={12} />
                    </span>
                  )}
                  <p className="truncate font-medium text-slate-900 dark:text-white" title={row.shortText}>{row.shortText}</p>
                </div>
              ),
            },
            { key: 'questionType', header: 'Type', render: (row) => <Badge className={QUESTION_TYPE_BADGE_STYLES[row.questionType]}>{String(row.questionType || '').replaceAll('_', ' ')}</Badge> },
            { key: 'difficulty', header: 'Difficulty', render: (row) => <Badge className={DIFFICULTY_BADGE_STYLES[row.difficulty]}>{row.difficulty}</Badge> },
            { key: 'positiveMarks', header: 'Marks', className: 'tabular-nums', render: (row) => row.positiveMarks },
            { key: 'createdAt', header: 'Created', className: 'whitespace-nowrap text-xs text-slate-500 dark:text-slate-400', render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '') },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <div className="flex items-center justify-end gap-1">
                  <IconAction label="Preview" onClick={() => setPreviewId(row.id)}><Eye size={15} /></IconAction>
                  <IconAction label="Edit" onClick={() => router.push(`/admin-dashboard/questions/${row.id}`)}><Pencil size={15} /></IconAction>
                  <IconAction label="Delete" tone="danger" onClick={() => setDeleteTarget(row)}><Trash2 size={15} /></IconAction>
                </div>
              ),
            },
          ]}
        />
        {!loading && !error && items.length > 0 && <Pagination meta={meta} onPageChange={setPage} />}
      </Card>
      <QuestionPreviewDrawer open={Boolean(previewId)} onClose={() => setPreviewId(null)} question={previewQuestion} />
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} title="Delete question?" description={`This will permanently delete "${deleteTarget?.shortText}". Questions already attached to tests may be affected.`} confirmLabel="Delete" />
    </div>
  );
}

// Remount when ?search= changes so a new search from the top bar is applied
// even while this page is already open.
function QuestionsPageKeyed() {
  const searchParams = useSearchParams();
  return <QuestionsPageInner key={searchParams.get('search') || ''} />;
}

export default function QuestionsPage() {
  // useSearchParams requires a Suspense boundary during static prerendering.
  return (
    <Suspense fallback={null}>
      <QuestionsPageKeyed />
    </Suspense>
  );
}
