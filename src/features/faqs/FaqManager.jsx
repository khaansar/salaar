'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircleQuestion, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetCategoriesListQuery, useGetSeriesListQuery } from '@/store/adminApi';
import { seriesApi } from '@/services/adminService';
import { faqApi } from '@/services/faqService';
import apiClient from '@/lib/apiClient';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/common/ToastProvider';

const getMessage = (error, fallback) => error?.message || fallback;
const GLOBAL_TARGET = '__global__';
const EMPTY_LIST = [];

export function FaqManager({ adminOnly = false }) {
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';
  const canManage = adminOnly && isAdmin;
  const [categoryId, setCategoryId] = useState('');
  const [testId, setTestId] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [faqError, setFaqError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: categoryData = [], isLoading: adminCategoriesLoading } = useGetCategoriesListQuery({ limit: 100 }, { skip: !isAdmin });
  const [publicCategories, setPublicCategories] = useState([]);
  const [publicCategoriesLoading, setPublicCategoriesLoading] = useState(false);
  const [publicCategoryError, setPublicCategoryError] = useState(false);
  useEffect(() => {
    let active = true;
    if (isAdmin) return () => { active = false; };
    setPublicCategoriesLoading(true);
    apiClient.get('/tests-api/public/categories')
      .then((items) => { if (active) setPublicCategories(Array.isArray(items) ? items : []); })
      .catch(() => { if (active) { setPublicCategories([]); setPublicCategoryError(true); } })
      .finally(() => { if (active) setPublicCategoriesLoading(false); });
    return () => { active = false; };
  }, [isAdmin]);
  const categories = isAdmin ? (Array.isArray(categoryData) ? categoryData : []) : publicCategories;
  const categoriesLoading = isAdmin ? adminCategoriesLoading : publicCategoriesLoading;
  const { data: seriesData, error: adminTestsError } = useGetSeriesListQuery(
    { categoryId, limit: 100, page: 1 },
    { skip: !isAdmin || !categoryId || categoryId === GLOBAL_TARGET }
  );
  const series = useMemo(() => (Array.isArray(seriesData) ? seriesData : EMPTY_LIST), [seriesData]);
  const seriesIds = series.map((item) => item.id).join('|');
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [publicTestsError, setPublicTestsError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadTests = async () => {
      if (!categoryId || categoryId === GLOBAL_TARGET) {
        setTests((current) => current.length ? [] : current);
        setTestsLoading((current) => current ? false : current);
        return;
      }
      setTestsLoading(true);
      setPublicTestsError(false);
      try {
        let seriesDetails;
        if (isAdmin) {
          const ids = seriesIds ? seriesIds.split('|') : [];
          seriesDetails = await Promise.all(ids.map((id) => seriesApi.get(id)));
        } else {
          const publishedSeries = await apiClient.get('/tests-api/public/series', {
            params: { categoryId, page: 1, limit: 100 },
          });
          const ids = (Array.isArray(publishedSeries) ? publishedSeries : []).map((item) => item.id);
          seriesDetails = await Promise.all(ids.map((id) => apiClient.get(`/tests-api/pubwlic/series/${encodeURIComponent(id)}`)));
        }
        if (active) setTests(seriesDetails.flatMap((item) => item.mockTests || []));
      } catch {
        if (active) {
          setTests([]);
          if (!isAdmin) setPublicTestsError(true);
        }
      } finally {
        if (active) setTestsLoading(false);
      }
    };
    loadTests();
    return () => { active = false; };
  }, [categoryId, isAdmin, seriesIds]);

  const isGlobalTarget = categoryId === GLOBAL_TARGET;
  const targetId = isGlobalTarget ? null : (testId || categoryId || null);
  const hasTarget = isGlobalTarget || Boolean(targetId);
  const targetLabel = isGlobalTarget ? 'General FAQs' : testId ? tests.find((test) => String(test.testId || test.id) === testId)?.title : categories.find((category) => String(category.id) === categoryId)?.name;
  const testsError = isAdmin ? adminTestsError : (publicCategoryError || publicTestsError);

  useEffect(() => {
    let active = true;
    if (!hasTarget) {
      setFaqs([]);
      setFaqError('');
      setLoadingFaqs(false);
      return () => { active = false; };
    }
    setLoadingFaqs(true);
    setFaqError('');
    faqApi.list(targetId)
      .then((items) => { if (active) setFaqs(Array.isArray(items) ? items : []); })
      .catch((error) => { if (active) setFaqError(getMessage(error, 'Unable to load FAQs.')); })
      .finally(() => { if (active) setLoadingFaqs(false); });
    return () => { active = false; };
  }, [targetId, hasTarget]);

  const reloadFaqs = async () => {
    if (!hasTarget) return;
    setLoadingFaqs(true);
    setFaqError('');
    try {
      const items = await faqApi.list(targetId);
      setFaqs(Array.isArray(items) ? items : []);
    } catch (error) {
      setFaqError(getMessage(error, 'Unable to load FAQs.'));
    } finally {
      setLoadingFaqs(false);
    }
  };

  const openCreate = () => setForm({ id: null, question: '', answer: '', displayOrder: String(faqs.length + 1) });
  const openEdit = (faq) => setForm({ id: faq.id, question: faq.question || '', answer: faq.answer || '', displayOrder: String(faq.displayOrder ?? 0) });

  const saveFaq = async (event) => {
    event.preventDefault();
    if (!hasTarget || !form) return;
    if (!form.question.trim() || !form.answer.trim() || !Number.isInteger(Number(form.displayOrder))) {
      toast.error('Enter a question, answer, and a whole-number display order.');
      return;
    }
    const payload = { question: form.question.trim(), answer: form.answer.trim(), displayOrder: Number(form.displayOrder) };
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

  const deleteFaq = async () => {
    if (!deleteTarget || !hasTarget) return;
    setDeleting(true);
    try {
      await faqApi.remove(targetId, deleteTarget.id);
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
    <div className="max-w-5xl mx-auto">
      <PageHeader
        breadcrumbs={canManage ? [{ label: 'Admin', href: '/admin-dashboard' }, { label: 'FAQs' }] : [{ label: 'Dashboard', href: '/dashboard' }, { label: 'FAQs' }]}
        title="Frequently Asked Questions"
        subtitle={canManage ? 'Manage answers for an exam category or a specific test.' : 'Browse answers for your exam category or a specific test.'}
        actions={canManage && targetId ? <Button onClick={openCreate}><Plus size={16} className="mr-2" />Add FAQ</Button> : null}
      />

      {adminOnly && !isAdmin ? (
        <Card><div className="p-6"><ErrorState message="FAQ management is available to administrators only." /></div></Card>
      ) : (
        <>
          <Card className="mb-5">
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Select label="Category" id="faq-category" value={categoryId} disabled={categoriesLoading} placeholder={categoriesLoading ? 'Loading categories…' : 'Select a category'} onChange={(event) => { setCategoryId(event.target.value); setTestId(''); }}>
                <option value={GLOBAL_TARGET}>General FAQs</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
              <Select label="Mock test" id="faq-test" value={testId} disabled={!categoryId || isGlobalTarget || testsLoading} placeholder={!categoryId ? 'Choose a category first' : isGlobalTarget ? 'Not applicable to general FAQs' : testsLoading ? 'Loading tests…' : 'Category FAQs'} onChange={(event) => setTestId(event.target.value)}>
                {tests.map((test) => <option key={test.testId || test.id} value={test.testId || test.id}>{test.title || test.name || `Test ${test.testId || test.id}`}</option>)}
              </Select>
            </div>
            {testsError && !isGlobalTarget && <p className="px-4 pb-4 text-sm text-rose-600">Unable to load mock tests for this category.</p>}
          </Card>

          {!hasTarget ? (
            <Card><EmptyState icon={<MessageCircleQuestion size={22} />} title="Choose a category" description="Select a category to view its FAQs, or choose a test for test-specific answers." /></Card>
          ) : (
            <Card>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
                <div><h2 className="font-semibold text-slate-900 dark:text-white">{targetLabel || 'FAQs'}</h2><p className="text-xs text-slate-500 mt-0.5">{isGlobalTarget ? 'General FAQs' : testId ? 'Mock test FAQs' : 'Category FAQs'}</p></div>
                {canManage && <Button size="sm" variant="outline" onClick={openCreate}><Plus size={14} className="mr-1.5" />Add FAQ</Button>}
              </div>
              {loadingFaqs ? <div className="p-8 text-center text-sm text-slate-500">Loading FAQs…</div> : faqError ? <ErrorState message={faqError} onRetry={reloadFaqs} /> : faqs.length === 0 ? <EmptyState icon={<MessageCircleQuestion size={22} />} title="No FAQs yet" description={canManage ? 'Add the first FAQ for this selection.' : 'There are no FAQs for this selection yet.'} actionLabel={canManage ? 'Add FAQ' : undefined} onAction={canManage ? openCreate : undefined} /> : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {faqs.map((faq, index) => (
                    <article key={faq.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0"><h3 className="font-medium text-slate-900 dark:text-white">{faq.question}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p><p className="mt-3 text-xs text-slate-400">Order {faq.displayOrder ?? index + 1}</p></div>
                        {canManage && <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => openEdit(faq)} aria-label="Edit FAQ" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"><Pencil size={16} /></button><button type="button" onClick={() => setDeleteTarget(faq)} aria-label="Delete FAQ" className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 size={16} /></button></div>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setForm(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="faq-form-title" className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={saveFaq}>
              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800"><h2 id="faq-form-title" className="text-lg font-semibold text-slate-900 dark:text-white">{form.id ? 'Edit FAQ' : 'Add FAQ'}</h2><p className="mt-1 text-sm text-slate-500">For {targetLabel || 'the selected target'}.</p></div>
              <div className="space-y-4 px-6 py-5">
                <Input label="Question" id="faq-question" maxLength={2000} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} required />
                <Textarea label="Answer" id="faq-answer" rows={6} maxLength={10000} value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required />
                <Input label="Display order" id="faq-order" type="number" step="1" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} required />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800"><Button type="button" variant="outline" onClick={() => setForm(null)} disabled={saving}>Cancel</Button><Button type="submit" isLoading={saving}>{form.id ? 'Save changes' : 'Add FAQ'}</Button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={deleteFaq} isLoading={deleting} title="Delete FAQ?" description={`Delete “${deleteTarget?.question || ''}”? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
