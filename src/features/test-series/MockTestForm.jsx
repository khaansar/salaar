'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Settings, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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
    <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer select-none">
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description && <span className="block text-xs text-slate-500 mt-0.5">{description}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
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
    <form onSubmit={(e) => handleSubmit(e, false)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Basic Information</h2>
              <p className="text-sm text-slate-500 mt-0.5">Enter the main details and configuration for this mock test.</p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              id="test-title"
              label="Title"
              placeholder="e.g. GATE 2025 – Practice Test 1"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <Input
              id="test-duration"
              label="Duration (minutes)"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              error={errors.durationMinutes}
            />
            <Textarea
              id="test-instructions"
              label="Instructions (shown to students before starting the test)"
              rows={5}
              placeholder="This is a full length practice test. Read all instructions carefully."
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Test Settings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure additional settings for this mock test.</p>
            </div>
          </CardHeader>
          <CardBody className="divide-y divide-slate-100">
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
          </CardBody>
        </Card>

        <div className="flex items-center justify-end gap-3">
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
        </div>
      </div>

      {/* Live preview sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-900">Test Preview</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{form.title || 'Untitled test'}</p>
                <p className="text-xs text-slate-500 truncate">{seriesTitle}</p>
              </div>
              <Badge tone="neutral" className="ml-auto shrink-0">Draft</Badge>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Category</dt>
                <dd className="font-medium text-slate-800">{categoryName || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Duration</dt>
                <dd className="font-medium text-slate-800">
                  {form.durationMinutes || 0} minutes
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Negative Marking</dt>
                <dd className="font-medium text-slate-800">{form.negativeMarkingEnabled ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Free Test</dt>
                <dd className="font-medium text-slate-800">{form.isFree ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Shuffle Sections</dt>
                <dd className="font-medium text-slate-800">{form.shuffleSections ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-sm text-slate-600 space-y-2">
            <p className="font-medium text-slate-800">What&apos;s next?</p>
            <p>Sections and questions are added after the test is created — use &quot;Create &amp; Add Sections&quot; to jump straight there.</p>
          </CardBody>
        </Card>
      </div>
    </form>
  );
}