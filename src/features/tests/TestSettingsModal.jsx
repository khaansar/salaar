'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { mockTestsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

export function TestSettingsModal({ open, onClose, test, onSaved }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevTest, setPrevTest] = useState(test);

  if (open !== prevOpen || test !== prevTest) {
    setPrevOpen(open);
    setPrevTest(test);
    if (open && test) {
      setForm({
        title: test.title || '',
        durationMinutes: test.durationMinutes || 60,
        isSectionOrderStrict: Boolean(test.isSectionOrderStrict),
        shuffleSections: Boolean(test.shuffleSections),
        negativeMarkingEnabled: Boolean(test.negativeMarkingEnabled),
        instructions: test.instructions || '',
        isFree: Boolean(test.isFree),
      });
      setErrors({});
    }
  }

  if (!form) return null;

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
      await mockTestsApi.update(test.id, {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        instructions: form.instructions.trim(),
      });
      toast.success('Test settings saved');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Test settings" width="lg" footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={saving}>Save changes</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="settings-title" label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input id="settings-duration" label="Duration (minutes)" type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} error={errors.durationMinutes} />
        <Textarea id="settings-instructions" label="Instructions" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Checkbox id="settings-strict-order" label="Strict section order" checked={form.isSectionOrderStrict} onChange={(e) => setForm((f) => ({ ...f, isSectionOrderStrict: e.target.checked }))} />
          <Checkbox id="settings-shuffle-sections" label="Shuffle sections" checked={form.shuffleSections} onChange={(e) => setForm((f) => ({ ...f, shuffleSections: e.target.checked }))} />
          <Checkbox id="settings-negative-marking" label="Negative marking" checked={form.negativeMarkingEnabled} onChange={(e) => setForm((f) => ({ ...f, negativeMarkingEnabled: e.target.checked }))} />
          <Checkbox id="settings-free" label="Free test" checked={form.isFree} onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))} />
        </div>
      </form>
    </Modal>
  );
}