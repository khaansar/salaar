'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Pencil, Trash2, Lock, HelpCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QuestionPreviewDrawer } from '@/features/questions/QuestionPreviewDrawer';
import { questionsApi } from '@/services/adminService';
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/common/ToastProvider';
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS, QUESTION_TYPE_BADGE_STYLES, DIFFICULTY_BADGE_STYLES } from '@/constants/enums';

const PAGE_SIZE = 15;

export default function QuestionsPage() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState('');
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

  const { items, meta, loading, error, refetch } = usePaginatedFetch(questionsApi.list, params);

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
      await questionsApi.remove(deleteTarget.id);
      toast.success('Question deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'Question Bank' }]} title="Question Bank" subtitle="Author and manage reusable questions across all your tests." actions={<Button onClick={() => router.push('/admin-dashboard/questions/new')}><Plus size={16} className="mr-2" />New question</Button>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex-1 min-w-[220px]">
            <Input placeholder="Search questions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search size={16} />} />
          </div>
          <div className="w-48">
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} placeholder="All types">
              {QUESTION_TYPE_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Select>
          </div>
          <div className="w-40">
            <Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} placeholder="All difficulty">
              {DIFFICULTY_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </Select>
          </div>
          <div className="w-40">
            <Select value={lockStatus} onChange={(e) => { setLockStatus(e.target.value); setPage(1); }} placeholder="Locked & unlocked">
              <option value="locked">Locked only</option>
              <option value="unlocked">Unlocked only</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
            <input type="checkbox" checked={unusedOnly} onChange={(e) => { setUnusedOnly(e.target.checked); setPage(1); }} className="rounded text-indigo-600 focus:ring-indigo-500" /> Unused only
          </label>
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
            { key: 'shortText', header: 'Question', className: 'max-w-md', render: (row) => (<div className="flex items-center gap-2">{row.isLocked && <Lock size={13} className="text-amber-500 shrink-0" />}<p className="truncate font-medium text-slate-900">{row.shortText}</p></div>) },
            { key: 'questionType', header: 'Type', render: (row) => <Badge className={QUESTION_TYPE_BADGE_STYLES[row.questionType]}>{row.questionType}</Badge> },
            { key: 'difficulty', header: 'Difficulty', render: (row) => <Badge className={DIFFICULTY_BADGE_STYLES[row.difficulty]}>{row.difficulty}</Badge> },
            { key: 'positiveMarks', header: 'Marks', render: (row) => row.positiveMarks },
            { key: 'createdAt', header: 'Created', render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '') },
            {
              key: 'actions',
              header: '',
              headerClassName: 'text-right',
              className: 'text-right',
              render: (row) => (
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => setPreviewId(row.id)} className="text-slate-400 hover:text-indigo-600" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => router.push(`/admin-dashboard/questions/${row.id}`)} className="text-slate-400 hover:text-indigo-600" title="Edit"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteTarget(row)} className="text-slate-400 hover:text-rose-600" title="Delete"><Trash2 size={16} /></button>
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