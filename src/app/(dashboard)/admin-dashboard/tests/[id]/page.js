'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Plus,
  Eye,
  Send,
  Archive,
  RotateCcw,
  Copy,
  Clock,
  ListChecks,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, EmptyState } from '@/components/ui/EmptyState';
import { TestSettingsModal } from '@/features/tests/TestSettingsModal';
import { AddSectionModal } from '@/features/tests/AddSectionModal';
import { SectionCard } from '@/features/tests/SectionCard';
import { TestPreviewDrawer } from '@/features/tests/TestPreviewDrawer';
import { mockTestsApi, sectionsApi } from '@/services/adminService';
import { useToast } from '@/components/common/ToastProvider';
import { STATUS_BADGE_STYLES } from '@/constants/enums';

export default function TestBuilderPage({ params }) {
  // Next.js 16: route params are async, unwrap with React's use()
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();

  const [test, setTest] = useState(null); // AdminMockTestDetailDto (status, updatedAt, settings)
  const [blueprint, setBlueprint] = useState(null); // TestBlueprintDto (full sections + questions)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneTitle, setCloneTitle] = useState('');
  const [cloning, setCloning] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sectionReordering, setSectionReordering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [testData, blueprintData] = await Promise.all([mockTestsApi.get(id), mockTestsApi.answerKey(id)]);
      setTest(testData);
      setBlueprint(blueprintData);
    } catch (err) {
      setError(err?.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const sections = blueprint?.sections || [];

  const moveSection = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSectionReordering(true);
    try {
      await sectionsApi.reorderSections(id, next.map((s) => s.sectionId));
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to reorder sections');
    } finally {
      setSectionReordering(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    try {
      await mockTestsApi.publish(id, test.updatedAt);
      toast.success('Test published');
      setPublishConfirmOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to publish test');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      await mockTestsApi.archive(id);
      toast.success('Test archived');
      setArchiveConfirmOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to archive test');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevert = async () => {
    setActionLoading(true);
    try {
      await mockTestsApi.revertToDraft(id);
      toast.success('Test reverted to draft');
      setRevertConfirmOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.message || 'Failed to revert test');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClone = async () => {
    setCloning(true);
    try {
      const cloned = await mockTestsApi.clone(id, cloneTitle.trim() || undefined);
      toast.success('Test cloned');
      setCloneOpen(false);
      router.push(`/admin-dashboard/tests/${cloned.id}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to clone test');
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <TableSkeleton rows={4} cols={1} />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-5xl mx-auto">
        <ErrorState message={error || 'Test not found'} onRetry={load} />
      </div>
    );
  }

  const canPublish = test.status === 'DRAFT' && sections.length > 0;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <PageHeader
        breadcrumbs={[{ label: 'Admin', href: '/admin-dashboard' }, { label: test.title }]}
        title={test.title}
        subtitle={
          <span className="inline-flex items-center gap-3">
            <Badge className={STATUS_BADGE_STYLES[test.status]}>{test.status}</Badge>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock size={13} /> {test.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ListChecks size={13} /> {test.totalMarks ?? 0} marks
            </span>
          </span>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye size={16} className="mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCloneTitle(`${test.title} (copy)`);
                setCloneOpen(true);
              }}
            >
              <Copy size={16} className="mr-2" />
              Clone
            </Button>
            {test.status === 'DRAFT' && (
              <Button onClick={() => setPublishConfirmOpen(true)} disabled={!canPublish}>
                <Send size={16} className="mr-2" />
                Publish
              </Button>
            )}
            {test.status === 'PUBLISHED' && (
              <Button variant="dangerOutline" onClick={() => setArchiveConfirmOpen(true)}>
                <Archive size={16} className="mr-2" />
                Archive
              </Button>
            )}
            {test.status === 'ARCHIVED' && (
              <Button variant="outline" onClick={() => setRevertConfirmOpen(true)}>
                <RotateCcw size={16} className="mr-2" />
                Revert to draft
              </Button>
            )}
          </>
        }
      />

      {test.status !== 'DRAFT' && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This test is <strong>{test.status.toLowerCase()}</strong>. Structural changes (sections/questions) are still
          available here, but consider the impact on students who may already be attempting it.
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Sections</h2>
        <Button onClick={() => setAddSectionOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <EmptyState
            title="No sections yet"
            description="Add a section to start attaching questions to this test."
            actionLabel="Add section"
            onAction={() => setAddSectionOpen(true)}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <SectionCard
              key={section.sectionId}
              section={section}
              testId={id}
              isFirst={i === 0 || sectionReordering}
              isLast={i === sections.length - 1 || sectionReordering}
              onMoveUp={() => moveSection(i, -1)}
              onMoveDown={() => moveSection(i, 1)}
              onChanged={load}
            />
          ))}
        </div>
      )}

      <TestSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} test={test} onSaved={load} />
      <AddSectionModal open={addSectionOpen} onClose={() => setAddSectionOpen(false)} testId={id} onCreated={load} />
      <TestPreviewDrawer open={previewOpen} onClose={() => setPreviewOpen(false)} testId={id} testStatus={test.status} />

      <Modal
        open={cloneOpen}
        onClose={() => setCloneOpen(false)}
        title="Clone test"
        description="Creates a copy of this test including its sections and questions."
        footer={
          <>
            <Button variant="outline" onClick={() => setCloneOpen(false)} disabled={cloning}>
              Cancel
            </Button>
            <Button onClick={handleClone} isLoading={cloning}>
              Clone test
            </Button>
          </>
        }
      >
        <Input label="New title (optional)" value={cloneTitle} onChange={(e) => setCloneTitle(e.target.value)} />
      </Modal>

      <ConfirmDialog
        open={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        onConfirm={handlePublish}
        isLoading={actionLoading}
        tone="warning"
        title="Publish this test?"
        description="Once published, students will be able to take this test. You can still edit sections and questions afterward."
        confirmLabel="Publish"
      />

      <ConfirmDialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        onConfirm={handleArchive}
        isLoading={actionLoading}
        title="Archive this test?"
        description="Archived tests are hidden from students but can be reverted to draft later."
        confirmLabel="Archive"
      />

      <ConfirmDialog
        open={revertConfirmOpen}
        onClose={() => setRevertConfirmOpen(false)}
        onConfirm={handleRevert}
        isLoading={actionLoading}
        tone="warning"
        title="Revert to draft?"
        description="The test will no longer be visible to students until it is published again."
        confirmLabel="Revert"
      />
    </div>
  );
}
