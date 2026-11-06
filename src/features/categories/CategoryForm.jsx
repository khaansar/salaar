'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, FolderTree, Languages, Save } from 'lucide-react';
import { FormSection, FormActionBar, InlineAlert } from '@/components/admin/AdminUi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { categoriesApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { COMMON_LANGUAGES } from '@/constants/enums';

const emptyForm = { id: '', name: '', description: '', requiredLanguages: ['en'] };

export function CategoryForm({ category }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(category);

  const [form, setForm] = useState(() =>
    category
      ? {
          id: category.id || '',
          name: category.name || '',
          description: category.description || '',
          requiredLanguages: category.requiredLanguages?.length ? category.requiredLanguages : ['en'],
        }
      : emptyForm
  );
  const [langInput, setLangInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const addLanguage = (code) => {
    const value = code.trim().toLowerCase();
    if (!value || form.requiredLanguages.includes(value)) return;
    setForm((f) => ({ ...f, requiredLanguages: [...f.requiredLanguages, value] }));
    setLangInput('');
  };

  const removeLanguage = (code) => {
    setForm((f) => ({ ...f, requiredLanguages: f.requiredLanguages.filter((l) => l !== code) }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Category name is required';
    if (!isEdit && !form.id.trim()) next.id = 'Category ID is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        id: form.id.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        requiredLanguages: form.requiredLanguages,
      };
      if (isEdit) {
        await categoriesApi.update(category.id, payload);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(payload);
        toast.success('Category created');
      }
      router.push('/admin-dashboard/categories');
    } catch (err) {
      toast.error(err?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection icon={FolderTree} tone="indigo" title="Basic information" description="Enter the main details of the category.">
            {!isEdit && (
              <Input
                id="cat-id"
                label="Category ID"
                placeholder="e.g. engineering"
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                error={errors.id}
              />
            )}
            <Input
              id="cat-name"
              label="Category Name"
              placeholder="e.g. Engineering, Medical, Government Exams"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
            />
            <Textarea
              id="cat-desc"
              label="Description"
              placeholder="Comprehensive collection of mock tests for this category..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormSection>

          <FormSection
            icon={Languages}
            tone="emerald"
            title="Required languages"
            description="Translations must be provided in these languages for every series under this category."
          >
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected</p>
              <div className="flex flex-wrap gap-2">
                {form.requiredLanguages.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
                  >
                    {code}
                    <button
                      type="button"
                      aria-label={`Remove ${code}`}
                      onClick={() => removeLanguage(code)}
                      className="rounded-full hover:text-indigo-900 dark:hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {form.requiredLanguages.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">No languages selected</span>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Add a language</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.filter((l) => !form.requiredLanguages.includes(l.value)).map((l) => (
                  <button
                    type="button"
                    key={l.value}
                    onClick={() => addLanguage(l.value)}
                    className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:text-indigo-300"
                  >
                    <Plus size={11} /> {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                id="lang-code"
                aria-label="Custom language code"
                placeholder="Custom language code, e.g. gu"
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLanguage(langInput);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addLanguage(langInput)} aria-label="Add custom language">
                <Plus size={16} />
              </Button>
            </div>
          </FormSection>
        </div>

        {/* Live preview sidebar */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <FormSection title="Preview" description="How the category appears on the platform.">
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-indigo-500/10 dark:to-violet-500/10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                <FolderTree size={22} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{form.name || 'Category name'}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                {form.description || 'A short description of this category will appear here.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.requiredLanguages.map((l) => (
                  <span key={l} className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700 dark:bg-slate-900/70 dark:text-indigo-300">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </FormSection>

          <InlineAlert tone="info">
            {isEdit
              ? 'Changes here apply immediately to every series under this category.'
              : 'You can create test series under this category as soon as it is saved.'}
          </InlineAlert>
        </div>
      </div>

      <FormActionBar hint={isEdit ? 'Editing an existing category.' : 'The category is created as soon as you save.'}>
        <Button type="button" variant="outline" onClick={() => router.push('/admin-dashboard/categories')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save size={16} className="mr-2" />
          {isEdit ? 'Save changes' : 'Create Category'}
        </Button>
      </FormActionBar>
    </form>
  );
}
