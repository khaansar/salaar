'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Settings, Clock, Shuffle, Save } from 'lucide-react';
import { FormSection, FormActionBar } from '@/components/admin/AdminUi';
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

export function SectionForm({ testId, testTitle, existingSections = [] }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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
      await sectionsApi.create(testId, {
        title: form.title.trim(),
        durationMinutes: form.durationMinutes === '' ? undefined : Number(form.durationMinutes),
        shuffleQuestions: form.shuffleQuestions,
        defaultNegativeMarks: form.enableNegativeMarks ? Number(form.defaultNegativeMarks) : null,
      });
      toast.success('Section created');
      router.push(`/admin-dashboard/tests/${testId}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  const nextOrder = existingSections.length + 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection icon={Layers} tone="violet" title="Section details" description="Basic information for this section.">
            <Input
              id="section-title"
              label="Section Title"
              placeholder="e.g. Mathematics"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
              helpText={`This will be section ${nextOrder} of ${testTitle}. You can reorder sections afterward.`}
            />
          </FormSection>

          <FormSection icon={Settings} tone="emerald" title="Configuration" description="Set a time limit and behavior for this section.">
            <Input
              id="section-duration"
              label="Duration (minutes)"
              type="number"
              min="1"
              placeholder="Leave empty if no sectional time limit"
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              error={errors.durationMinutes}
              leftIcon={<Clock size={15} />}
            />
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <Checkbox
                id="section-shuffle"
                label="Shuffle questions for each attempt"
                checked={form.shuffleQuestions}
                onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))}
              />
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <Checkbox
                id="section-enable-negative"
                label="Enable default negative marking"
                checked={form.enableNegativeMarks}
                onChange={(e) => setForm((f) => ({ ...f, enableNegativeMarks: e.target.checked }))}
              />
              {form.enableNegativeMarks && (
                <div className="mt-3">
                  <Input
                    id="section-negative-marks"
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
          </FormSection>
        </div>

        {/* Live preview sidebar */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <FormSection title="Section preview" description="How this section will appear to students.">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Layers size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{form.title || `Section ${nextOrder}`}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Section {nextOrder}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {form.durationMinutes ? `${form.durationMinutes} mins` : 'No time limit'}
              </span>
              {form.shuffleQuestions && (
                <span className="inline-flex items-center gap-1">
                  <Shuffle size={12} /> Shuffled
                </span>
              )}
              {form.enableNegativeMarks && form.defaultNegativeMarks && (
                <span className="inline-flex items-center gap-1">
                  Default −{form.defaultNegativeMarks} marks
                </span>
              )}
            </div>
          </FormSection>

          <FormSection title="Test structure" description={testTitle}>
            <div className="space-y-2">
              {existingSections.map((s, i) => (
                <div key={s.sectionId} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm text-slate-700 dark:text-slate-300">{s.title}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2 dark:border-indigo-500/40 dark:bg-indigo-500/10">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                  {nextOrder}
                </span>
                <span className="truncate text-sm font-medium text-indigo-700 dark:text-indigo-300">{form.title || 'New section'}</span>
              </div>
            </div>
          </FormSection>
        </div>
      </div>

      <FormActionBar hint="You can add questions to the section right after creating it.">
        <Button type="button" variant="outline" onClick={() => router.push(`/admin-dashboard/tests/${testId}`)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          <Save size={16} className="mr-2" />
          Create Section
        </Button>
      </FormActionBar>
    </form>
  );
}
