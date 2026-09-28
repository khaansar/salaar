'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Settings, Clock, Shuffle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Section Details</h2>
              <p className="text-sm text-slate-500 mt-0.5">Basic information for this section.</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              id="section-title"
              label="Section Title"
              placeholder="e.g. Mathematics"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <p className="text-xs text-slate-500 -mt-2">
              This will be section <strong>{nextOrder}</strong> of {testTitle}. Sections are numbered in the order
              you create them — drag to reorder afterward.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Configuration</h2>
              <p className="text-sm text-slate-500 mt-0.5">Set a time limit and behavior for this section.</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
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
            <div className="pt-1">
              <Checkbox
                id="section-shuffle"
                label="Shuffle questions for each attempt"
                checked={form.shuffleQuestions}
                onChange={(e) => setForm((f) => ({ ...f, shuffleQuestions: e.target.checked }))}
              />
            </div>
            <div className="pt-3 border-t border-slate-100">
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
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin-dashboard/tests/${testId}`)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Create Section
          </Button>
        </div>
      </div>

      {/* Live preview sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Section Preview</h2>
            <p className="text-sm text-slate-500 mt-0.5">How this section will appear to students.</p>
          </CardHeader>
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{form.title || `Section ${nextOrder}`}</p>
                <p className="text-xs text-slate-500 mt-0.5">Section {nextOrder}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
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
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Test Structure Preview</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm font-medium text-slate-900 mb-3">{testTitle}</p>
            <div className="space-y-2">
              {existingSections.map((s, i) => (
                <div key={s.sectionId} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 truncate">{s.title}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {nextOrder}
                </span>
                <span className="text-sm font-medium text-indigo-700 truncate">{form.title || 'New section'}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </form>
  );
}