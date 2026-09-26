'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { seriesApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = { title: '', basePrice: '', categoryId: '' };

export function SeriesFormModal({ open, onClose, series, categories = [], onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const isEdit = Boolean(series);

  useEffect(() => {
    if (open) {
      setForm(
        series
          ? {
              title: series.title || '',
              basePrice: series.basePrice ?? '',
              categoryId: series.categoryId || '',
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, series]);

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
      } else {
        await seriesApi.create(payload);
        toast.success('Test series created');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save test series');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit test series' : 'New test series'}
      description="A test series is a collection of mock tests (e.g. a full course or exam pack)."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={saving}>
            {isEdit ? 'Save changes' : 'Create series'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
        />
      </form>
    </Modal>
  );
}
