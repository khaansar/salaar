'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, Save } from 'lucide-react';
import { FormSection, FormActionBar, InlineAlert } from '@/components/admin/AdminUi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { seriesApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = { title: '', basePrice: '', categoryId: '' };

export function SeriesForm({ series, categories = [] }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(series);

  const [form, setForm] = useState(() =>
    series
      ? { title: series.title || '', basePrice: series.basePrice ?? '', categoryId: series.categoryId || '' }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (form.basePrice === '' || Number.isNaN(Number(form.basePrice)) || Number(form.basePrice) < 0) {
      next.basePrice = 'Enter a valid price';
    }
    if (!form.categoryId) next.categoryId = 'Select a category';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        basePrice: Number(form.basePrice),
        categoryId: form.categoryId,
      };
      if (isEdit) {
        await seriesApi.update(series.id, payload);
        toast.success('Test series updated');
        router.push(`/admin-dashboard/series/${series.id}`);
      } else {
        const created = await seriesApi.create(payload);
        toast.success('Test series created');
        router.push(`/admin-dashboard/series/${created.id}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save test series');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection
            icon={Library}
            tone="emerald"
            title="Basic information"
            description="A test series is a collection of mock tests (e.g. a full course or exam pack)."
          >
            <Input
              id="series-title"
              label="Title"
              placeholder="e.g. SSC CGL 2026 Complete Test Pack"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                id="series-category"
                label="Category"
                placeholder="Select a category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                error={errors.categoryId}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                id="series-price"
                label="Base price (₹)"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                error={errors.basePrice}
                helpText="Set to 0 for a free series."
              />
            </div>
          </FormSection>
        </div>

        {/* Live preview sidebar */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <FormSection title="Preview" description="How the series appears on the platform.">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-500/10 dark:to-teal-500/10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300">
                <Library size={22} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{form.title || 'Series title'}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{selectedCategory?.name || 'No category selected'}</p>
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {form.basePrice ? `₹${Number(form.basePrice).toFixed(2)}` : 'Free'}
              </p>
            </div>
          </FormSection>

          <InlineAlert tone="info">
            {isEdit
              ? 'Changing the category moves this series (and its mock tests) into the new category immediately.'
              : 'You can add mock tests to this series as soon as it is saved.'}
          </InlineAlert>
        </div>
      </div>

      <FormActionBar hint={isEdit ? 'Editing an existing test series.' : 'You will be taken to the series once it is created.'}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(isEdit ? `/admin-dashboard/series/${series.id}` : '/admin-dashboard/series')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save size={16} className="mr-2" />
          {isEdit ? 'Save changes' : 'Create series'}
        </Button>
      </FormActionBar>
    </form>
  );
}
