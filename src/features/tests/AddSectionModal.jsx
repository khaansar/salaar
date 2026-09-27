'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = { title: '', durationMinutes: 30, shuffleQuestions: false, enableNegativeMarks: false, defaultNegativeMarks: '0.5' };

export function AddSectionModal({ open, onClose, testId, onCreated }) {
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
    if (!form.title.trim()) next.title = 'Section title is required';
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) next.durationMinutes = 'Enter a valid duration';
    if (form.enableNegativeMarks && (!form.defaultNegativeMarks || Number(form.defaultNegativeMarks) < 0)) {
      next.defaultNegativeMarks = 'Enter a valid positive number (e.g. 0.5)';
    }
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
        defaultNegativeMarks: form.enableNegativeMarks ? Number(form.defaultNegativeMarks) : null,
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
    <Modal open={open} onClose={onClose} title="New section" footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={saving}>Create section</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="section-title" label="Title" placeholder="e.g. Quantitative Aptitude" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input id="section-duration" label="Duration (minutes)" type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} error={errors.durationMinutes} />
        <Checkbox id="section-shuffle" label="Shuffle questions for each student" checked={form.shuffleQuestions} onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))} />
        
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <Checkbox 
            id="section-neg-enable" 
            label="Enable default negative marking" 
            checked={form.enableNegativeMarks} 
            onChange={(e) => setForm((f) => ({ ...f, enableNegativeMarks: e.target.checked }))} 
          />
          {form.enableNegativeMarks && (
            <div className="pl-6">
              <Input 
                id="section-neg-val" 
                label="Negative mark value (deduction)" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="e.g. 0.5" 
                value={form.defaultNegativeMarks} 
                onChange={(e) => setForm((f) => ({ ...f, defaultNegativeMarks: e.target.value.replace('-', '') }))} 
                error={errors.defaultNegativeMarks} 
                helpText="This will automatically be applied to all questions added to this section."
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}