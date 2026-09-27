'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';

const emptyForm = {
  title: '',
  durationMinutes: '',
  shuffleQuestions: false,
  enableNegativeMarks: false,
  defaultNegativeMarks: '0.5',
};

export function SectionSettingsModal({ open, onClose, section, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // The modal component stays mounted between opens (only its rendered
  // content toggles), so its form state needs to be re-seeded from the
  // current `section` every time it's opened.
  useEffect(() => {
    if (!open) return;
    setForm({
      title: section?.title || '',
      durationMinutes: section?.durationMinutes || '',
      shuffleQuestions: section?.shuffleQuestions || false,
      enableNegativeMarks: section?.defaultNegativeMarks != null,
      defaultNegativeMarks: section?.defaultNegativeMarks != null ? String(section.defaultNegativeMarks) : '0.5',
    });
    setErrors({});
  }, [open, section]);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Section title is required';
    if (form.durationMinutes !== '' && Number(form.durationMinutes) <= 0) {
      next.durationMinutes = 'Enter a valid duration, or leave empty for no sectional limit';
    }
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
        durationMinutes: form.durationMinutes === '' ? undefined : Number(form.durationMinutes),
        shuffleQuestions: form.shuffleQuestions,
        defaultNegativeMarks: form.enableNegativeMarks ? Number(form.defaultNegativeMarks) : null,
      });
      toast.success('Section updated');
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.message || 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Section settings"
      description="Update this section's details and behavior."
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="section-settings-form" isLoading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="section-settings-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="settings-title"
          label="Section Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
        />
        <Input
          id="settings-duration"
          label="Duration (minutes)"
          type="number"
          min="1"
          placeholder="Leave empty if no sectional time limit"
          value={form.durationMinutes}
          onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
          error={errors.durationMinutes}
        />
        <Checkbox
          id="settings-shuffle"
          label="Shuffle questions for each attempt"
          checked={form.shuffleQuestions}
          onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))}
        />
        <div className="pt-2 border-t border-slate-100">
          <Checkbox
            id="settings-enable-negative"
            label="Enable default negative marking"
            checked={form.enableNegativeMarks}
            onChange={(e) => setForm((f) => ({ ...f, enableNegativeMarks: e.target.checked }))}
          />
          {form.enableNegativeMarks && (
            <div className="mt-3">
              <Input
                id="settings-negative-marks"
                label="Default negative marks"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 0.5"
                value={form.defaultNegativeMarks}
                onChange={(e) => setForm((f) => ({ ...f, defaultNegativeMarks: e.target.value.replace('-', '') }))}
                error={errors.defaultNegativeMarks}
                helpText="Automatically applied to questions added to this section."
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}