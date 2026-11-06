'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircleQuestion, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { IconAction, InlineAlert } from '@/components/admin/AdminUi';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/common/ToastProvider';

const ALL = '__all__';
const GENERAL = '__general__';
const PAGE_SIZE = 100;
const SERIES_PAGE_SIZE = 20;
const EMPTY_LIST = [];
const getMessage = (error, fallback) => error?.message || fallback;

export function FaqManager({ adminOnly = false }) {
  const toast = useToast();
  const canManage = adminOnly;
  const { data: categoryData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesListQuery({ limit: PAGE_SIZE }, { skip: !adminOnly });
  const categories = useMemo(() => Array.isArray(categoryData) ? categoryData : EMPTY_LIST, [categoryData]);

  const [allFaqs, setAllFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [allSeries, setAllSeries] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [seriesOptionsLoading, setSeriesOptionsLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [testFilter, setTestFilter] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTest, setFormTest] = useState('');
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
        const firstPage = await seriesApi.list({ page: 1, limit: SERIES_PAGE_SIZE });
        const pageCount = Math.max(1, Number(firstPage.meta?.pagination?.total_pages || 1));
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) => seriesApi.list({ page: index + 2, limit: SERIES_PAGE_SIZE }))
        );
        const series = [firstPage.data, ...remainingPages.map((page) => page.data)].flat();
        if (active) setAllSeries(series);
      } catch (error) {
        if (active) setTestsError(getMessage(error, 'Unable to load test series.'));
      } finally {
        if (active) setTestsLoading(false);
      }
    };
    loadTests();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (categoryFilter === ALL || categoryFilter === GENERAL) {
      setSeriesOptions([]);
      setSeriesOptionsLoading(false);
      return () => { active = false; };
    }

    const loadCategorySeries = async () => {
      setSeriesOptions([]);
      setSeriesOptionsLoading(true);
      try {
        const firstPage = await seriesApi.list({ categoryId: categoryFilter, page: 1, limit: SERIES_PAGE_SIZE });
        const pageCount = Math.max(1, Number(firstPage.meta?.pagination?.total_pages || 1));
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) => seriesApi.list({ categoryId: categoryFilter, page: index + 2, limit: SERIES_PAGE_SIZE }))
        );
        const items = [firstPage.data, ...remainingPages.map((page) => page.data)].flat();
        if (active) setSeriesOptions(items.map((series) => ({ ...series, categoryId: categoryFilter })));
      } catch (error) {
        if (active) setTestsError(getMessage(error, 'Unable to load test series for this category.'));
      } finally {
        if (active) setSeriesOptionsLoading(false);
      }
    };

    loadCategorySeries();
    return () => { active = false; };
  }, [categoryFilter]);

  const [formSeriesOptions, setFormSeriesOptions] = useState([]);
  const [formSeriesLoading, setFormSeriesLoading] = useState(false);
  useEffect(() => {
    let active = true;
    if (!formCategory || formCategory === GENERAL) {
      setFormSeriesOptions([]);
      setFormSeriesLoading(false);
      return () => { active = false; };
    }
    const loadFormSeries = async () => {
      setFormSeriesLoading(true);
      try {
        const firstPage = await seriesApi.list({ categoryId: formCategory, page: 1, limit: SERIES_PAGE_SIZE });
        const pageCount = Math.max(1, Number(firstPage.meta?.pagination?.total_pages || 1));
        const remainingPages = await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => seriesApi.list({ categoryId: formCategory, page: index + 2, limit: SERIES_PAGE_SIZE })));
        if (active) setFormSeriesOptions([firstPage.data, ...remainingPages.map((page) => page.data)].flat());
      } catch (error) {
        if (active) setTestsError(getMessage(error, 'Unable to load test series for this category.'));
      } finally {
        if (active) setFormSeriesLoading(false);
      }
    };
    loadFormSeries();
    return () => { active = false; };
  }, [formCategory]);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category])),
    [categories]
  );
  const seriesById = useMemo(
    () => new Map([...allSeries, ...seriesOptions].map((series) => [String(series.id), series])),
    [allSeries, seriesOptions]
  );
  const targetDetails = (faq) => {
    if (!faq.targetId) return { categoryName: 'General', testName: '—', categoryId: GENERAL, testId: '' };
    const id = String(faq.targetId);
    const series = seriesById.get(id);
    if (series) {
      const seriesCategoryId = String(series.categoryId || categories.find((category) => category.name === series.categoryName)?.id || '');
      return { categoryName: series.categoryName || categoryById.get(seriesCategoryId)?.name || '—', testName: series.title || 'Untitled test series', categoryId: seriesCategoryId, testId: id };
    }
    const category = categoryById.get(id);
    if (category) return { categoryName: category.name, testName: '—', categoryId: id, testId: '' };
    return { categoryName: 'Unknown category', testName: '—', categoryId: '', testId: '' };
  };

  const seriesForFilter = seriesOptions;
  const filteredFaqs = allFaqs.filter((faq) => {
    const target = targetDetails(faq);
    const matchesCategory = categoryFilter === ALL
      || (categoryFilter === GENERAL ? !faq.targetId : target.categoryId === categoryFilter);
    const matchesTest = !testFilter || String(faq.targetId) === testFilter;
    return matchesCategory && matchesTest;
  }).sort((a, b) => {
    const targetOrder = String(a.targetId ?? '').localeCompare(String(b.targetId ?? ''));
    if (targetOrder !== 0) return targetOrder;
    const displayOrder = (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0);
    return displayOrder || Number(a.id) - Number(b.id);
  });
  const nextDisplayOrder = (targetId) => allFaqs
    .filter((faq) => String(faq.targetId) === String(targetId))
    .reduce((max, faq) => Math.max(max, Number(faq.displayOrder) || 0), 0) + 1;
  const openCreate = () => {
    setFormCategory('');
    setFormTest('');
    setForm({ id: null, categoryId: '', testId: '', targetId: null, question: '', answer: '', displayOrder: null });
  };
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
    const targetId = form.id ? (form.targetId ?? null) : (formCategory === GENERAL ? null : (formTest || formCategory || null));
    if (!form.id && !formCategory) {
      toast.error('Select Homepage FAQs or a category.');
      return;
    }
    if (!form.id && formCategory !== GENERAL && !formTest) {
      toast.error('Select a test series.');
      return;
    }
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Enter a question and answer.');
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

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: 'FAQs' }]}
        title="Frequently Asked Questions"
        subtitle="Browse and manage homepage and test-series FAQs."
        actions={canManage ? <Button onClick={openCreate}><Plus size={16} className="mr-2" />Add FAQ</Button> : null}
      />

      <Card>
        <div className="grid gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2">
          <Select label="Filter by category" id="faq-category-filter" value={categoryFilter} disabled={categoriesLoading} onChange={(event) => { setCategoryFilter(event.target.value); setTestFilter(''); }}>
            <option value={ALL}>All categories</option>
            <option value={GENERAL}>Homepage FAQs</option>
            {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
          </Select>
          <Select label="Filter by test series" id="faq-test-filter" value={testFilter} placeholder={categoryFilter === ALL ? 'Choose a category first' : categoryFilter === GENERAL ? 'Not available for general FAQs' : seriesOptionsLoading ? 'Loading test series…' : seriesForFilter.length ? 'Select a test series' : 'No test series in this category'} disabled={seriesOptionsLoading || categoryFilter === ALL || categoryFilter === GENERAL} onChange={(event) => setTestFilter(event.target.value)}>
            {seriesForFilter.map((series) => <option key={series.id} value={String(series.id)}>{series.title}</option>)}
          </Select>
        </div>
        {(categoriesError || testsError) && (
          <div className="px-4 pt-4">
            <InlineAlert tone="danger">
              {categoriesError ? getMessage(categoriesError, 'Unable to load categories.') : ''}{testsError ? ` ${testsError}` : ''}
            </InlineAlert>
          </div>
        )}
        {!faqError && !(loadingFaqs || categoriesLoading || testsLoading) && (
          <div className="px-5 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredFaqs.length}</span> of {allFaqs.length} FAQs
          </div>
        )}
        {faqError ? <ErrorState message={faqError} onRetry={reloadFaqs} /> : (
          <DataTable
            columns={[
              {
                key: 'question',
                header: 'Question',
                render: (faq) => (
                  <div className="max-w-xl">
                    <p className="line-clamp-2 break-words font-medium leading-5 text-slate-900 dark:text-white">{faq.question}</p>
                    <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words text-xs leading-4 text-slate-500 dark:text-slate-400">{faq.answer}</p>
                  </div>
                ),
              },
              {
                key: 'category',
                header: 'Category',
                render: (faq) => {
                  const name = targetDetails(faq).categoryName;
                  return name === 'General' ? <Badge tone="info">Homepage</Badge> : <span className="text-sm">{name}</span>;
                },
              },
              { key: 'test', header: 'Test series', render: (faq) => <span className="text-sm">{targetDetails(faq).testName}</span> },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                headerClassName: 'text-right',
                className: 'text-right',
                render: (faq) => (
                  <div className="flex justify-end gap-1">
                    <IconAction label="Edit FAQ" onClick={() => openEdit(faq)}><Pencil size={15} /></IconAction>
                    <IconAction label="Delete FAQ" tone="danger" onClick={() => setDeleteTarget(faq)}><Trash2 size={15} /></IconAction>
                  </div>
                ),
              },
            ]}
            rows={filteredFaqs}
            rowKey="id"
            loading={loadingFaqs || categoriesLoading || testsLoading}
            emptyIcon={<MessageCircleQuestion size={22} />}
            emptyTitle={allFaqs.length ? 'No FAQs match these filters' : 'No FAQs yet'}
            emptyDescription={allFaqs.length ? 'Change the category or test series filters.' : 'Create the first FAQ to get started.'}
            emptyActionLabel={canManage && !allFaqs.length ? 'Add FAQ' : undefined}
            onEmptyAction={canManage && !allFaqs.length ? openCreate : undefined}
          />
        )}
      </Card>

      <Modal
        open={Boolean(form)}
        onClose={() => { if (!saving) setForm(null); }}
        title={form?.id ? 'Edit FAQ' : 'Add FAQ'}
        description={form?.id ? 'Update the FAQ details.' : form?.targetId ? 'This FAQ will be added to the selected test series.' : 'Add a FAQ for the homepage or a test series.'}
        width="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="faq-form" isLoading={saving}>{form?.id ? 'Save changes' : 'Add FAQ'}</Button>
          </>
        }
      >
        {form && (
          <form id="faq-form" onSubmit={saveFaq} className="space-y-4">
            {!form.id && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Category" id="faq-form-category" value={formCategory} disabled={categoriesLoading} placeholder="Select a category" onChange={(event) => { setFormCategory(event.target.value); setFormTest(''); }}>
                  <option value={GENERAL}>Homepage FAQs</option>
                  {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                </Select>
                <Select label="Test series" id="faq-form-test" value={formTest} disabled={!formCategory || formCategory === GENERAL || formSeriesLoading} placeholder={!formCategory ? 'Choose a category first' : formCategory === GENERAL ? 'Not available for Homepage FAQs' : formSeriesLoading ? 'Loading test series…' : 'Select a test series'} required={Boolean(formCategory && formCategory !== GENERAL)} onChange={(event) => setFormTest(event.target.value)}>
                  {formSeriesOptions.map((series) => <option key={series.id} value={String(series.id)}>{series.title}</option>)}
                </Select>
              </div>
            )}
            <Input label="Question" id="faq-question" maxLength={2000} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} required />
            <Textarea label="Answer" id="faq-answer" rows={6} maxLength={10000} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required />
          </form>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} isLoading={deleting} title="Delete FAQ?" description={`Delete “${deleteTarget?.question || ''}”? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
