'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, FolderTree, Languages, Info } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FolderTree size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Basic Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">Enter the main details of the category.</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
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
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Languages size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Required Languages</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Translations must be provided in these languages for every series under this category.
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.requiredLanguages.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-1 uppercase"
                >
                  {code}
                  <button type="button" onClick={() => removeLanguage(code)} className="hover:text-indigo-900">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {form.requiredLanguages.length === 0 && <span className="text-xs text-slate-400">No languages selected</span>}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_LANGUAGES.filter((l) => !form.requiredLanguages.includes(l.value)).map((l) => (
                <button
                  type="button"
                  key={l.value}
                  onClick={() => addLanguage(l.value)}
                  className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                >
                  + {l.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="lang-code"
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
              <Button type="button" variant="outline" onClick={() => addLanguage(langInput)}>
                <Plus size={16} />
              </Button>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/admin-dashboard/categories')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            {isEdit ? 'Save changes' : 'Create Category'}
          </Button>
        </div>
      </div>

      {/* Live preview sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Preview</h2>
            <p className="text-sm text-slate-500 mt-0.5">This is how the category will appear in the platform.</p>
          </CardHeader>
          <CardBody>
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mb-3">
                <FolderTree size={22} />
              </div>
              <h3 className="font-semibold text-slate-900">{form.name || 'Category name'}</h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                {form.description || 'A short description of this category will appear here.'}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.requiredLanguages.map((l) => (
                  <span key={l} className="text-[10px] font-semibold uppercase bg-white/70 text-indigo-700 px-1.5 py-0.5 rounded">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-3">
            <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              {isEdit
                ? 'Changes here apply immediately to every series under this category.'
                : 'You can create test series under this category as soon as it is saved.'}
            </p>
          </CardBody>
        </Card>
      </div>
    </form>
  );
}