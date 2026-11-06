'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Settings, Save } from 'lucide-react';
import { FormSection, FormActionBar, InlineAlert, SummaryList } from '@/components/admin/AdminUi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
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

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer select-none items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

export function MockTestForm({ seriesId, seriesTitle, categoryName }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.durationMinutes || Number(form.durationMinutes) <= 0) next.durationMinutes = 'Enter a valid duration';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e, saveAndContinue) => {
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
      if (saveAndContinue) {
        router.push(`/admin-dashboard/tests/${created.id}/sections/new`);
      } else {
        router.push(`/admin-dashboard/tests/${created.id}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create mock test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection
            icon={FileText}
            tone="indigo"
            title="Basic information"
            description="Enter the main details and configuration for this mock test."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Input
                  id="test-title"
                  label="Title"
                  placeholder="e.g. GATE 2025 – Practice Test 1"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  error={errors.title}
                />
              </div>
              <Input
                id="test-duration"
                label="Duration (minutes)"
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                error={errors.durationMinutes}
              />
            </div>
            <Textarea
              id="test-instructions"
              label="Instructions (shown to students before starting the test)"
              rows={5}
              placeholder="This is a full length practice test. Read all instructions carefully."
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </FormSection>

          <FormSection
            icon={Settings}
            tone="slate"
            title="Test settings"
            description="Configure additional settings for this mock test."
            bodyClassName="divide-y divide-slate-100 py-1 dark:divide-slate-800"
          >
            <Toggle
              checked={form.isFree}
              onChange={(v) => setForm((f) => ({ ...f, isFree: v }))}
              label="Free Test"
              description="Can be attempted without payment"
            />
            <Toggle
              checked={form.negativeMarkingEnabled}
              onChange={(v) => setForm((f) => ({ ...f, negativeMarkingEnabled: v }))}
              label="Negative Marking"
              description="Enable negative marking for wrong answers"
            />
            <Toggle
              checked={form.isSectionOrderStrict}
              onChange={(v) => setForm((f) => ({ ...f, isSectionOrderStrict: v }))}
              label="Section Order Strict"
              description="Prevent skipping between sections"
            />
            <Toggle
              checked={form.shuffleSections}
              onChange={(v) => setForm((f) => ({ ...f, shuffleSections: v }))}
              label="Shuffle Sections"
              description="Randomize section order for each attempt"
            />
          </FormSection>
        </div>

        {/* Live preview sidebar */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <FormSection title="Test preview" description="Summary of what you are creating.">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                <FileText size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{form.title || 'Untitled test'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{seriesTitle}</p>
              </div>
              <Badge tone="neutral" className="ml-auto shrink-0">Draft</Badge>
            </div>
            <SummaryList
              items={[
                ['Category', categoryName || '—'],
                ['Duration', `${form.durationMinutes || 0} minutes`],
                ['Negative marking', form.negativeMarkingEnabled ? 'Enabled' : 'Disabled'],
                ['Free test', form.isFree ? 'Yes' : 'No'],
                ['Shuffle sections', form.shuffleSections ? 'Yes' : 'No'],
              ]}
            />
          </FormSection>

          <InlineAlert tone="info" title="What's next?">
            Sections and questions are added after the test is created — use &quot;Create &amp; Add Sections&quot; to jump straight there.
          </InlineAlert>
        </div>
      </div>

      <FormActionBar hint="New tests start as drafts until you publish them.">
        <Button type="button" variant="outline" onClick={() => router.push(`/admin-dashboard/series/${seriesId}`)} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" variant="outline" isLoading={saving} onClick={(e) => handleSubmit(e, false)}>
          <Save size={16} className="mr-2" />
          Save as Draft
        </Button>
        <Button type="button" isLoading={saving} onClick={(e) => handleSubmit(e, true)}>
          Create &amp; Add Sections
        </Button>
      </FormActionBar>
    </form>
  );
}
