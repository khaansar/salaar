'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

export function SectionSettingsModal({ open, onClose, section, onSaved }) {
  const [form, setForm] = useState({ title: '', durationMinutes: '', shuffleQuestions: false });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({
        title: section?.title || '',
        durationMinutes: section?.durationMinutes || '',
        shuffleQuestions: section?.shuffleQuestions || false,
        enableNegativeMarks: section?.defaultNegativeMarks != null,
        defaultNegativeMarks: section?.defaultNegativeMarks || '0.5',
      });
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
      await sectionsApi.update(section.sectionId, {
        title: form.title.trim(),
        durationMinutes: Number(form.durationMinutes),
        shuffleQuestions: form.shuffleQuestions,
        defaultNegativeMarks: form.enableNegativeMarks ? Number(form.defaultNegativeMarks) : null,
      });
      toast.success('Section updated');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Section settings" footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} isLoading={saving}>Save changes</Button>
      </>
    }>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id={`settings-title-${section?.sectionId}`} label="Title" placeholder="e.g. Quantitative Aptitude" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} error={errors.title} />
        <Input id={`settings-duration-${section?.sectionId}`} label="Duration (minutes)" type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} error={errors.durationMinutes} />
        <Checkbox id={`settings-shuffle-${section?.sectionId}`} label="Shuffle questions for each student" checked={form.shuffleQuestions} onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))} />
        
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <Checkbox 
            id={`settings-neg-enable-${section?.sectionId}`} 
            label="Enable default negative marking" 
            checked={form.enableNegativeMarks} 
            onChange={(e) => setForm((f) => ({ ...f, enableNegativeMarks: e.target.checked }))} 
          />
          {form.enableNegativeMarks && (
            <div className="pl-6">
              <Input 
                id={`settings-neg-val-${section?.sectionId}`} 
                label="Negative mark value (deduction)" 
                type="number" 
                min="0" 
                step="0.01"
                placeholder="e.g. 0.5" 
                value={form.defaultNegativeMarks} 
                onChange={(e) => setForm((f) => ({ ...f, defaultNegativeMarks: e.target.value.replace('-', '') }))} 
                error={errors.defaultNegativeMarks} 
                helpText="This will override the negative marks for all current and future questions in this section."
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}