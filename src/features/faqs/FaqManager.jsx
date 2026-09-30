'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircleQuestion, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetCategoriesListQuery } from '@/store/adminApi';
import { seriesApi } from '@/services/adminService';
import { faqApi } from '@/services/faqService';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/common/ToastProvider';

const ALL = '__all__';
const GENERAL = '__general__';
const CATEGORY_FAQS = '__category_faqs__';
const PAGE_SIZE = 100;
const EMPTY_LIST = [];
const getMessage = (error, fallback) => error?.message || fallback;

export function FaqManager({ adminOnly = false }) {
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
  const canManage = adminOnly && isAdmin;
  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesListQuery({ limit: PAGE_SIZE }, { skip: !isAdmin });
  const categories = useMemo(() => Array.isArray(categoryData) ? categoryData : EMPTY_LIST, [categoryData]);

  const [allFaqs, setAllFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [allTests, setAllTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [testFilter, setTestFilter] = useState(ALL);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const reloadFaqs = useCallback(async () => {
    setLoadingFaqs(true);
    setFaqError('');
    try {
      const items = await faqApi.listAll();
      setAllFaqs(Array.isArray(items) ? items : []);
    } catch (error) {
      setFaqError(getMessage(error, 'Unable to load FAQs.'));
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  useEffect(() => { reloadFaqs(); }, [reloadFaqs]);

  useEffect(() => {
    let active = true;
    const loadTests = async () => {
      setTestsLoading(true);
      setTestsError('');
      try {
        const firstPage = await seriesApi.list({ page: 1, limit: PAGE_SIZE });
        const pageCount = Math.max(1, Number(firstPage.meta?.pagination?.total_pages || 1));
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) => seriesApi.list({ page: index + 2, limit: PAGE_SIZE }))
        );
        const series = [firstPage.data, ...remainingPages.map((page) => page.data)].flat();
        const details = await Promise.all(series.map((item) => seriesApi.get(item.id)));
        const tests = details.flatMap((item) => (item.mockTests || []).map((test) => ({
          id: String(test.testId || test.id),
          title: test.title || 'Untitled mock test',
          categoryId: String(item.categoryId || ''),
          categoryName: item.categoryName || '',
        })));
        if (active) setAllTests(tests);
      } catch (error) {
        if (active) setTestsError(getMessage(error, 'Unable to load mock tests.'));
      } finally {
        if (active) setTestsLoading(false);
      }
    };
    loadTests();
    return () => { active = false; };
  }, []);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category])),
    [categories]
  );
  const testById = useMemo(
    () => new Map(allTests.map((test) => [test.id, test])),
    [allTests]
  );
  const targetDetails = (faq) => {
    if (!faq.targetId) return { categoryName: 'General', testName: '—', categoryId: GENERAL, testId: '' };
    const id = String(faq.targetId);
    const test = testById.get(id);
    if (test) return { categoryName: test.categoryName || categoryById.get(test.categoryId)?.name || '—', testName: test.title, categoryId: test.categoryId, testId: id };
    const category = categoryById.get(id);
    if (category) return { categoryName: category.name, testName: '—', categoryId: id, testId: '' };
    return { categoryName: 'Unknown category', testName: '—', categoryId: '', testId: '' };
  };

  const testsForFilter = categoryFilter === ALL || categoryFilter === GENERAL
    ? allTests
    : allTests.filter((test) => test.categoryId === categoryFilter);
  const filteredFaqs = allFaqs.filter((faq) => {
    const target = targetDetails(faq);
    const matchesCategory = categoryFilter === ALL
      || (categoryFilter === GENERAL ? !faq.targetId : target.categoryId === categoryFilter);
    const matchesTest = testFilter === ALL
      || (testFilter === CATEGORY_FAQS && categoryFilter !== ALL && categoryFilter !== GENERAL && String(faq.targetId) === categoryFilter)
      || target.testId === testFilter;
    return matchesCategory && matchesTest;
  }).sort((a, b) => {
    const targetOrder = String(a.targetId ?? '').localeCompare(String(b.targetId ?? ''));
    if (targetOrder !== 0) return targetOrder;
    const displayOrder = (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0);
    return displayOrder || Number(a.id) - Number(b.id);
  });
  const formTargetId = form?.id ? form.targetId : (form?.testId || form?.categoryId);

  const nextDisplayOrder = (targetId) => allFaqs
    .filter((faq) => String(faq.targetId) === String(targetId))
    .reduce((max, faq) => Math.max(max, Number(faq.displayOrder) || 0), 0) + 1;
  const openCreate = () => setForm({ id: null, categoryId: '', testId: '', targetId: '', question: '', answer: '', displayOrder: null });
  const openEdit = (faq) => {
    const target = targetDetails(faq);
    setForm({
      id: faq.id,
      categoryId: target.categoryId === GENERAL ? '' : target.categoryId,
      testId: target.testId,
      targetId: faq.targetId ?? null,
      question: faq.question || '',
      answer: faq.answer || '',
      displayOrder: String(faq.displayOrder ?? 0),
    });
  };

  const saveFaq = async (event) => {
    event.preventDefault();
    const targetId = form.id ? form.targetId : (form.testId || form.categoryId);
    if ((!form.id && !form.categoryId) || !targetId || !form.question.trim() || !form.answer.trim()) {
      toast.error('Select a category and enter a question and answer.');
      return;
    }
    const displayOrder = form.id ? Number(form.displayOrder) || 1 : nextDisplayOrder(targetId);
    const payload = { question: form.question.trim(), answer: form.answer.trim(), displayOrder };
    setSaving(true);
    try {
      if (form.id) await faqApi.update(targetId, form.id, payload);
      else await faqApi.create({ targetId, ...payload });
      toast.success(form.id ? 'FAQ updated' : 'FAQ added');
      setForm(null);
      await reloadFaqs();
    } catch (error) {
      toast.error(getMessage(error, 'Unable to save FAQ.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await faqApi.remove(deleteTarget.targetId, deleteTarget.id);
      toast.success('FAQ deleted');
      setDeleteTarget(null);
      await reloadFaqs();
    } catch (error) {
      toast.error(getMessage(error, 'Unable to delete FAQ.'));
    } finally {
      setDeleting(false);
    }
  };

  if (adminOnly && !isAdmin) {
    return <Card><div className="p-6"><ErrorState message="FAQ management is available to administrators only." /></div></Card>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'FAQs' }]}
        title="Frequently Asked Questions"
        subtitle="Browse and manage FAQs across general, category, and mock test targets."
        actions={canManage ? <Button onClick={openCreate}><Plus size={16} className="mr-2" />Add FAQ</Button> : null}
      />

      <Card>
        <div className="grid gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2">
          <Select label="Filter by category" id="faq-category-filter" value={categoryFilter} disabled={categoriesLoading} onChange={(event) => { setCategoryFilter(event.target.value); setTestFilter(ALL); }}>
            <option value={ALL}>All categories</option>
            <option value={GENERAL}>General FAQs</option>
            {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
          </Select>
          <Select label="Filter by mock test" id="faq-test-filter" value={testFilter} disabled={testsLoading || categoryFilter === GENERAL} onChange={(event) => setTestFilter(event.target.value)}>
            <option value={ALL}>All mock tests</option>
            {categoryFilter !== ALL && categoryFilter !== GENERAL && <option value={CATEGORY_FAQS}>Category FAQs only</option>}
            {testsForFilter.map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
          </Select>
        </div>
        {(categoriesError || testsError) && <p className="px-4 pt-3 text-sm text-rose-600">{categoriesError ? getMessage(categoriesError, 'Unable to load categories.') : ''}{testsError ? ` ${getMessage(testsError, 'Unable to load mock tests.')}` : ''}</p>}
        {faqError ? <ErrorState message={faqError} onRetry={reloadFaqs} /> : (
          <DataTable
            columns={[
              { key: 'question', header: 'Question', render: (faq) => <div><p className="font-medium text-slate-900 dark:text-white">{faq.question}</p><p className="mt-1 max-w-xl whitespace-pre-wrap text-xs text-slate-500">{faq.answer}</p></div> },
              { key: 'category', header: 'Category', render: (faq) => targetDetails(faq).categoryName },
              { key: 'test', header: 'Mock test', render: (faq) => targetDetails(faq).testName },
              { key: 'actions', header: '', headerClassName: 'text-right', className: 'text-right', render: (faq) => <div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(faq)} aria-label="Edit FAQ" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Pencil size={16} /></button><button type="button" onClick={() => setDeleteTarget(faq)} aria-label="Delete FAQ" className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 size={16} /></button></div> },
            ]}
            rows={filteredFaqs}
            rowKey="id"
            loading={loadingFaqs || categoriesLoading || testsLoading}
            emptyIcon={<MessageCircleQuestion size={22} />}
            emptyTitle={allFaqs.length ? 'No FAQs match these filters' : 'No FAQs yet'}
            emptyDescription={allFaqs.length ? 'Change the category or mock test filters.' : 'Create the first FAQ to get started.'}
            emptyActionLabel={canManage && !allFaqs.length ? 'Add FAQ' : undefined}
            onEmptyAction={canManage && !allFaqs.length ? openCreate : undefined}
          />
        )}
      </Card>

      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setForm(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="faq-form-title" className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={saveFaq}>
              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800"><h2 id="faq-form-title" className="text-lg font-semibold text-slate-900 dark:text-white">{form.id ? 'Edit FAQ' : 'Add FAQ'}</h2><p className="mt-1 text-sm text-slate-500">{form.id ? 'Update the FAQ details.' : 'Choose the category for this FAQ.'}</p></div>
              <div className="space-y-4 px-6 py-5">
                {!form.id && <>
                  <Select label="Category" id="faq-form-category" value={form.categoryId} disabled={categoriesLoading} placeholder="Select a category" onChange={(event) => setForm({ ...form, categoryId: event.target.value, testId: '' })}>
                    {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                  </Select>
                  <Select label="Mock test" id="faq-form-test" value={form.testId} disabled={!form.categoryId || testsLoading} placeholder={!form.categoryId ? 'Choose a category first' : testsLoading ? 'Loading mock tests…' : 'No mock test (category FAQ)'} onChange={(event) => setForm({ ...form, testId: event.target.value })}>
                    {allTests.filter((test) => test.categoryId === form.categoryId).map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
                  </Select>
                  {formTargetId && <p className="text-xs text-slate-500">This FAQ will be placed at position {nextDisplayOrder(formTargetId)} in the selected {form.testId ? 'mock test' : 'category'}.</p>}
                </>}
                <Input label="Question" id="faq-question" maxLength={2000} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} required />
                <Textarea label="Answer" id="faq-answer" rows={6} maxLength={10000} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800"><Button type="button" variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button><Button type="submit" isLoading={saving}>{form.id ? 'Save changes' : 'Add FAQ'}</Button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} isLoading={deleting} title="Delete FAQ?" description={`Delete “${deleteTarget?.question || ''}”? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
