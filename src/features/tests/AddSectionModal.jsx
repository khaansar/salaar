'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = { title: '', durationMinutes: 30, shuffleQuestions: false };

export function AddSectionModal({ open, onClose, testId, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Section title is required';
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) next.durationMinutes = 'Enter a valid duration';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await sectionsApi.create(testId, {
        title: form.title.trim(),
        durationMinutes: Number(form.durationMinutes),
        shuffleQuestions: form.shuffleQuestions,
      });
      toast.success('Section created');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New section"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={saving}>
            Create section
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="section-title"
          label="Title"
          placeholder="e.g. Quantitative Aptitude"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
        />
        <Input
          id="section-duration"
          label="Duration (minutes)"
          type="number"
          min="1"
          value={form.durationMinutes}
          onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          error={errors.durationMinutes}
        />
        <Checkbox
          id="section-shuffle"
          label="Shuffle questions for each student"
          checked={form.shuffleQuestions}
          onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))}
        />
      </form>
    </Modal>
  );
}
