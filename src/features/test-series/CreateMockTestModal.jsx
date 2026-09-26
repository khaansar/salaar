'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { mockTestsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = {
  title: '',
  durationMinutes: 60,
  isSectionOrderStrict: false,
  shuffleSections: false,
  negativeMarkingEnabled: true,
  instructions: '',
  isFree: false,
};

export function CreateMockTestModal({ open, onClose, seriesId, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) next.durationMinutes = 'Enter a valid duration';
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
        durationMinutes: Number(form.durationMinutes),
        isSectionOrderStrict: form.isSectionOrderStrict,
        shuffleSections: form.shuffleSections,
        negativeMarkingEnabled: form.negativeMarkingEnabled,
        instructions: form.instructions.trim(),
        isFree: form.isFree,
      };
      const created = await mockTestsApi.create(seriesId, payload);
      toast.success('Mock test created');
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to create mock test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New mock test" description="Configure the base settings. You can build out sections and questions next." width="lg" footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={saving}>Create test</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="test-title" label="Title" placeholder="e.g. Full Length Mock Test 1" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input id="test-duration" label="Duration (minutes)" type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} error={errors.durationMinutes} />
        <Textarea id="test-instructions" label="Instructions" placeholder="Instructions shown to students before starting" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Checkbox id="test-strict-order" label="Strict section order" checked={form.isSectionOrderStrict} onChange={(e) => setForm((f) => ({ ...f, isSectionOrderStrict: e.target.checked }))} />
          <Checkbox id="test-shuffle-sections" label="Shuffle sections" checked={form.shuffleSections} onChange={(e) => setForm((f) => ({ ...f, shuffleSections: e.target.checked }))} />
          <Checkbox id="test-negative-marking" label="Negative marking" checked={form.negativeMarkingEnabled} onChange={(e) => setForm((f) => ({ ...f, negativeMarkingEnabled: e.target.checked }))} />
          <Checkbox id="test-free" label="Free test" checked={form.isFree} onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))} />
        </div>
      </form>
    </Modal>
  );
}