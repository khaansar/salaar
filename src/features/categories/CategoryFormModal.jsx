'use client';
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { categoriesApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { COMMON_LANGUAGES } from '@/constants/enums';

const emptyForm = { id: '', name: '', description: '', requiredLanguages: ['en'] };

export function CategoryFormModal({ open, onClose, category, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [langInput, setLangInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const isEdit = Boolean(category);

  // Render-phase state sync for resetting internal state when modal opens
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevCategory, setPrevCategory] = useState(category);

  if (open !== prevOpen || category !== prevCategory) {
    setPrevOpen(open);
    setPrevCategory(category);
    if (open) {
      setForm(
        category
          ? {
              id: category.id || '',
              name: category.name || '',
              description: category.description || '',
              requiredLanguages: category.requiredLanguages?.length ? category.requiredLanguages : ['en'],
            }
          : emptyForm
      );
      setErrors({});
      setLangInput('');
    }
  }

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
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit category' : 'New category'} description="Categories group related test series together." footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={saving}>{isEdit ? 'Save changes' : 'Create category'}</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <Input id="cat-id" label="Category ID" placeholder="e.g. ssc-cgl" value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))} error={errors.id} />
        )}
        <Input id="cat-name" label="Name" placeholder="e.g. SSC CGL" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
        <Textarea id="cat-desc" label="Description" placeholder="Short description shown to admins" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Required languages</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.requiredLanguages.map((code) => (
              <span key={code} className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-2.5 py-1">
                {code}
                <button type="button" onClick={() => removeLanguage(code)} className="hover:text-indigo-900"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_LANGUAGES.filter((l) => !form.requiredLanguages.includes(l.value)).map((l) => (
              <button type="button" key={l.value} onClick={() => addLanguage(l.value)} className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600">+ {l.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input id="lang-code" placeholder="custom code, e.g. gu" value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(langInput); } }} />
            <Button type="button" variant="outline" onClick={() => addLanguage(langInput)}><Plus size={16} /></Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}