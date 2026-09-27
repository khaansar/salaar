'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Library, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Library size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Basic Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                A test series is a collection of mock tests (e.g. a full course or exam pack).
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              id="series-title"
              label="Title"
              placeholder="e.g. SSC CGL 2026 Complete Test Pack"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
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
              label="Base price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              error={errors.basePrice}
              helpText="Set to 0 for a free series."
            />
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
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
        </div>
      </div>

      {/* Live preview sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Preview</h2>
          </CardHeader>
          <CardBody>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-3">
                <Library size={22} />
              </div>
              <h3 className="font-semibold text-slate-900">{form.title || 'Series title'}</h3>
              <p className="text-sm text-slate-600 mt-1">{selectedCategory?.name || 'No category selected'}</p>
              <p className="text-sm font-medium text-slate-800 mt-3">
                {form.basePrice ? `₹${Number(form.basePrice).toFixed(2)}` : 'Free'}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-sm text-slate-600">
            {isEdit
              ? 'Changing the category moves this series (and its mock tests) into the new category immediately.'
              : 'You can add mock tests to this series as soon as it is saved.'}
          </CardBody>
        </Card>
      </div>
    </form>
  );
}